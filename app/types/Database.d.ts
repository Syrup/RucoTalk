import { users as usersDb, tokens as tokensDb } from "db";

export interface User {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Tables {
  users = usersDb,
  tokens = tokensDb,
}
