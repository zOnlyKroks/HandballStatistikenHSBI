import { Sequelize, DataTypes, Model, Op } from "sequelize";
import AuthUserModel from "../auth/AuthUserModel";

export default class UserModel extends Model {
  public id!: number;
  public role!: UserRole;
  public height!: number;
  public age!: number;
  public position!: Position;
  public jerseyNumber!: number;

  public async getAuthUser(): Promise<AuthUserModel | null> {
    return await AuthUserModel.findByPk(this.id);
  }
}

export enum UserRole {
  PLAYER = "player",
  TRAINER = "trainer",
  ADMIN = "admin",
}

//TODO:
export enum Position {
  UNKNOWN = "unknown",
}