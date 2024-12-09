import cors from "@elysiajs/cors";
import serverTiming from "@elysiajs/server-timing";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { RouteUsers } from "../routes/RouteUser";
import { initializeRedisClient } from "../lib/RedisClient";
import { RouteUpload } from "../routes/RouteUpload";

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
          name: "Upload",
          description: "Endpoints related to upload minio",
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
