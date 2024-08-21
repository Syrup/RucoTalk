import { User } from "./User";

export interface LoginCookie {
  token: string;
  user: User;
  isLoggedIn: boolean;
}
