export default class ProfileDBSqlStatements {
  static GET_PARTIAL_PROFILE = `
    SELECT
      UUID AS uuid,
      Email AS email
    FROM AuthUser
    WHERE UUID = ?
  `;

  static GET_FULL_PROFILE = `
    SELECT
      au.UUID AS uuid,
      au.Email AS email,
      u.vorname AS vorname,
      u.nachname AS nachname,
      u.koerpergroesse AS koerpergroesse,
      u.geburtsdatum AS geburtsdatum,
      u.trikotnummer AS trikotnummer,
      u.mannschaft_id AS mannschaftId,
      u.position_id AS positionId,
      u.isAdmin AS isAdmin,
      m.Name AS mannschaftName,
      m.Liga_id AS mannschaftLigaId,
      p.position_title AS position,
      p.id AS position_id,
      l.id AS league_id,
      l.Name AS league_name,
      l.Stufe AS league_level,
      u.profileImage AS profileImage
    FROM AuthUser au
    LEFT JOIN \`User\` u ON au.UUID = u.uuid
    LEFT JOIN GamePosition p ON u.position_id = p.id
    LEFT JOIN Mannschaft m ON u.mannschaft_id = m.id
    LEFT JOIN Liga l ON m.Liga_id = l.id
    WHERE au.UUID = ?
  `;

  static SET_PROFILE_DATA = `
    UPDATE \`User\`
    SET
      vorname = ?,
      nachname = ?,
      koerpergroesse = ?,
      geburtsdatum = ?,
      position_id = ?,
      trikotnummer = ?,
      mannschaft_id = ?
    WHERE
      uuid = ?
  `;

  static GET_PLAYER_ACCURACY = (limit: string) => `
    SELECT 
      ga.action_name,
      COUNT(*) AS count
    FROM GameSituation gs
    JOIN User u 
      ON gs.first_name = u.vorname 
      AND gs.last_name = u.nachname
      AND u.uuid = ?
    JOIN GameActions ga 
      ON gs.action_id = ga.id_action
    JOIN (
      SELECT idSpiel 
      FROM Spielbericht
      WHERE Mannschaft_id = (SELECT mannschaft_id FROM User WHERE uuid = ?)
      ORDER BY Datum DESC
      LIMIT ${Number(limit)}
    ) AS recent_games ON gs.game_report_id = recent_games.idSpiel
    WHERE ga.action_name IN (
      'Tor 9m', 'Tor 7m', 'Tor 6m', 'Tor Flügel', 'Tor Gegenstoß', 'Tor Durchbruch',
      'Fehlwurf 9m', 'Fehlwurf 7m', 'Fehlwurf 6m', 'Fehlwurf Flügel', 'Fehlwurf Gegenstoß', 'Fehlwurf Durchbruch'
    )
    GROUP BY ga.action_name
  `;

  static GET_PLAYER_GAMES = (limit: string) => `
    SELECT COUNT(DISTINCT sb.idSpiel) AS spiele
    FROM Spielbericht sb
    JOIN Mannschaft m ON sb.Mannschaft_id = m.id
    JOIN User u ON u.mannschaft_id = m.id
    JOIN (
      SELECT sb_inner.idSpiel
      FROM Spielbericht sb_inner
      JOIN User u2 ON sb_inner.Mannschaft_id = u2.mannschaft_id
      WHERE u2.uuid = ?
      ORDER BY sb_inner.datum DESC
      LIMIT ${Number(limit)}
    ) AS recent ON sb.idSpiel = recent.idSpiel
    WHERE u.uuid = ?
  `;

  static GET_PLAYER_GOALS = (limit: string) => `
    SELECT SUM(CASE
      WHEN ga.action_name IN (
        'Tor 9m', 'Tor 7m', 'Tor 6m', 'Tor Flügel', 'Tor Gegenstoß', 'Tor Durchbruch'
      ) THEN 1 ELSE 0
    END) AS tore
    FROM Spielbericht sb
    JOIN Mannschaft m ON sb.Mannschaft_id = m.id
    JOIN User u ON u.mannschaft_id = m.id
    JOIN (
      SELECT sb_recent.idSpiel
      FROM Spielbericht sb_recent
      JOIN User u_recent ON sb_recent.Mannschaft_id = u_recent.mannschaft_id
      WHERE u_recent.uuid = ?
      ORDER BY sb_recent.datum DESC
      LIMIT ${Number(limit)}
    ) AS recent_games ON sb.idSpiel = recent_games.idSpiel
    LEFT JOIN GameSituation gs ON gs.game_report_id = sb.idSpiel
      AND gs.first_name = u.vorname AND gs.last_name = u.nachname
    LEFT JOIN GameActions ga ON gs.action_id = ga.id_action
    WHERE u.uuid = ?
  `;

  static GET_PLAYER_ASSISTS = (limit: string) => `
    SELECT SUM(CASE WHEN ga.action_name = 'Assist' THEN 1 ELSE 0 END) AS assists
    FROM Spielbericht sb
    JOIN Mannschaft m ON sb.Mannschaft_id = m.id
    JOIN User u ON u.mannschaft_id = m.id
    JOIN (
      SELECT sb_recent.idSpiel
      FROM Spielbericht sb_recent
      JOIN User u_recent ON sb_recent.Mannschaft_id = u_recent.mannschaft_id
      WHERE u_recent.uuid = ?
      ORDER BY sb_recent.datum DESC
      LIMIT ${Number(limit)}
    ) AS recent_games ON sb.idSpiel = recent_games.idSpiel
    LEFT JOIN GameSituation gs ON gs.game_report_id = sb.idSpiel
      AND gs.first_name = u.vorname AND gs.last_name = u.nachname
    LEFT JOIN GameActions ga ON gs.action_id = ga.id_action
    WHERE u.uuid = ?
  `;

  static GET_PLAYER_SHOTS = (limit: string) => `
    SELECT SUM(CASE
      WHEN ga.action_name IN (
        'Tor 9m', 'Tor 7m', 'Tor 6m', 'Tor Flügel', 'Tor Gegenstoß', 'Tor Durchbruch',
        'Fehlwurf 9m', 'Fehlwurf 7m', 'Fehlwurf 6m', 'Fehlwurf Flügel', 'Fehlwurf Gegenstoß', 'Fehlwurf Durchbruch'
      ) THEN 1 ELSE 0
    END) AS würfe
    FROM Spielbericht sb
    JOIN Mannschaft m ON sb.Mannschaft_id = m.id
    JOIN User u ON u.mannschaft_id = m.id
    JOIN (
      SELECT sb_recent.idSpiel
      FROM Spielbericht sb_recent
      JOIN User u_recent ON sb_recent.Mannschaft_id = u_recent.mannschaft_id
      WHERE u_recent.uuid = ?
      ORDER BY sb_recent.datum DESC
      LIMIT ${Number(limit)}
    ) AS recent_games ON sb.idSpiel = recent_games.idSpiel
    LEFT JOIN GameSituation gs ON gs.game_report_id = sb.idSpiel
      AND gs.first_name = u.vorname AND gs.last_name = u.nachname
    LEFT JOIN GameActions ga ON gs.action_id = ga.id_action
    WHERE u.uuid = ?
  `;

  static GET_PLAYER_SEVEN_METER = (limit: string) => `
    SELECT 
      SUM(CASE WHEN ga.action_name = 'Tor 7m' THEN 1 ELSE 0 END) AS sevenGoals,
      SUM(CASE WHEN ga.action_name IN ('Tor 7m', 'Fehlwurf 7m') THEN 1 ELSE 0 END) AS sevenAttempts
    FROM Spielbericht sb
    JOIN Mannschaft m ON sb.Mannschaft_id = m.id
    JOIN User u ON u.mannschaft_id = m.id
    JOIN (
      SELECT sb_recent.idSpiel
      FROM Spielbericht sb_recent
      JOIN User u_recent ON sb_recent.Mannschaft_id = u_recent.mannschaft_id
      WHERE u_recent.uuid = ?
      ORDER BY sb_recent.datum DESC
      LIMIT ${Number(limit)}
    ) AS recent_games ON sb.idSpiel = recent_games.idSpiel
    LEFT JOIN GameSituation gs ON gs.game_report_id = sb.idSpiel
      AND gs.first_name = u.vorname AND gs.last_name = u.nachname
    LEFT JOIN GameActions ga ON gs.action_id = ga.id_action
    WHERE u.uuid = ?
  `;

  static GET_TIME_PENALTIES = (limit: string) => `
    SELECT SUM(CASE WHEN ga.action_name = 'Zeitstrafe' THEN 1 ELSE 0 END) AS zeitstrafen
    FROM Spielbericht sb
    JOIN Mannschaft m ON sb.Mannschaft_id = m.id
    JOIN User u ON u.mannschaft_id = m.id
    JOIN (
      SELECT sb_recent.idSpiel
      FROM Spielbericht sb_recent
      JOIN User u_recent ON sb_recent.Mannschaft_id = u_recent.mannschaft_id
      WHERE u_recent.uuid = ?
      ORDER BY sb_recent.datum DESC
      LIMIT ${Number(limit)}
    ) AS recent_games ON sb.idSpiel = recent_games.idSpiel
    LEFT JOIN GameSituation gs ON gs.game_report_id = sb.idSpiel
      AND gs.first_name = u.vorname AND gs.last_name = u.nachname
    LEFT JOIN GameActions ga ON gs.action_id = ga.id_action
    WHERE u.uuid = ?
  `;

  static GET_RED_CARDS = (limit: string) => `
    SELECT SUM(CASE WHEN ga.action_name = 'Rote Karte' THEN 1 ELSE 0 END) AS roteKarten
    FROM Spielbericht sb
    JOIN Mannschaft m ON sb.Mannschaft_id = m.id
    JOIN User u ON u.mannschaft_id = m.id
    JOIN (
      SELECT sb_recent.idSpiel
      FROM Spielbericht sb_recent
      JOIN User u_recent ON sb_recent.Mannschaft_id = u_recent.mannschaft_id
      WHERE u_recent.uuid = ?
      ORDER BY sb_recent.datum DESC
      LIMIT ${Number(limit)}
    ) AS recent_games ON sb.idSpiel = recent_games.idSpiel
    LEFT JOIN GameSituation gs ON gs.game_report_id = sb.idSpiel
      AND gs.first_name = u.vorname AND gs.last_name = u.nachname
    LEFT JOIN GameActions ga ON gs.action_id = ga.id_action
    WHERE u.uuid = ?
  `;

  static GET_SAVE_QUOTE = (limit: string) => `
    SELECT 
      SUM(CASE WHEN ga.action_name = 'Parade' THEN 1 ELSE 0 END) AS paraden,
      SUM(CASE WHEN ga.action_name IN (
        'Parade', 'Tor 6m', 'Tor 7m', 'Tor 9m', 'Tor Flügel', 'Tor Gegenstoß', 'Tor Durchbruch'
      ) THEN 1 ELSE 0 END) AS gegnerWuerfe
    FROM Spielbericht sb
    JOIN Mannschaft m ON sb.Mannschaft_id = m.id
    JOIN User u ON u.mannschaft_id = m.id
    JOIN (
      SELECT sb_recent.idSpiel
      FROM Spielbericht sb_recent
      JOIN User u_recent ON sb_recent.Mannschaft_id = u_recent.mannschaft_id
      WHERE u_recent.uuid = ?
      ORDER BY sb_recent.datum DESC
      LIMIT ${Number(limit)}
    ) AS recent_games ON sb.idSpiel = recent_games.idSpiel
    LEFT JOIN GameSituation gs ON gs.game_report_id = sb.idSpiel
      AND gs.first_name = u.vorname AND gs.last_name = u.nachname
    LEFT JOIN GameActions ga ON gs.action_id = ga.id_action
    WHERE u.uuid = ?
  `;

  static GET_POSITIONS = `
    SELECT id AS id, position_title AS title
    FROM GamePosition
  `;

  static DELETE_PLAYER = `
    DELETE FROM \`User\`
    WHERE uuid = ?;
  `;

  static DELETE_AUTHUSER = `
    DELETE FROM AuthUser
    WHERE UUID = ?;
  `;
}
