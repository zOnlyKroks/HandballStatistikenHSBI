export default class AuthDBSqlStatements {
  static CREATE_AUTHUSER = `
    INSERT INTO \`AuthUser\` (UUID, Email, Password) VALUES (?, ?, ?)
  `;

  static FIND_USER_BY_EMAIL = `
    SELECT UUID, Email, Password
    FROM \`AuthUser\`
    WHERE Email = ?
    LIMIT 1
  `;

  // Liga queries
  static CREATE_LIGA_IF_NOT_EXISTS = `
    INSERT IGNORE INTO \`Liga\` (Name, Stufe, Anzahl_Mannschaften) VALUES (?, ?, ?)
  `;

  // Mannschaft queries - Fixed to use Liga_id instead of Liga_Name
  static CREATE_MANNSCHAFT_IF_NOT_EXISTS = `
    INSERT IGNORE INTO \`Mannschaft\` (Name, Liga_id) VALUES (?, ?)
  `;

  // Position queries
  static CREATE_POSITION_IF_NOT_EXISTS = `
    INSERT IGNORE INTO \`GamePosition\` (id, position_title) VALUES (?, ?)
  `;

  // User queries - Fixed to match your actual table structure
  static CREATE_USER = `
    INSERT INTO \`User\` (
      uuid,
      vorname,
      nachname,
      koerpergroesse,
      geburtsdatum,
      position_id,
      trikotnummer,
      mannschaft_id,
      isAdmin
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // BlacklistedTokens queries - Fixed column name
  static INSERT_BLACKLISTED_TOKEN = `
    INSERT INTO \`BlacklistedTokens\`
    (authUserUuid, token, createdAt, updatedAt, expiresAt)
    VALUES (?, ?, ?, ?, ?)
  `;

  static CHECK_TOKEN_BLACKLIST = `
    SELECT id FROM \`BlacklistedTokens\`
    WHERE token = ? AND expiresAt > NOW()
  `;
}
