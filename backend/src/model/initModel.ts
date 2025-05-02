import { DataTypes, Op, Sequelize } from "sequelize";
import AuthUserModel from "./auth/AuthUserModel";
import BlacklistedTokenModel from "./auth/BlacklistedTokenModel";
import UserModel, { Position, UserRole } from "./user/UserModel";

export default function initModels(sequelize: Sequelize) {
  AuthUserModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Ensure the id is auto-generated
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'auth_users',
      modelName: 'AuthUserModel',
      timestamps: true, // Timestamps enabled for AuthUserModel
    }
  );

  // Initialize UserModel with proper associations and autoIncremented id
  UserModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: AuthUserModel, // Reference to AuthUserModel
          key: 'id', // The foreign key will be the 'id' of AuthUserModel
        },
        onDelete: 'CASCADE', // Ensure deleting AuthUserModel will delete UserModel
      },
      role: {
        type: DataTypes.ENUM(...Object.values(UserRole)),
        allowNull: false,
      },
      height: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      position: {
        type: DataTypes.ENUM(...Object.values(Position)),
        allowNull: false,
      },
      jerseyNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: true,
    }
  );

  UserModel.belongsTo(AuthUserModel, { foreignKey: 'id', targetKey: 'id' });
  AuthUserModel.hasOne(UserModel, { foreignKey: 'id', sourceKey: 'id' });

  BlacklistedTokenModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Auto increment the id field
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "blacklisted_tokens", // Name of the table
      modelName: "BlacklistedTokenModel", // Model name
      timestamps: true, // Auto manage createdAt and updatedAt
    }
  );
}

export function setupModelCronjobs() {
  setInterval(async () => {
      try {
        await BlacklistedTokenModel.destroy({
          where: {
            expiresAt: {
              [Op.lt]: new Date(),
            },
          },
        });
        console.log("✅ Cleaned up expired blacklisted tokens");
      } catch (error) {
        console.error("❌ Error cleaning up blacklisted tokens:", error);
      }
    }, 10 * 60 * 1000);
}
