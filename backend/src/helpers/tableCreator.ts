import mysql from "mysql2/promise";

export default async function createTables(pool: mysql.Pool) {
  try {
    console.log("🔄 Creating database tables...");

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Liga (
        id INT NOT NULL AUTO_INCREMENT,
        Name VARCHAR(45) NOT NULL UNIQUE,
        Stufe INT NOT NULL,
        Anzahl_Mannschaften INT NOT NULL,
        PRIMARY KEY (id)
      ) ENGINE = InnoDB
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Mannschaft (
        id INT NOT NULL AUTO_INCREMENT,
        Name VARCHAR(45) NOT NULL,
        Liga_id INT NOT NULL,
        teamImage LONGBLOB NULL,
        PRIMARY KEY (id),
        UNIQUE INDEX Name_Liga_UNIQUE (Name ASC, Liga_id ASC),
        INDEX fk_Mannschaft_Liga1_idx (Liga_id ASC),
        CONSTRAINT fk_Mannschaft_Liga1
          FOREIGN KEY (Liga_id)
          REFERENCES Liga (id)
          ON DELETE NO ACTION
          ON UPDATE NO ACTION
      ) ENGINE = InnoDB
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS Spielbericht (
        idSpiel INT NOT NULL AUTO_INCREMENT,
        Mannschaft_id INT NOT NULL,
        Spieltag INT NOT NULL,
        Saison INT NOT NULL,
        Datum DATE NOT NULL,
        Gegner VARCHAR(45) NOT NULL,
        Spielort VARCHAR(45) NOT NULL,
        PRIMARY KEY (idSpiel),
        INDEX fk_Spiel_Mannschaft1_idx (Mannschaft_id ASC),
        CONSTRAINT fk_Spiel_Mannschaft1
          FOREIGN KEY (Mannschaft_id)
          REFERENCES Mannschaft (id)
          ON DELETE NO ACTION
          ON UPDATE NO ACTION
      ) ENGINE = InnoDB
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS GameActions (
        id_action INT NOT NULL AUTO_INCREMENT,
        action_name VARCHAR(45) NOT NULL,
        PRIMARY KEY (id_action)
      ) ENGINE = InnoDB
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS GameSituation (
        id INT NOT NULL AUTO_INCREMENT,
        game_report_id INT NOT NULL,
        action_id INT NOT NULL,
        timestamp TIME NOT NULL,
        first_name VARCHAR(45) NOT NULL,
        last_name VARCHAR(45) NOT NULL,
        PRIMARY KEY (id),
        INDEX fk_GameSituation_Spielbericht1_idx (game_report_id ASC),
        INDEX fk_GameSituation_GameActions1_idx (action_id ASC),
        CONSTRAINT fk_GameSituation_Spielbericht1
          FOREIGN KEY (game_report_id)
          REFERENCES Spielbericht (idSpiel)
          ON DELETE NO ACTION
          ON UPDATE NO ACTION,
        CONSTRAINT fk_GameSituation_GameActions1
          FOREIGN KEY (action_id)
          REFERENCES GameActions (id_action)
          ON DELETE NO ACTION
          ON UPDATE NO ACTION
      ) ENGINE = InnoDB
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS AuthUser (
        UUID VARCHAR(45) CHARACTER SET 'utf8' NOT NULL,
        Email VARCHAR(45) CHARACTER SET 'utf8' NOT NULL,
        Password VARCHAR(99) CHARACTER SET 'utf8' NOT NULL,
        PRIMARY KEY (UUID),
        UNIQUE INDEX UUID_UNIQUE (UUID ASC),
        UNIQUE INDEX Email_UNIQUE (Email ASC)
      ) ENGINE = InnoDB
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS GamePosition (
        id INT NOT NULL AUTO_INCREMENT,
        position_title VARCHAR(45) NOT NULL,
        PRIMARY KEY (id)
      ) ENGINE = InnoDB
    `);

    await pool.execute(`
  CREATE TABLE IF NOT EXISTS User (
    uuid VARCHAR(45) CHARACTER SET 'utf8' NOT NULL,
    vorname VARCHAR(45) NOT NULL,
    nachname VARCHAR(45) NOT NULL,
    koerpergroesse INT NOT NULL,
    geburtsdatum DATE NOT NULL,
    position_id INT NOT NULL,
    trikotnummer INT NOT NULL,
    mannschaft_id INT NOT NULL,
    profileImage LONGBLOB NULL,
    isAdmin BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (uuid),
    INDEX fk_User_AuthUser1_idx (uuid ASC),
    INDEX fk_User_Position1_idx (position_id ASC),
    INDEX fk_User_Mannschaft1_idx (mannschaft_id ASC),
    CONSTRAINT fk_User_AuthUser1
      FOREIGN KEY (uuid)
      REFERENCES AuthUser (UUID)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
    CONSTRAINT fk_User_Position1
      FOREIGN KEY (position_id)
      REFERENCES GamePosition (id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION,
    CONSTRAINT fk_User_Mannschaft1
      FOREIGN KEY (mannschaft_id)
      REFERENCES Mannschaft (id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
  ) ENGINE = InnoDB
`);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS BlacklistedTokens (
        id INT NOT NULL AUTO_INCREMENT,
        authUserUuid VARCHAR(45) CHARACTER SET 'utf8' NOT NULL,
        token VARCHAR(999) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        expiresAt TIMESTAMP NOT NULL,
        PRIMARY KEY (id),
        INDEX fk_BlacklistedTokens_AuthUser1_idx (authUserUuid ASC),
        CONSTRAINT fk_BlacklistedTokens_AuthUser1
          FOREIGN KEY (authUserUuid)
          REFERENCES AuthUser (UUID)
          ON DELETE NO ACTION
          ON UPDATE NO ACTION
      ) ENGINE = InnoDB
    `);

    console.log("✅ Database tables created successfully");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  }
}
