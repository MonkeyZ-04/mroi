import fs from "node:fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import { DATABASE } from "@configs";

var sequelize = new Sequelize(DATABASE.default);
let models = {};

const init = async () => {
  const files = fs
    .readdirSync(__dirname)
    .filter((file) => file.indexOf(".") !== 0 && file !== path.basename(__filename) && file.slice(-3) === ".js");

  await Promise.all(
    files.map(async (file) => {
      const module = await import(path.join(__dirname, file));
      const model = module.default(sequelize, DataTypes);
      models[model.name] = model;
    })
  );

  Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });

  return;
};

export default models;
export { init, sequelize, Sequelize };
