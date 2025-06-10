"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql2/promise");
var htmlParser_1 = require("./htmlParser"); // Importiere die htmlParser-Klasse
var fs = require("fs");
var path = require("path");
var pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "no-password",
    database: "handball",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
function fillDatabase(Spielsituation) {
    return __awaiter(this, void 0, void 0, function () {
        var conn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.getConnection()];
                case 1:
                    conn = _a.sent();
                    return [4 /*yield*/, conn.beginTransaction()];
                case 2:
                    _a.sent();
                    //const set : dataSet = new dataSet("", "", "");
                    return [4 /*yield*/, conn.execute('INSERT IGNORE INTO Spielsituation (Zeitstempel, Name, Aktion, ) VALUES (?,?,?)', [
                            Spielsituation.getTimeStamp, Spielsituation.getPlayerName, Spielsituation.getGameAction
                        ])];
                case 3:
                    //const set : dataSet = new dataSet("", "", "");
                    _a.sent();
                    return [4 /*yield*/, conn.commit()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, conn.release()];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Funktion zum Überprüfen der Datenbank
function checkDatabase(parsedData, pool) {
    return __awaiter(this, void 0, void 0, function () {
        var conn, saison, spieltag, datum, gegner, spielort, rows, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.getConnection()];
                case 1:
                    conn = _a.sent();
                    return [4 /*yield*/, conn.beginTransaction()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, 8, 10]);
                    saison = parsedData.saison, spieltag = parsedData.spieltag, datum = parsedData.datum, gegner = parsedData.gegner, spielort = parsedData.spielort;
                    return [4 /*yield*/, conn.execute('SELECT * FROM spielberichte WHERE Saison = ? AND Spieltag = ? AND Datum = ? AND Gegner = ? AND Spielort = ?', [saison, spieltag, datum, gegner, spielort])];
                case 4:
                    rows = (_a.sent())[0];
                    return [4 /*yield*/, conn.commit()];
                case 5:
                    _a.sent();
                    if (rows.length > 0) {
                        return [2 /*return*/, true]; // Ein Eintrag existiert
                    }
                    else {
                        return [2 /*return*/, false]; // Kein Eintrag gefunden
                    }
                    return [3 /*break*/, 10];
                case 6:
                    error_1 = _a.sent();
                    console.error("Fehler bei der Datenbankabfrage: ".concat(error_1.message));
                    return [4 /*yield*/, conn.rollback()];
                case 7:
                    _a.sent();
                    return [2 /*return*/, false]; // Gibt false zurück im Fehlerfall
                case 8: return [4 /*yield*/, conn.release()];
                case 9:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// Funktion, um Dateinamen aus einem Ordner zu lesen
function readFileNamesFromDirectory(directoryPath) {
    try {
        // Lese alle Dateien im angegebenen Verzeichnis
        var files = fs.readdirSync(directoryPath);
        // Erstelle eine Liste der Dateinamen
        var fileNames = files.map(function (file) { return path.basename(file); });
        // Zurückgeben der Liste
        return fileNames;
    }
    catch (error) {
        console.error('Fehler beim Lesen des Verzeichnisses:', error);
        return [];
    }
}
function main() {
    // Setzen des Ordners, in dem die Daten sind
    var filePath = path.join(__dirname, 'data');
    // Lesen aller Dateinamen in dem Ordner
    var fileList = readFileNamesFromDirectory(filePath);
    console.log('Dateien in data:', fileList);
    for (var file in fileList) {
        console.log(fileList[file]);
        var parser = new htmlParser_1.htmlParser(fileList[file]);
        var dataSetList = parser.parseTable();
        //console.log(dataSetList);
        // MYSQL Insert into Spielbericht mit saison, spieltag, datum, gegner, spielort
        // TBD
        for (var dataSet_1 in dataSetList) {
            // 'INSERT INTO spielsituation WHERE Saison = ? AND Spieltag = ? AND Datum = ? AND Gegner = ? AND Spielort = ?',
            console.log(dataSetList[dataSet_1]);
            //fillDatabase(dataSetList[dataSet]);
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
