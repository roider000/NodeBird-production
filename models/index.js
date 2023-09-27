const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;

// __filename : C:\Users\mikg2\Desktop\project\models\index.js  [현재 파일]
// path.basename(__filename) : index.js                         [마지막 경로의 파일 또는 폴더]
const basename = path.basename(__filename);

// __dirname : C:\Users\mikg2\Desktop\project\models            [현재 폴더]
// fs.readdirSync(__dirname) : [hashtag.js, index.js, ...]      [해당 폴더의 내용물을 배열로 반환]
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      !file.includes("test") &&
      file !== basename &&
      file.slice(-3) === ".js"
    );
    // 숨김파일과 index.js, user.test.js를 제외 && 확장자는 항상 .js여야 한다.
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    console.log(file, model.name); // 불러온 객체.name → 객체명
    db[model.name] = model;
    model.initiate(sequelize);
  });

Object.keys(db).forEach((modelName) => {
  console.log(db, modelName);
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
