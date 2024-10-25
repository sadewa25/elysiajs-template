import * as Minio from "minio";
const MinioClient = new Minio.Client({
  endPoint: "192.168.110.11",
  port: 9000,
  useSSL: false,
  accessKey: "U81ZPIuESvGbVY2LoFLq",
  secretKey: "j2E9ugX4QZ1mx2MrSdmKE2TZpTB4na1eXAqYFsgU",
});

export default MinioClient;
