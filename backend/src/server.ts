import express, { Request, Response } from "express";
import { Sequelize } from "sequelize";

const app = express();

//Disable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.json());

const sequelize = new Sequelize(
  "mysql://root:no-password@localhost:3306/handball",
  {
    dialect: "mysql",
    logging: true,
  }
);

sequelize
  .authenticate()
  .then(() => console.log("MySQL connected"))
  .catch((err) => console.error("Unable to connect to MySQL:", err));

sequelize
  .sync()
  .then(() => console.log("Database synchronized"))
  .catch((err) => console.error("Error synchronizing database:", err));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from the backend!");
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
