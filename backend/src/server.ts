import express from "express";
import { Sequelize } from "sequelize";
import cors from "cors";
import initModels, { setupModelCronjobs } from "./model/initModel";
import authRoutes from "./routes/authRoutes";

const app = express();

// Middleware
app.use(express.json());
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

//Custom auth routes
app.use("/auth", authRoutes)

const DB_USER = "root";
const DB_PASS = "no-password";
const DB_HOST = "localhost";
const DB_PORT = 3306;
const DB_NAME = "handball";

async function ensureDatabase() {
  const rootSequelize = new Sequelize({
    username: DB_USER,
    password: DB_PASS,
    host: DB_HOST,
    port: DB_PORT,
    dialect: "mysql",
    logging: true,
  });

  await rootSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  await rootSequelize.close();
}

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

  initModels(sequelize)
  setupModelCronjobs();

  await sequelize.sync({ alter: true });
  console.log("✅ Database & tables synchronized");

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

start();
