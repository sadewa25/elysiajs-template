import Elysia, { t } from "elysia";
import { UploadController } from "../controller/UploadController";
import MinioClient from "../lib/MinioClient";
import { UploadFileModel } from "../model/UploadModel";

export const RouteUpload = (app: Elysia) =>
  app.group("/upload", (uploadFile) => {
    uploadFile.post(
      "/",
      async ({ body }) => UploadController.uploadFile({ file: body.file }),
      {
        tags: ["Upload"],
        type: "multipart/form-data",
        body: UploadFileModel,
      }
    );

    uploadFile.post(
      "/download",
      async ({ body }) => {
        const stream = await MinioClient.getObject(
          "privacy-storage",
          "sampel.png"
        );

        // Convert the stream to a buffer
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        const fileBuffer = Buffer.concat(chunks as unknown as Uint8Array[]);
        // Set response headers for PNG file
        const headers = {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="sampel.png"`,
        };

        // Return the file buffer as the response with headers
        return new Response(fileBuffer, { headers });
      },
      {
        tags: ["Upload"],
        type: "multipart/form-data",
        body: t.Object({
          file: t.File({
            type: "image/png",
          }),
        }),
      }
    );

    uploadFile.post(
      "/public_link",
      async ({ body }) => {
        const preDesignUrl = await MinioClient.presignedUrl(
          "GET",
          "privacy-storage",
          "sampel.png",
          60 * 1 //5 minutes in seconds
        );

        return {
          data: preDesignUrl,
          message: "success",
        };
      },
      {
        tags: ["Upload"],
        type: "multipart/form-data",
        body: t.Object({
          file: t.File({
            type: "image/png",
          }),
        }),
      }
    );

    return uploadFile;
  });
