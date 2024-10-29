import ShortUniqueId from "short-unique-id";
import { isMetaDataImg } from "../utils/extension";
import MinioClient from "../lib/MinioClient";

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
};
