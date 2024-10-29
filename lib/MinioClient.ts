import * as Minio from "minio";
const MinioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: Bun.env.MINIO_ACCESS_KEY!,
  secretKey: Bun.env.MINIO_SECRET_KEY!,
});

export default MinioClient;
