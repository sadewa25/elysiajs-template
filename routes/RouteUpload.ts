import Elysia, { t } from "elysia";
import MinioClient from "../lib/MinioClient";

export const RouteUpload = (app: Elysia) =>
  app.group("/upload", (uploadFile) => {
    uploadFile.post(
      "/",
      async ({ body }) => {
        const file = body.file;
        const fileBuffer = await file.arrayBuffer(); // Use arrayBuffer for binary data
        const bucketName = "privacy-storage";
        const fileName = `sampel.png`;
        const metaData = {
          "Content-Type": "image/png",
          "Content-Length": file.size.toString(), // Set the content length
        };

        await MinioClient.putObject(
          bucketName,
          fileName,
          Buffer.from(fileBuffer), // Ensure correct buffer handling
          file.size,
          metaData
        );

        return {
          data: `File uploaded successfully to ${bucketName}/${fileName}`,
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

    return uploadFile;
  });
