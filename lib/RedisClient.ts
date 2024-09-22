import { createClient, RedisClientType } from "redis";

export async function initializeRedisClient(): Promise<RedisClientType> {
  const client: RedisClientType = createClient({
    url: "redis://localhost:6379",
  });

  client.on("error", (err: any) => console.log("Redis Client Error", err));
  client.on("connect", () => console.log("Redis Client Connected"));

  await client.connect();

  return client;
}
