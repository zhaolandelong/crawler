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
const us_1 = __importDefault(require("./us"));
const utils_1 = require("./utils");
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
    }
])
    .then(answers => {
    const { stockCodeList } = answers;
    const cnList = [];
    const hkList = [];
    const usList = [];
    const promiseArr = [];
    stockCodeList
        .replace(/\s+/g, "")
        .split(",")
        .forEach((code) => {
        promiseArr.push(utils_1.fetchNameByCode(code).then(name => {
            const obj = {
                code,
                name
            };
            if (cn_1.default.checkStock(code)) {
                cnList.push(obj);
                if (!history.cn.find((obj) => obj.code === code)) {
                    history.cn.push(obj);
                }
            }
            else if (hk_1.default.checkStock(code)) {
                hkList.push(obj);
                if (!history.hk.find((obj) => obj.code === code)) {
                    history.hk.push(obj);
                }
            }
            else if (us_1.default.checkStock(code)) {
                usList.push(obj);
                if (!history.us.find((obj) => obj.code === code)) {
                    history.us.push(obj);
                }
            }
            return obj;
        }));
    });
    Promise.all(promiseArr).then(() => {
        fs_1.default.writeFile(path_1.default.resolve(constants_1.DATA_PATH, "./history.json"), JSON.stringify(history, null, 2), "utf8", err => {
            if (err)
                console.warn(err);
        });
        if (cnList.length > 0)
            cn_1.default.run(cnList);
        if (hkList.length > 0)
            hk_1.default.run(hkList);
        if (usList.length > 0)
            us_1.default.run(usList);
    });
});
//# sourceMappingURL=index.js.map