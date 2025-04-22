import jwt from "jsonwebtoken";
import { GENERAL } from "@configs";
import { now } from "./date";

const { AUTH_BASIC_USERNAME, AUTH_BASIC_PASSWORD } = GENERAL;
const SECRET_KEY = `${AUTH_BASIC_USERNAME}:${AUTH_BASIC_PASSWORD}`;

export const signJWT = (payload, exp = null) => {
  const dateNow = now();
  let encPayload = { ...payload, iat: dateNow.valueOf() };
  if (exp) {
    encPayload.exp = dateNow.add(exp, "minute").valueOf();
  }
  return jwt.sign(encPayload, SECRET_KEY);
};
export const verifyJWT = (token) => jwt.verify(token, SECRET_KEY);
