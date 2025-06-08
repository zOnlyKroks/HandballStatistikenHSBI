import mysql from "mysql2/promise";
import { htmlParser } from './htmlParser'; // Importiere die htmlParser-Klasse
import { dataSet } from './dataSet'; // Importiere die dataSet-Klasse

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

async function fillDatabase() {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    const set : dataSet = new dataSet("", "", "")

    await conn.execute('INSERT IGNORE INTO Spielsituation (Nachname, Vorname, Zeitstempel) VALUES (?,?,?)', [
        "value1","value2", "value3"
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

//Testing:
    


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