"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
const cn_1 = __importDefault(require("./cn"));
const hk_1 = __importDefault(require("./hk"));
const history = require(path_1.default.resolve(constants_1.DATA_PATH, "./history.json"));
if (!fs_1.default.existsSync(constants_1.DATA_PATH)) {
    fs_1.default.mkdirSync(constants_1.DATA_PATH);
}
if (!fs_1.default.existsSync(constants_1.CACHE_PATH)) {
    fs_1.default.mkdirSync(constants_1.CACHE_PATH);
}
inquirer_1.default
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
    const cnList = [];
    const hkList = [];
    const usList = [];
    stockCodeList
        .replace(/\s+/g, "")
        .split(",")
        .forEach((stockCode) => {
        if (/\d{6}/.test(stockCode)) {
            cnList.push(stockCode);
            if (history.cn.indexOf(stockCode) === -1) {
                history.cn.push(stockCode);
            }
        }
        else if (/\d{5}/.test(stockCode)) {
            hkList.push(stockCode);
            if (history.hk.indexOf(stockCode) === -1) {
                history.hk.push(stockCode);
            }
        }
        else if (/^[A-Za-z]+$/.test(stockCode)) {
            usList.push(stockCode);
            if (history.us.indexOf(stockCode) === -1) {
                history.us.push(stockCode);
            }
        }
    });
    fs_1.default.writeFile(path_1.default.resolve(constants_1.DATA_PATH, "./history.json"), JSON.stringify(history, null, 2), "utf8", err => {
        if (err)
            console.warn(err);
    });
    if (cnList.length > 0)
        cn_1.default.run(cnList);
    if (hkList.length > 0)
        hk_1.default.run(hkList);
});
