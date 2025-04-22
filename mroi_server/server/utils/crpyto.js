import bcrypt from "bcrypt";

const saltEncrypt = (text) => bcrypt.hash(text, 10);
const saltCompare = (text, compareText) => bcrypt.compare(compareText, text);

const base64Encode = (text) => Buffer.from(text).toString("base64");
const base64Decode = (enc) => Buffer.from(enc, "base64").toString("utf-8");

export { saltCompare, saltEncrypt, base64Encode, base64Decode };
