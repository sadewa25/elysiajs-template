import jwt from "@elysiajs/jwt";
import { PrismaClient } from "@prisma/client";
import Elysia from "elysia";
import { JWT_NAME } from "../config/constant";
import { RedisClientConfig } from "./RedisClient";

const prisma = new PrismaClient();

const AuthPlugin = (app: Elysia) =>
  app
    .use(
      jwt({
        name: JWT_NAME,
        secret: Bun.env.JWT_SECRET!,
      })
    )
    .derive(async ({ jwt, cookie: { accessToken, refreshToken }, set }) => {
      if (!accessToken.value) {
        // handle error for access token is not available
        set.status = "Unauthorized";
        throw new Error("Access token is missing");
      }
      const jwtPayload = await jwt.verify(accessToken.value);
      if (!jwtPayload) {
        // handle error for access token is tempted or incorrect
        set.status = "Forbidden";
        throw new Error("Access token is invalid");
      }

      const userId = jwtPayload.sub as string;

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        // handle error for user not found from the provided access token
        set.status = "Forbidden";
        throw new Error("Access token is invalid");
      }

      // implement single session based on redis to make sure that token is same with the new
      const redisToken = await RedisClientConfig.hGetAll(userId);

      if (redisToken.refresh_token !== refreshToken.value) {
        set.status = "Unauthorized";
        throw new Error("Refresh token is invalid");
      }

      return {
        user,
      };
    });

export { AuthPlugin };
