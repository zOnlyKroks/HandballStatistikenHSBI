import express, { Request, Response } from "express";
import { Sequelize, DataTypes, Model, Op } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins (any port)
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  credentials: true
}));

// Database configuration
const DB_USER = "root";
const DB_PASS = "no-password";
const DB_HOST = "localhost";
const DB_PORT = 3306;
const DB_NAME = "handball";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Use environment variable in production

// 1) connect *without* a database selected
const rootSequelize = new Sequelize({
  username: DB_USER,
  password: DB_PASS,
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  logging: true,
});

// 2) create the DB if it doesn't exist
async function ensureDatabase() {
  await rootSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  await rootSequelize.close();
}

// User model
class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Blacklisted Token model for token invalidation
class BlacklistedToken extends Model {
  public id!: number;
  public token!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public expiresAt!: Date;
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

  // Initialize User model
  User.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: "users",
      sequelize,
    }
  );

  // Initialize BlacklistedToken model
  BlacklistedToken.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      }
    },
    {
      tableName: "blacklisted_tokens",
      sequelize,
    }
  );

  // Setup a cleaning job for expired tokens (run every hour)
  setInterval(async () => {
    try {
      await BlacklistedToken.destroy({
        where: {
          expiresAt: {
            [Op.lt]: new Date()
          }
        }
      });
      console.log("✅ Cleaned up expired blacklisted tokens");
    } catch (error) {
      console.error("❌ Error cleaning up blacklisted tokens:", error);
    }
  }, 60 * 60 * 1000); // Every hour

  // .sync() will create tables from your models if they don't exist
  await sequelize.sync({ alter: true });
  console.log("✅ Database & tables synchronized");

  // Root endpoint
  app.get("/", (req: Request, res: Response) => {
    res.send("Hello from the backend!");
  });

  // Authentication endpoints
  // Register endpoint
  app.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: "Name, email, and password are required",
        });
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
        return;
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      // Return success response (excluding password)
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during registration",
      });
    }
  });

  // Login endpoint
  app.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Return success response with token
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during login",
      });
    }
  });

  // Logout endpoint (to invalidate tokens)
  app.post("/auth/logout", authenticateToken, async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      
      if (!token) {
        res.status(400).json({
          success: false,
          message: "No token provided",
        });
        return;
      }

      // Decode the token to get its expiration time
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        res.status(400).json({
          success: false,
          message: "Invalid token",
        });
        return;
      }

      // Calculate expiration date from token
      const expiresAt = new Date(decoded.exp * 1000);

      // Add token to blacklist
      await BlacklistedToken.create({
        token,
        expiresAt,
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during logout",
      });
    }
  });

  // Middleware to verify JWT token
  async function authenticateToken(req: Request, res: Response, next: Function): Promise<void> {
    // Get token from header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
      return;
    }

    try {
      // Check if token is blacklisted
      const blacklistedToken = await BlacklistedToken.findOne({
        where: { token }
      });

      if (blacklistedToken) {
        res.status(401).json({
          success: false,
          message: "Token has been invalidated. Please log in again.",
        });
        return;
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      (req as any).user = decoded;
      next();
    } catch (error) {
      res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  };

  // Protected route example
  app.get("/api/profile", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password"] }, // Exclude password from response
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

start();