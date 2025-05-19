const Sequelize = require('sequelize');
const config = require('../configs/db'); 
const iv_camerasModel = require('./iv_cameras');
const iv_cameras = require('./iv_cameras');

const sequelize = config;

const models = {
  iv_cameras: iv_camerasModel(sequelize, Sequelize.DataTypes),
};

module.exports = {
  sequelize,
  ...models,
};
