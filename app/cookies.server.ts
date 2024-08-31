import { createCookie } from "@remix-run/node";

const oneweek = 60 * 60 * 24 * 7; // 1 week

export const login = createCookie("__login", {
  secrets: ["S3CR3T"],
  maxAge: oneweek,
});

const sesionExpires = new Date();
sesionExpires.setSeconds(sesionExpires.getSeconds() + oneweek);

export const sessionCookie = createCookie("__session", {
  secrets: [process.env.LOGIN_SECRET!], // haha i changed it lol
  sameSite: true,
  expires: sesionExpires,
});
