import { now } from "@utils/date";

export default async (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token, Authorization");

  req.workspaceAlias = req.headers["x-kd-workspace"] || "sky";
  req.serverTime = now().valueOf();

  next();
};
