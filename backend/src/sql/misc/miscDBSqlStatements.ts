export default class MiscDBSqlStatements {
  static GET_LIGEN = `
    SELECT
        l.id AS id,
        l.Name AS name,
        l.Stufe AS level
      FROM Liga l
    ORDER BY l.Stufe ASC, l.Name ASC;
  `;
}
