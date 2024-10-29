import { fileTypeFromBuffer } from "file-type";

function getExpTimestamp(seconds: number) {
  const currentTimeMillis = Date.now();
  const secondsIntoMillis = seconds * 1000;
  const expirationTimeMillis = currentTimeMillis + secondsIntoMillis;

  return Math.floor(expirationTimeMillis / 1000);
}

const isMetaDataImg = async (values: ArrayBuffer) => {
  // Read file content as array buffer
  const buffer = new Uint8Array(values);

  // Check if the file is an image based on its binary content
  const type = await fileTypeFromBuffer(buffer);
  if (!type || !type.mime.startsWith("image/")) {
    return false;
  }
  return true;
};

export { getExpTimestamp, isMetaDataImg };
