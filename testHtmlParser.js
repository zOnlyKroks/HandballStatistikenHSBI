"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var htmlParser_1 = require("./htmlParser");
function testHtmlParser() {
    var fileName = '24-25_1_15.09.2025_TSG Altenhagen-Heepen 4_Gymnasium Heepen.html';
    var filePath = path.join(__dirname, 'data', fileName);
    var parser = new htmlParser_1.htmlParser(fileName);
    // Ausgabe des Verzeichnisses und des vollständigen Dateipfads
    console.log('Verzeichnis:', __dirname);
    console.log('Vollständiger Dateipfad:', filePath);
    // Testen der parseFileName-Methode
    var parsedFileName = parser.parseFileName(fileName);
    // Testen der parseTable-Methode
    var dataSets = parser.parseTable();
    console.log('Parsed Data Sets:', dataSets);
}
// Testfunktion ausführen
testHtmlParser();
