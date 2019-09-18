import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { DATA_PATH, CACHE_PATH } from "./constants";
import cn from "./cn";
import hk from "./hk";
import us from "./us";

const history = require(path.resolve(DATA_PATH, "./history.json"));

if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH);
}

if (!fs.existsSync(CACHE_PATH)) {
  fs.mkdirSync(CACHE_PATH);
}

inquirer
  .prompt([
    {
      type: "input",
      name: "stockCodeList",
      message: "Please input stock code:"
      // validate: function(input) {
      //   if (isNaN(input)) {
      //     return "Must be number!";
      //   }
      //   return true;
      // }
    }
  ])
  .then(answers => {
    const { stockCodeList } = answers;
    const cnList: string[] = [];
    const hkList: string[] = [];
    const usList: string[] = [];
    stockCodeList
      .replace(/\s+/g, "")
      .split(",")
      .forEach((stockCode: string) => {
        if (cn.checkStock(stockCode)) {
          cnList.push(stockCode);
          if (history.cn.indexOf(stockCode) === -1) {
            history.cn.push(stockCode);
          }
        } else if (hk.checkStock(stockCode)) {
          hkList.push(stockCode);
          if (history.hk.indexOf(stockCode) === -1) {
            history.hk.push(stockCode);
          }
        } else if (us.checkStock(stockCode)) {
          usList.push(stockCode);
          if (history.us.indexOf(stockCode) === -1) {
            history.us.push(stockCode);
          }
        }
      });
    fs.writeFile(
      path.resolve(DATA_PATH, "./history.json"),
      JSON.stringify(history, null, 2),
      "utf8",
      err => {
        if (err) console.warn(err);
      }
    );
    if (cnList.length > 0) cn.run(cnList);
    if (hkList.length > 0) hk.run(hkList);
    if (usList.length > 0) us.run(usList);
  });
