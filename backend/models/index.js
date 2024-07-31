'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/database.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    console.log(`Attempting to load model from file: ${file}`);
    if (file === 'ReferenceVirtueFlaw.js') {
      console.log('Attempting to load model from file: ReferenceVirtueFlaw.js');
    }
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
    console.log(`Loaded model: ${model.name}`);
  });

console.log('Models before association:', Object.keys(db));

Object.keys(db).forEach(modelName => {
  console.log(`Checking associations for model: ${modelName}`);
  if (db[modelName].associate) {
    db[modelName].associate(db);
    console.log(`Associated model: ${modelName}`);
  } else {
    console.log(`No associations for model: ${modelName}`);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log('Loaded models:', Object.keys(db));

module.exports = db;