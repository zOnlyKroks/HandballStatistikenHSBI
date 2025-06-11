import { parse } from "node-html-parser";
import * as fs from "fs";
import { dataSet } from "./dataSet";

export class htmlParser {
  private htmlContent!: string;

  constructor(filePath: string) {
    this.htmlContent = this.readHtmlFile(filePath);
  }

  private readHtmlFile(filePath: string): string {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      return content;
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error(`Fehler beim Lesen der Datei: ${errorMessage}`);
      return "";
    }
  }
  public parseTable(): dataSet[] {
    const root = parse(this.htmlContent);
    const tableRows = root.querySelectorAll("tbody tr");
    const dataSetList: dataSet[] = [];

    for (const row of tableRows) {
      const cells = row.querySelectorAll("td");

      if (cells.length >= 4) {
        const timestamp = cells[0].text.trim();
        const playerName = cells[2].text.trim();
        const action = cells[3].text.trim();

        const oneDataSet = new dataSet(timestamp, playerName, action);
        dataSetList.push(oneDataSet);
      }
    }

    return dataSetList;
  }

  public parseFileName(fileName: string): {
    saison: string;
    spieltag: string;
    datum: string;
    gegner: string;
    spielort: string;
  } | null {
    const baseName = fileName.replace(".html", "");
    const parts = baseName.split("_");

    if (parts.length !== 5) {
      console.error("Der Dateiname hat nicht die erwartete Struktur.");
      return null;
    }

    const [saison, spieltag, datum, gegner, spielort] = parts;

    console.log("Gelesener Dateinameninfos: ");
    console.log(
      saison,
      " | ",
      spieltag,
      " | ",
      datum,
      " | ",
      gegner,
      " | ",
      spielort
    );

    return {
      saison,
      spieltag,
      datum,
      gegner,
      spielort,
    };
  }
}
