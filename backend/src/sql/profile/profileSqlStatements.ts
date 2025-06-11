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

  static GET_PLAYER_ACCURACY = `
      SELECT 
        ga.action_name,
        COUNT(*) as count
      FROM GameSituation gs
      JOIN Spielbericht sb ON gs.game_report_id = sb.idSpiel
      JOIN Mannschaft m ON sb.Mannschaft_id = m.id
      JOIN User u ON u.mannschaft_id = m.id
      JOIN GameActions ga ON gs.action_id = ga.id_action
      WHERE u.uuid = ?
        AND gs.first_name = u.vorname 
        AND gs.last_name = u.nachname
        AND ga.action_name IN (
          'Tor 9m', 'Tor 7m', 'Tor 6m', 'Tor Flügel', 'Tor Gegenstoß', 'Tor Durchbruch',
          'Fehlwurf 9m', 'Fehlwurf 7m', 'Fehlwurf 6m', 'Fehlwurf Flügel', 'Fehlwurf Gegenstoß', 'Fehlwurf Durchbruch'
        )
      GROUP BY ga.action_name
    `;

  static GET_PLAYER_STATS_SIMPLE = `
  SELECT
    COUNT(DISTINCT sb.idSpiel) AS spiele,

    -- Tore
    SUM(CASE
      WHEN ga.action_name IN (
        'Tor 9m', 'Tor 7m', 'Tor 6m', 'Tor Flügel', 'Tor Gegenstoß', 'Tor Durchbruch'
      ) THEN 1 ELSE 0
    END) AS tore,

    -- Assists
    SUM(CASE
      WHEN ga.action_name = 'Assist' THEN 1 ELSE 0
    END) AS assists,

    -- Würfe (shots)
    SUM(CASE
      WHEN ga.action_name IN (
        'Tor 9m', 'Tor 7m', 'Tor 6m', 'Tor Flügel', 'Tor Gegenstoß', 'Tor Durchbruch',
        'Fehlwurf 9m', 'Fehlwurf 7m', 'Fehlwurf 6m', 'Fehlwurf Flügel', 'Fehlwurf Gegenstoß', 'Fehlwurf Durchbruch'
      ) THEN 1 ELSE 0
    END) AS würfe,

    -- 7m Quote
    SUM(CASE WHEN ga.action_name = 'Tor 7m' THEN 1 ELSE 0 END) /
    NULLIF(SUM(CASE WHEN ga.action_name IN ('Tor 7m', 'Fehlwurf 7m') THEN 1 ELSE 0 END), 0) AS quoteSeven,

    -- Zeitstrafen
    SUM(CASE WHEN ga.action_name = 'Zeitstrafe' THEN 1 ELSE 0 END) AS zeitstrafen,

    -- Rote Karten
    SUM(CASE WHEN ga.action_name = 'Rote Karte' THEN 1 ELSE 0 END) AS roteKarten,

    -- Paradequote
    SUM(CASE WHEN ga.action_name = 'Parade' THEN 1 ELSE 0 END) /
    NULLIF(SUM(CASE WHEN ga.action_name IN (
      'Parade', 'Tor 6m', 'Tor 7m', 'Tor 9m', 'Tor Flügel', 'Tor Gegenstoß', 'Tor Durchbruch'
    ) THEN 1 ELSE 0 END), 0) AS paradeQuote

  FROM Spielbericht sb
  JOIN Mannschaft m ON sb.Mannschaft_id = m.id
  JOIN User u ON u.mannschaft_id = m.id
  LEFT JOIN GameSituation gs ON gs.game_report_id = sb.idSpiel
    AND gs.first_name = u.vorname
    AND gs.last_name = u.nachname
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
