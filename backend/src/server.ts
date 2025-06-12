import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import playerRoutes from "./routes/playerRoutes";
import teamRoutes from "./routes/teamRoutes";
import miscRoutes from "./routes/miscRoutes";
import nodeCron from "node-cron";
import staticDataImporter from "./helpers/staticDataImporter";
import createTables from "./helpers/tableCreator";
import { importDataSets } from "./importer/importHandler";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import AuthDBSqlStatements from "./sql/auth/authSqlStatements";

const app = express();

const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "no-password",
  database: "handball",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("https://localhost:")
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    credentials: true,
  })
);

app.use("/auth", authRoutes);
app.use("/api", playerRoutes);
app.use("/team", teamRoutes);
app.use("/misc", miscRoutes);

const DB_USER = "root";
const DB_PASS = "no-password";
const DB_HOST = "localhost";
const DB_PORT = 3306;
const DB_NAME = "handball";

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
  });

  await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  await connection.end();
}

async function setupCronjobs() {
  nodeCron.schedule("0 0 * * *", async () => {
    try {
      await pool.execute(`
        DELETE FROM BlacklistedTokens 
        WHERE expiresAt < NOW()
      `);
      console.log("✅ Expired tokens cleaned up");
    } catch (error) {
      console.error("❌ Error cleaning up expired tokens:", error);
    }
  });

  console.log("✅ Cronjobs setup completed");
}

async function start() {
  try {
    await ensureDatabase();
    console.log("✅ Database ensured");

    await createTables(pool);

    await staticDataImporter(pool);

    await importDataSets(pool);

    await insertDefaultAdminUser();

    setupCronjobs();
    const PORT = process.env.PORT || 3001;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Unable to start server:", err);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("🔄 Shutting down gracefully...");
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🔄 Shutting down gracefully...");
  await pool.end();
  process.exit(0);
});

async function insertDefaultAdminUser() {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    AuthDBSqlStatements.DOES_USER_EXIST_BY_NAME,
    ["Finn", "Rades"]
  );

  const userExists = ((rows as any)[0] as any).count > 0;

  if (userExists) return;

  const authUserUuid = uuidv4();
  const hashedPassword = await bcrypt.hash("123456", 10);

  await pool.execute<mysql.ResultSetHeader>(
    AuthDBSqlStatements.CREATE_AUTHUSER,
    [authUserUuid, `finn@rades.de`, hashedPassword]
  );

  const sanitize = (val: any) => (val === undefined ? null : val);

  const values = [
    sanitize(authUserUuid),
    sanitize("Finn"),
    sanitize("Rades"),
    sanitize(-1),
    sanitize("1900-01-01"),
    sanitize(-1),
    sanitize(-1),
    sanitize(-1),
    true,
  ];

  await pool.execute<mysql.ResultSetHeader>(
    AuthDBSqlStatements.CREATE_USER,
    values
  );
}

export { pool };

start();
