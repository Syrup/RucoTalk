import jwt from "jsonwebtoken";
import { User } from "~/types";
import * as crypto from "crypto";

export const generateAccessToken = (user: User) => {
  return jwt.sign({ userId: user.id }, process.env.SESSION_SECRET!, {
    expiresIn: "10m",
  });
};

export const generateRefreshToken = (user: User, jti: string) => {
  return jwt.sign({ userId: user.id, jti }, process.env.REFRESH_SECRET!, {
    expiresIn: "7d",
  });
};

export const generateTokens = (user: User, jti: string) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user, jti),
  };
};

export const hashToken = (token: string) => {
  return crypto.createHash("sha512").update(token).digest("hex");
};
