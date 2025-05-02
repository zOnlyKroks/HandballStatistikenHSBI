import { DataTypes, Op, Sequelize } from "sequelize";
import AuthUserModel from "./auth/AuthUserModel";
import BlacklistedTokenModel from "./auth/BlacklistedTokenModel";

export default function initModels(sequelize: Sequelize) {
  AuthUserModel.init(
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
  BlacklistedTokenModel.init(
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
      },
    },
    {
      tableName: "blacklisted_tokens",
      sequelize,
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
