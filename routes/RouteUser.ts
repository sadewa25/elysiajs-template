import Elysia from "elysia";
import { UserController } from "../controller/UserController";
import { UserCreateModels } from "../model";

export const RouteUsers = (app: Elysia) =>
  app.group("/user", (user) => {
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

    user.get("/", () => UserController.getUser(), {
      tags: ["User"],
    });

    return user;
  });
