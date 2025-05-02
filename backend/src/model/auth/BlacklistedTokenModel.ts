import { Sequelize, DataTypes, Model, Op } from "sequelize";

export default class BlacklistedTokenModel extends Model {
  public id!: number;
  public userId!: number;
  public token!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public expiresAt!: Date;
}
