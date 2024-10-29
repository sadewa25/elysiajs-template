import { t } from "elysia";

export const UploadFileModel = t.Object({
  file: t.File({
    type: ["image/png", "image/jpeg", "image/gif", "image/bmp", "image/webp"], // List of acceptable image types
    maxSize: 5 * 1024 * 1024, // 5 MB in bytes
  }),
});
