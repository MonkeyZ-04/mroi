const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE } = process.env;

export default {
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: false,
  //timezone: "+07:00",
  dialectOptions: {
    prependSearchPath: true,
  },
};
