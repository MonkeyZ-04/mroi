import axios from "axios";
import { nanoid } from "nanoid";
import fs from "node:fs";
import path from "node:path";

export const downloadImageFromURL = async ({ url }) => {
  url = url.trim();
  const response = await axios.get(encodeURI(url), { responseType: "stream" });

  const fileExt = url.split(".").pop();
  const fileName = `${nanoid(32)}.${fileExt}`;
  const filePath = path.resolve(__dirname, "..", "downloads", fileName);
  const fileWriter = fs.createWriteStream(filePath);
  const fileType = response.headers["content-type"];

  response.data.pipe(fileWriter);

  return new Promise((resolve, reject) => {
    fileWriter.on("finish", () => {
      resolve({ fileName, filePath, fileExt, fileType });
    });
    fileWriter.on("error", reject);
  });
};

export const convertToBase64 = async (filePath) => {
  const file = fs.readFileSync(filePath);
  return Buffer.from(file).toString("base64");
};
