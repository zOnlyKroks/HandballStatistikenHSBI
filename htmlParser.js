"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlParser = void 0;
var node_html_parser_1 = require("node-html-parser");
var fs = require("fs");
var path = require("path");
var dataSet_1 = require("./dataSet"); // Importiere die dataSet-Klasse
var htmlParser = /** @class */ (function () {
    //Möglichkeit für infos aus dem filename als attribute
    function htmlParser(fileName) {
        var filePath = path.join(__dirname, 'data', fileName);
        this.htmlContent = this.readHtmlFile(filePath);
    }
    htmlParser.prototype.readHtmlFile = function (filePath) {
        try {
            var content = fs.readFileSync(filePath, 'utf8');
            return content;
        }
        catch (error) {
            // Typumwandlung von 'unknown' zu 'Error', um die Fehlermeldung zu extrahieren
            var errorMessage = error.message;
            console.error("Fehler beim Lesen der Datei: ".concat(errorMessage));
            return '';
        }
    };
    htmlParser.prototype.parseTable = function () {
        var root = (0, node_html_parser_1.parse)(this.htmlContent);
        var tableRows = root.querySelectorAll('tbody tr');
        var dataSetList = [];
        for (var _i = 0, tableRows_1 = tableRows; _i < tableRows_1.length; _i++) {
            var row = tableRows_1[_i];
            var cells = row.querySelectorAll('td');
            // Debug: console.log('Zellen:', cells.map(cell => cell.text.trim())); // Ausgabe aller Zelleninhalte
            if (cells.length >= 4) {
                var timestamp = cells[0].text.trim();
                var playerName = cells[2].text.trim();
                var action = cells[3].text.trim();
                /*Debug
                console.log('Timestamp:', timestamp);
                console.log('Player Name:', playerName);
                console.log('Action:', action);
                */
                var oneDataSet = new dataSet_1.dataSet(timestamp, playerName, action);
                dataSetList.push(oneDataSet); // Objekt zur Liste hinzufügen
            }
        }
        return dataSetList; // Rückgabe der Liste von DataSet-Objekten
    };
    // Funktion zum Parsen des Dateinamens
    htmlParser.prototype.parseFileName = function (fileName) {
        var baseName = fileName.replace('.html', '');
        var parts = baseName.split('_');
        if (parts.length !== 5) {
            console.error('Der Dateiname hat nicht die erwartete Struktur.');
            return null;
        }
        var saison = parts[0], spieltag = parts[1], datum = parts[2], gegner = parts[3], spielort = parts[4];
        console.log('Gelesener Dateinameninfos: ');
        console.log(saison, ' | ', spieltag, ' | ', datum, ' | ', gegner, ' | ', spielort);
        return {
            saison: saison,
            spieltag: spieltag,
            datum: datum,
            gegner: gegner,
            spielort: spielort
        };
    };
    return htmlParser;
}());
exports.htmlParser = htmlParser;
