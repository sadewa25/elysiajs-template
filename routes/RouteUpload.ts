import Elysia from "elysia";
import { UploadController } from "../controller/UploadController";
import { GetNameFileModel, UploadFileModel, } from "../model";


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
      async ({ body }) =>
        UploadController.downloadFile({
          name_file: body.name_file,
        }),
      {
        tags: ["Upload"],
        type: "application/json",
        body: GetNameFileModel,
      }
    );

    uploadFile.post(
      "/public_link",
      async ({ body }) =>
        UploadController.publicLinkFile({ name_file: body.name_file }),
      {
        tags: ["Upload"],
        type: "application/json",
        body: GetNameFileModel,
      }
    );

    return uploadFile;
  });
