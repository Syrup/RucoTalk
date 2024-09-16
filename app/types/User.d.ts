export interface User {
  id: string;
  username: string | null;
  email: string | null;
  password: string;
  roles: UserRole[] | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type UserRole = "admin" | "user" | "moderator";
