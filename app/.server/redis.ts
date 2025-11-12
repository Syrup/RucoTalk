import { createClient } from "redis";

const client = createClient({
  url: "rediss://default:AR5kAAImcDIyYWEwMGRiNTI2YmM0YmU4YTBkMmYzYTY4YmVhMWNjMHAyNzc4MA@assured-moccasin-7780.upstash.io:6379"
});

client.on("error", (err) => console.log("Redis Client Error", err));

export { client };
