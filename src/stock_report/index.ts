import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import _ from "lodash";
import { DATA_PATH, CACHE_PATH, StockObj } from "./constants";
import cn from "./cn";
import hk from "./hk";
import us from "./us";
import { fetchNameByCode } from "./utils";

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
    }
  ])
  .then(answers => {
    const { stockCodeList } = answers;
    const cnList: StockObj[] = [];
    const hkList: StockObj[] = [];
    const usList: StockObj[] = [];
    const promiseArr: Promise<StockObj>[] = [];
    stockCodeList
      .replace(/\s+/g, "")
      .split(",")
      .forEach((code: string) => {
        promiseArr.push(
          fetchNameByCode(code).then(name => {
            const obj = {
              code,
              name
            };
            if (cn.checkStock(code)) {
              cnList.push(obj);
              if (!history.cn.find((obj: StockObj) => obj.code === code)) {
                history.cn.push(obj);
              }
            } else if (hk.checkStock(code)) {
              hkList.push(obj);
              if (!history.hk.find((obj: StockObj) => obj.code === code)) {
                history.hk.push(obj);
              }
            } else if (us.checkStock(code)) {
              usList.push(obj);
              if (!history.us.find((obj: StockObj) => obj.code === code)) {
                history.us.push(obj);
              }
            }
            return obj;
          })
        );
      });
    Promise.all(promiseArr).then(() => {
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
  });
