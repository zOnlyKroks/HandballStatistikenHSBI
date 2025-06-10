import * as mysql from "mysql2/promise";
import { htmlParser } from './htmlParser'; // Importiere die htmlParser-Klasse
import { dataSet } from './dataSet'; // Importiere die dataSet-Klasse
import * as fs from 'fs';
import * as path from 'path';


const pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "no-password",
    database: "handball",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

async function fillDatabase(Spielsituation: dataSet) {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    //const set : dataSet = new dataSet("", "", "");

    await conn.execute('INSERT IGNORE INTO Spielsituation (Zeitstempel, Name, Aktion, ) VALUES (?,?,?)', [
        Spielsituation.getTimeStamp, Spielsituation.getPlayerName, Spielsituation.getGameAction
    ])

    await conn.commit();
    await conn.release();
}

// Funktion zum Überprüfen der Datenbank
async function checkDatabase(parsedData: { saison: string, spieltag: string, datum: string, gegner: string, spielort: string }, pool: mysql.Pool): Promise<boolean> {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
        const { saison, spieltag, datum, gegner, spielort } = parsedData;
        const [rows] = await conn.execute<any[]>(
        'SELECT * FROM spielberichte WHERE Saison = ? AND Spieltag = ? AND Datum = ? AND Gegner = ? AND Spielort = ?',
        [saison, spieltag, datum, gegner, spielort]
        );

        await conn.commit();

        if (rows.length > 0) {
            return true; // Ein Eintrag existiert
        } else {
            return false; // Kein Eintrag gefunden
        }
    } catch (error) {
        console.error(`Fehler bei der Datenbankabfrage: ${(error as Error).message}`);
        await conn.rollback();
        return false; // Gibt false zurück im Fehlerfall
    } finally {
        await conn.release();
    }
    }

// Funktion, um Dateinamen aus einem Ordner zu lesen
function readFileNamesFromDirectory(directoryPath: string): string[] {
    try {
        // Lese alle Dateien im angegebenen Verzeichnis
        const files = fs.readdirSync(directoryPath);

        // Erstelle eine Liste der Dateinamen
        const fileNames = files.map(file => path.basename(file));

        // Zurückgeben der Liste
        return fileNames;
    } catch (error) {
        console.error('Fehler beim Lesen des Verzeichnisses:', error);
        return [];
    }
}

function main(){
    // Setzen des Ordners, in dem die Daten sind
    const filePath = path.join(__dirname, 'data');
    // Lesen aller Dateinamen in dem Ordner
    const fileList = readFileNamesFromDirectory(filePath);
    console.log('Dateien in data:',fileList);

    for (const file in fileList){
        console.log(fileList[file]);
        const parser = new htmlParser(fileList[file]);
        const dataSetList = parser.parseTable();

        /*
        MISSING:
        - SQL-CHECK ob Tabelle Spielbericht existiert und CREATE falls nicht // Vielleicht weiter oben sinnvoller?

        - SQL-CHECK ob Spielbericht für dieses Spiel bereits existiert und INSERT falls nicht
            -> Wenn bereits existiert diese Datei ignorieren und nächste nehmen
        */

        for(const dataSet in dataSetList){
            console.log(dataSetList[dataSet]);
            /*
            MISSING:
            - SQL-CHECK ob Tabelle Spielsituationen existiert und CREATE / ERROR falls nicht// Vielleicht weiter oben sinnvoller?

            MAYBE MISSING:
            - SQL-CHECK ob Spielsituationen für dieses Spiel bereits existiert und INSERT falls nicht
            - INSERT der Spielsituation mit:fillDatabase(dataSetList[dataSet]); 
            */
        }
    } 
    return 0;
}

main();
/* 
1. Unterordner "data" öffnen wo alle Spieldateien (score) mit korrektem Namen liegen Schema:
    Saison_Spieltag_Datum_Gegner_Spielort.html
    Beispiel:
    24-25_17_11.04.2025_TV Häver_Häver.html

2. Dateien durchiterieren:
    Daten aus dem Namen extrahieren und gegen die Datenbank abgleichen
    Falls schon vorhanden -> datei ignorieren
    Falls nicht vorhanden -> neuen eintrag in der tabelle Spielbericht erstellen mit Infos aus dem Titel der Datei (Was ist mit FK's? als gegeben annehmen oder auch im Dateinamen hinterlegen?)
                          -> UND tabelle in der Datei Parsen und die zurückgegebene Liste an Spielsituationen in die Datenbank feuern
    
3. 
*/