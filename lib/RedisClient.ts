import { createClient, RedisClientType } from "redis";

export const RedisClientConfig: RedisClientType = createClient({
  url: "redis://localhost:6379",
});

export async function initializeRedisClient(): Promise<RedisClientType> {
  RedisClientConfig.on("error", (err: any) =>
    console.log("Redis Client Error", err)
  );
  RedisClientConfig.on("connect", () => console.log("Redis Client Connected"));

  await RedisClientConfig.connect();

  return RedisClientConfig;
}
