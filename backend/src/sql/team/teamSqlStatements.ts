export default class TeamDBSqlStatements {
  static readonly GET_TEAMS = `
        SELECT
        m.id AS teamId,
        m.Name AS teamName,
        l.Name AS ligaName,
        l.id AS ligaId
        FROM Mannschaft m
        JOIN Liga l ON m.Liga_id = l.id
        ORDER BY l.Name, m.Name
    `;

  static readonly GET_TEAM_MEMBERS_FOR_TEAM = `
    SELECT
      u.uuid,
      u.vorname,
      u.nachname,
      u.koerpergroesse,
      u.geburtsdatum,
      u.trikotnummer,
      u.profileImage,
      u.isAdmin,
      au.email,
      gp.position_title as position,
      m.Name as teamName,
      l.Name as ligaName
    FROM \`User\` u
    JOIN AuthUser au ON u.uuid = au.UUID
    JOIN Mannschaft m ON u.mannschaft_id = m.id
    JOIN Liga l ON m.Liga_id = l.id
    LEFT JOIN GamePosition gp ON u.position_id = gp.id
    WHERE u.mannschaft_id = ?
    ORDER BY u.nachname, u.vorname
  `;

  static readonly CREATE_TEAM = `
    INSERT INTO Mannschaft (Name, Liga_id, teamImage)
    VALUES (?, ?, ?);
  `;

  static readonly ADD_TRAINERS_TO_TEAM = `
    UPDATE \`User\`
    SET mannschaft_id = ?, position_id = 8
    WHERE uuid IN (?);
  `;

  static readonly DELETE_TEAM = `
    DELETE FROM Mannschaft
    WHERE id = ?;
  `;

  static readonly GET_TEAM_BY_ID = `
    SELECT 
      m.id,
      m.Name,
      m.teamImage,
      l.Name AS ligaName
    FROM Mannschaft m
    JOIN Liga l ON m.Liga_id = l.id
    WHERE m.id = ?
  `;

  static readonly GET_TRAINERS_FOR_TEAM = `
    SELECT
      u.uuid,
      u.vorname,
      u.nachname,
      u.position_id,
      au.email
    FROM \`User\` u
    JOIN AuthUser au ON u.uuid = au.UUID
    WHERE u.mannschaft_id = ?;
  `;
}
