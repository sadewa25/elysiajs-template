import { Elysia } from "elysia";
import { RouteUsers } from "../routes/RouteUser";

const app = new Elysia().get("/", () => "Hello Elysia");
app.use(RouteUsers);

app.listen(3000);
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
