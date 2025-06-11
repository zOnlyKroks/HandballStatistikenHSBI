import * as mysql from "mysql2/promise";
import { htmlParser } from "./htmlParser";
import * as fs from "fs";
import * as path from "path";
import { dataSet } from "./dataSet";

function readFileNamesFromDirectory(directoryPath: string): string[] {
  try {
    const files = fs.readdirSync(directoryPath);
    const fileNames = files.map((file) => path.basename(file));
    return fileNames;
  } catch (error) {
    console.error("Fehler beim Lesen des Verzeichnisses:", error);
    return [];
  }
}

async function handleInsertDataSet(
  connection: mysql.Connection,
  dataSet: dataSet,
  gameReportId: number
): Promise<void> {
  try {
    const gameAction = dataSet.getGameAction();
    const playerName = dataSet.getPlayerName();
    const timeStamp = dataSet.getTimeStamp();

    if (!gameAction) {
      console.error("Game action is missing or undefined");
      return;
    }

    if (!playerName) {
      console.error("Player name is missing or undefined");
      return;
    }

    if (timeStamp === undefined || timeStamp === null) {
      console.error("Timestamp is missing or undefined");
      return;
    }

    // Query action ID from GameActions Table
    const actionQuery = `SELECT id_action FROM GameActions WHERE action_name = ?`;
    const [actionRows] = await connection.execute(actionQuery, [gameAction]);

    if (!Array.isArray(actionRows) || actionRows.length === 0) {
      console.error("Keine passende Action gefunden für:", gameAction);
      return;
    }

    const actionId = (actionRows[0] as any).id_action;

    const playerNameParts = playerName.trim().split(" ");
    const firstName = playerNameParts[0] || "";
    const lastName =
      playerNameParts.length > 1 ? playerNameParts.slice(1).join(" ") : "";

    const insertGameSituationQuery = `
      INSERT INTO GameSituation (game_report_id, action_id, timestamp, first_name, last_name)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [gameReportId, actionId, timeStamp, firstName, lastName];

    const hasUndefined = values.some((value) => value === undefined);
    if (hasUndefined) {
      console.error("One or more values are undefined:", values);
      throw new Error("Cannot insert undefined values into database");
    }

    const [result] = await connection.execute(insertGameSituationQuery, values);
    console.log("Datensatz erfolgreich eingefügt:", result);
  } catch (error) {
    console.error("Fehler beim Einfügen des Datensatzes:", error);
    throw error; // Re-throw to handle in transaction
  }
}

function convertSeasonToInt(seasonString: string): number {
  const parts = seasonString.split("-");
  if (parts.length !== 2) {
    throw new Error(`Invalid season format: ${seasonString}`);
  }
  return parseInt(parts[0] + parts[1], 10);
}

export async function conditionallyCreateSpielbericht(
  connection: mysql.Connection,
  fileName: string
): Promise<number> {
  const base = path.basename(fileName, path.extname(fileName));
  const parts = base.split("_");

  if (parts.length < 6) {
    throw new Error(`Filename "${fileName}" isn't in the expected format.`);
  }

  const teamName = parts[0]; // e.g. "VfL Herford 2"
  const saisonString = parts[1]; // e.g. "24-25"
  const saison = convertSeasonToInt(saisonString); // Convert to 2425
  const spieltag = parseInt(parts[2], 10);
  const [day, month, year] = parts[3].split(".");

  if (!day || !month || !year) {
    throw new Error(`Date part "${parts[3]}" isn't DD.MM.YYYY`);
  }

  const datum = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const gegner = parts[4];
  const spielort = parts.slice(5).join(" ");

  const teamQuery = `SELECT id FROM Mannschaft WHERE name = ?`;
  const [teamRows] = await connection.execute(teamQuery, [teamName]);

  if (!Array.isArray(teamRows) || teamRows.length === 0) {
    throw new Error(`No team found with name: ${teamName}`);
  }

  const mannschaftId = (teamRows[0] as any).id;

  const [rows]: any[] = await connection.query(
    `SELECT idSpiel
     FROM Spielbericht
     WHERE Mannschaft_id = ?
       AND Spieltag = ?
       AND Saison = ?
       AND Datum = ?
       AND Gegner = ?
       AND Spielort = ?`,
    [mannschaftId, spieltag, saison, datum, gegner, spielort]
  );

  if (rows.length > 0) {
    return rows[0].idSpiel;
  }

  const [result]: any = await connection.query(
    `INSERT INTO Spielbericht
     (Mannschaft_id, Spieltag, Saison, Datum, Gegner, Spielort)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [mannschaftId, spieltag, saison, datum, gegner, spielort]
  );

  return result.insertId as number;
}

export async function importDataSets(pool: mysql.Pool): Promise<number> {
  const dataDir = path.join(__dirname, "../../data");
  const fileList = readFileNamesFromDirectory(dataDir);

  let processedFiles = 0;

  const connection = await pool.getConnection();

  await connection.execute("DELETE FROM GameSituation");
  await connection.execute("DELETE FROM Spielbericht");

  await connection.execute("ALTER TABLE GameSituation AUTO_INCREMENT = 1");
  await connection.execute("ALTER TABLE Spielbericht AUTO_INCREMENT = 1");

  connection.commit();
  connection.release();

  for (const file of fileList) {
    console.log("→ Processing:", file);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const fullPath = path.join(dataDir, file);
      const parser = new htmlParser(fullPath);
      let dataSetList: dataSet[];

      try {
        dataSetList = parser.parseTable();
        console.log(`Found ${dataSetList.length} data sets in ${file}`);
      } catch (err) {
        console.error("Fehler beim Lesen der Datei:", file, err);
        await connection.rollback();
        continue;
      }

      let gameReportId: number;
      try {
        gameReportId = await conditionallyCreateSpielbericht(connection, file);
      } catch (err) {
        console.error("Fehler beim Anlegen des Spielberichts:", file, err);
        await connection.rollback();
        continue;
      }

      let insertedCount = 0;
      for (const dataSet of dataSetList) {
        try {
          await handleInsertDataSet(connection, dataSet, gameReportId);
          insertedCount++;
        } catch (err) {
          console.error(`Failed to insert data set ${insertedCount + 1}:`, err);
        }
      }

      await connection.commit();
      processedFiles++;
      console.log(
        `✓ Successfully processed: ${file} (${insertedCount}/${dataSetList.length} records inserted)`
      );
    } catch (error) {
      await connection.rollback();
      console.error(`✗ Failed to process: ${file}`, error);
    } finally {
      connection.release();
    }
  }

  console.log(
    `Processed ${processedFiles}/${fileList.length} files successfully.`
  );
  return processedFiles;
}
