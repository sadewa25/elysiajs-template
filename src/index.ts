import cors from "@elysiajs/cors";
import serverTiming from "@elysiajs/server-timing";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { RouteUsers } from "../routes/RouteUser";
import { initializeRedisClient } from "../lib/RedisClient";
import { RouteUpload } from "../routes/RouteUpload";
import apollo from "@elysiajs/apollo";
import { resolversGql, typeDefsGql } from "../lib/GqlPlugin";

const app = new Elysia();

//cors
app.use(
  cors({
    preflight: true,
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//server timing
app.use(
  serverTiming({
    trace: {
      request: true,
      mapResponse: true,
      total: true,
    },
  })
);

//swagger
app.use(
  swagger({
    documentation: {
      info: {
        title: "API Boilerplate Elysia.js",
        version: "0.0.1-rc",
      },
      tags: [
        {
          name: "User",
          description: "Endpoints related to user",
        },
        {
          name: "Default",
          description: "Basic default templates",
        },
      ],
    },
    path: "/",
  })
);

// apollo graphql
app
  .use(
    apollo({
      typeDefs: typeDefsGql,
      resolvers: resolversGql,
      path: "/graphql-api",
      context: async ({ request }: { request: Request }) => {
        const authorization = request.headers.get("Authorization");
        const split_auth = authorization?.split("Bearer ");
        if (split_auth && split_auth[1] === "admin") {
          return {
            request,
            authorization,
          };
        } else {
          const error = new Error("Unauthorized");
          throw error;
        }
      },
      formatError: (err) => {
        if (err.message === "Context creation failed: Unauthorized") {
          // Set HTTP status code to 401
          return {
            message: err.message,
            extensions: {
              code: "UNAUTHORIZED",
            },
          };
        }
        return err;
      },
    })
  );

// redis client config
initializeRedisClient();

app.get(
  "/info",
  () => {
    return {
      author: "sadewawicak25",
    };
  },
  {
    tags: ["Default"],
  }
);

//users
app.use(RouteUsers);
//upload minio
app.use(RouteUpload);

app.listen(3000);
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
