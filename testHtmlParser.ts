import * as path from 'path';
import { htmlParser } from './htmlParser';

function testHtmlParser() {
  const fileName = '24-25_1_15.09.2025_TSG Altenhagen-Heepen 4_Gymnasium Heepen.html';
  const filePath = path.join(__dirname, 'data', fileName);
  const parser = new htmlParser(fileName);

  // Ausgabe des Verzeichnisses und des vollständigen Dateipfads
  console.log('Verzeichnis:', __dirname);
  console.log('Vollständiger Dateipfad:', filePath);
  
  // Testen der parseFileName-Methode
  const parsedFileName = parser.parseFileName(fileName);
  
  // Testen der parseTable-Methode
  const dataSets = parser.parseTable();
  console.log('Parsed Data Sets:', dataSets);

  
  
}

// Testfunktion ausführen
testHtmlParser();
