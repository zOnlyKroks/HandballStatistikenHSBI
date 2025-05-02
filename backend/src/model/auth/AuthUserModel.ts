import { Sequelize, DataTypes, Model, Op } from "sequelize";

export default class AuthUserModel extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
