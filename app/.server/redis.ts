import { createClient } from "redis";

const client = createClient({
  password: "rww09binPrxgBfbJSWdP61vTJCYOnMea",
  socket: {
    host: "redis-16932.c85.us-east-1-2.ec2.redns.redis-cloud.com",
    port: 16932,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));
// client.on("connect", () => console.log("Redis Client Connected"));

export { client };
