import { createCookie } from "@remix-run/node"; // or cloudflare/deno

const oneweek = 60 * 60 * 24 * 7; // 1 week

export const login = createCookie("__login", {
  secrets: ["S3CR3T"],
  maxAge: oneweek,
});

const sesionExpires = new Date();
sesionExpires.setSeconds(sesionExpires.getSeconds() + oneweek);

export const sessionCookie = createCookie("__session", {
  secrets: ["s3cr3t0f7h3un1v3rs3"],
  sameSite: true,
  expires: sesionExpires,
});
