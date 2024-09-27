import jwt from "@elysiajs/jwt";
import { PrismaClient } from "@prisma/client";
import Elysia from "elysia";
import {
  ACCESS_TOKEN_EXP,
  JWT_NAME,
  REFRESH_TOKEN_EXP,
} from "../config/constant";
import { UserController } from "../controller/UserController";
import { AuthPlugin } from "../lib/AuthPlugin";
import { initializeRedisClient, RedisClientConfig } from "../lib/RedisClient";
import { UserCreateModels } from "../model";
import { UserLoginModels } from "../model/UserModel";
import { getExpTimestamp } from "../utils/extension";

const prisma = new PrismaClient();

export const RouteUsers = (app: Elysia) =>
  app
    .use(
      jwt({
        name: JWT_NAME,
        secret: Bun.env.JWT_SECRET!,
      })
    )
    .group("/user", (user) => {
      user.post(
        "/",
        async ({ body }) =>
          UserController.addUser({
            body: body,
          }),
        {
          body: UserCreateModels,
          tags: ["User"],
          type: "multipart/form-data",
        }
      );

      user.post(
        "/sign-in",
        async ({ body, jwt, cookie: { accessToken, refreshToken }, set }) => {
          const user = await prisma.user.findUnique({
            where: { email: body.email },
            select: {
              id: true,
              email: true,
              password: true,
            },
          });
          if (!user) {
            set.status = "Bad Request";
            throw new Error(
              "The email address or password you entered is incorrect"
            );
          }

          // match password
          const matchPassword = await Bun.password.verify(
            body.password,
            user.password,
            "bcrypt"
          );
          if (!matchPassword) {
            set.status = "Bad Request";
            throw new Error(
              "The email address or password you entered is incorrect"
            );
          }

          const datetime = Math.floor(Date.now() / 1000);

          // create access token
          const accessJWTToken = await jwt.sign({
            sub: user.id,
            exp: getExpTimestamp(ACCESS_TOKEN_EXP),
            iat: datetime,
          });
          accessToken.set({
            value: accessJWTToken,
            httpOnly: true,
            maxAge: ACCESS_TOKEN_EXP,
            sameSite: "lax",
            path: "/",
            secure: true,
          });

          // create refresh token
          const refreshJWTToken = await jwt.sign({
            sub: user.id,
            exp: getExpTimestamp(REFRESH_TOKEN_EXP),
            iat: datetime,
          });
          refreshToken.set({
            value: refreshJWTToken,
            httpOnly: true,
            maxAge: REFRESH_TOKEN_EXP,
            path: "/",
            sameSite: "lax",
            secure: true,
          });

          // const redisClient = await initializeRedisClient();
          await RedisClientConfig.hSet(
            user.id,
            "refresh_token",
            refreshJWTToken
          );

          return {
            message: "Sigin successfully",
            data: {
              user: user,
              accessToken: accessJWTToken,
              refreshToken: refreshJWTToken,
            },
          };
        },
        {
          body: UserLoginModels,
        }
      );

      user.use(AuthPlugin).get("/", () => UserController.getUser(), {
        tags: ["User"],
      });

      user.use(AuthPlugin).get("/me", ({ user }) => {
        return {
          message: "Fetch current user",
          data: {
            user,
          },
        };
      });

      user
        .use(AuthPlugin)
        .post(
          "/logout",
          async ({ cookie: { accessToken, refreshToken }, user }) => {
            // remove refresh token and access token from cookies
            accessToken.remove();
            refreshToken.remove();

            return {
              message: "Logout successfully",
            };
          }
        );

      user
        .use(AuthPlugin)
        .post(
          "/refresh",
          async ({ cookie: { accessToken, refreshToken }, jwt, set }) => {
            if (!refreshToken.value) {
              // handle error for refresh token is not available
              set.status = "Unauthorized";
              throw new Error("Refresh token is missing");
            }
            // get refresh token from cookie
            const jwtPayload = await jwt.verify(refreshToken.value);
            if (!jwtPayload) {
              // handle error for refresh token is tempted or incorrect
              set.status = "Forbidden";
              throw new Error("Refresh token is invalid");
            }

            // get user from refresh token
            const userId = jwtPayload.sub;

            // verify user exists or not
            const user = await prisma.user.findUnique({
              where: {
                id: userId,
              },
            });

            if (!user) {
              // handle error for user not found from the provided refresh token
              set.status = "Forbidden";
              throw new Error("Refresh token is invalid");
            }

            const datetime = Math.floor(Date.now() / 1000);

            // create new access token
            const accessJWTToken = await jwt.sign({
              sub: user.id,
              exp: getExpTimestamp(ACCESS_TOKEN_EXP),
              iat: datetime,
            });
            accessToken.set({
              value: accessJWTToken,
              httpOnly: true,
              maxAge: ACCESS_TOKEN_EXP,
              path: "/",
            });

            // create new refresh token
            const refreshJWTToken = await jwt.sign({
              sub: user.id,
              exp: getExpTimestamp(REFRESH_TOKEN_EXP),
              iat: datetime,
            });
            refreshToken.set({
              value: refreshJWTToken,
              httpOnly: true,
              maxAge: REFRESH_TOKEN_EXP,
              path: "/",
            });

            const redisClient = await initializeRedisClient();

            // set refresh token in db
            await redisClient.hSet(user.id, "refresh_token", refreshJWTToken);

            return {
              message: "Access token generated successfully",
              data: {
                accessToken: accessJWTToken,
                refreshToken: refreshJWTToken,
              },
            };
          }
        );

      return user;
    });
