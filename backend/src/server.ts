import express, { Request, Response } from "express";
import { Sequelize } from "sequelize";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// pull these from env or config
const DB_USER = "root";
const DB_PASS = "no-password";
const DB_HOST = "localhost";
const DB_PORT = 3306;
const DB_NAME = "handball";

// 1) connect *without* a database selected
const rootSequelize = new Sequelize({
  username: DB_USER,
  password: DB_PASS,
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  logging: true,
});

// 2) create the DB if it doesn’t exist
async function ensureDatabase() {
  await rootSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  await rootSequelize.close();
}

// 3) now connect *to* the database and sync your models
async function start() {
  await ensureDatabase();

  const sequelize = new Sequelize({
    username: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    dialect: "mysql",
    logging: true,
  });

  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected");
  } catch (err) {
    console.error("❌ Unable to connect to MySQL:", err);
    process.exit(1);
  }

  // .sync() will create tables from your models if they don’t exist
  await sequelize.sync({ alter: true });
  console.log("✅ Database & tables synchronized");

  app.get("/", (req: Request, res: Response) => {
    res.send("Hello from the backend!");
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

start();
