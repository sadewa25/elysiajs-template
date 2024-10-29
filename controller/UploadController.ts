import { fileTypeFromBuffer } from "file-type";
import ShortUniqueId from "short-unique-id";
import MinioClient from "../lib/MinioClient";
import { isMetaDataImg } from "../utils/extension";

export const UploadController = {
  uploadFile: async ({ file }: { file: File }) => {
    try {
      const fileBuffer = await file.arrayBuffer(); // Use arrayBuffer for binary data

      const { randomUUID } = new ShortUniqueId({ length: 20 });

      if (!(await isMetaDataImg(fileBuffer))) {
        return {
          data: null,
          message: "Uploaded file is not a valid image",
        };
      }

      const fileName = `${randomUUID()}.png`;
      const metadata = {
        "Content-Type": file.type,
        "Content-Length": file.size.toString(), // Set the content length
      };

      await MinioClient.putObject(
        Bun.env.BUCKET_NAME!,
        fileName,
        Buffer.from(fileBuffer), // Ensure correct buffer handling
        file.size,
        metadata
      );

      return {
        data: `File uploaded successfully to ${Bun.env.BUCKET_NAME}/${fileName}`,
        message: "success",
      };
    } catch (error) {
      return {
        data: "There is something wrong",
        message: "failed",
      };
    }
  },
  downloadFile: async ({ name_file }: { name_file: string }) => {
    const stream = await MinioClient.getObject(Bun.env.BUCKET_NAME!, name_file);

    // Convert the stream to a buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks as unknown as Uint8Array[]);

    //determine the file type from the buffer
    const type = await fileTypeFromBuffer(new Uint8Array(fileBuffer));
    if (!type) {
      return {
        data: null,
        message: "Unable to determine file type",
      };
    }

    // Set response headers for PNG file
    const headers = {
      "Content-Type": type?.mime ?? "image/jpeg",
      "Content-Disposition": `attachment; filename="${name_file}"`,
    };

    // Return the file buffer as the response with headers
    return new Response(fileBuffer, { headers });
  },
  publicLinkFile: async ({ name_file }: { name_file: string }) => {
    const preDesignUrl = await MinioClient.presignedUrl(
      "GET",
      Bun.env.BUCKET_NAME!,
      name_file,
      60 * 1 //5 minutes in seconds for expiry
    );

    return {
      data: preDesignUrl,
      message: "success",
    };
  },
};
