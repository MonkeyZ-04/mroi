import "dotenv/config";
import app from "../";
import debugLib from "debug";
const debug = debugLib("KNOWSchoolService:server");

app();
