import mysql from "mysql2/promise";

export default async function staticDataImporter(pool: mysql.Pool) {
  await pool.execute(`
    INSERT IGNORE INTO \`GamePosition\` (id, position_title)
    VALUES (-1, 'Unbekannt')
  `);

  await pool.execute(`
    INSERT IGNORE INTO \`GamePosition\` (id, position_title)
    VALUES (1, 'Torwart')
  `);

  await pool.execute(`
    INSERT IGNORE INTO \`GamePosition\` (id, position_title)
    VALUES (2, 'Rechtsaußen')
  `);

  await pool.execute(`
    INSERT IGNORE INTO \`GamePosition\` (id, position_title)
    VALUES (3, 'Linksaußen')
  `);

  await pool.execute(`
    INSERT IGNORE INTO \`GamePosition\` (id, position_title)
    VALUES (4, 'Rückraumlinks')
  `);

  await pool.execute(`
    INSERT IGNORE INTO \`GamePosition\` (id, position_title)
    VALUES (5, 'Rückraummitte')
  `);

  await pool.execute(`
    INSERT IGNORE INTO \`GamePosition\` (id, position_title)
    VALUES (6, 'Rückraumrechts')
  `);

  await pool.execute(`
    INSERT IGNORE INTO \`GamePosition\` (id, position_title)
    VALUES (7, 'Kreisläufer')
  `);

  await pool.execute(`
    INSERT IGNORE INTO \`GamePosition\` (id, position_title)
    VALUES (8, 'Trainer')
  `);

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (-1, 'Unbekannt');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (1, 'Parade 9m');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (2, 'Parade 7m');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (3, 'Parade 6m');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (4, 'Parade Flügel');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (5, 'Parade Gegenstoß');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (6, 'Parade Durchbruch');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (7, 'Gegentor 9m');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (8, 'Gegentor 7m');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (9, 'Gegentor 6m');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (10, 'Gegentor Flügel');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (11, 'Gegentor Gegenstoß');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (12, 'Gegentor Durchbruch');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (13, 'Tor 9m');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (14, 'Tor 7m');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (15, 'Tor 6m');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (16, 'Tor Flügel');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (17, 'Tor Gegenstoß');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (18, 'Tor Durchbruch');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (19, 'Fehlwurf 9m');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (20, 'Fehlwurf 7m');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (21, 'Fehlwurf 6m');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (22, 'Fehlwurf Flügel');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (23, 'Fehlwurf Gegenstoß');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (24, 'Fehlwurf Durchbruch');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (25, 'Ballgewinn');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (26, 'Assist');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (27, '7m geholt');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (28, '7m verursacht');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (29, '2 Minuten');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (30, 'Rote Karte');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (31, 'Block');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (32, 'Technischer Fehler');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (33, 'Fehlpass');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (34, 'Stoppfoul');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (35, 'Gelbe Karte');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (36, 'Ballverlust');`
  );

  await pool.execute(
    `INSERT IGNORE INTO GameActions (id_action, action_name)
      VALUES (37, 'Freie Würfe');`
  );

  await pool.execute(
    `INSERT IGNORE INTO Liga (id, Name, Stufe, Anzahl_Mannschaften)
    VALUES (-1, 'Keine Liga', -1, -1)`
  );

  await pool.execute(`
    INSERT IGNORE INTO Mannschaft (id, Name, Liga_id)
    VALUES (-1, 'Kein Team', -1)
  `);
}
