"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const json2csv_1 = require("json2csv");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const constants_2 = require("../constants");
const utils_2 = require("../utils");
if (!fs_1.default.existsSync(constants_2.DATA_PATH)) {
    fs_1.default.mkdirSync(constants_2.DATA_PATH);
}
exports.default = {
    run(codeArr) {
        codeArr.forEach(code => {
            const promiseArr = [];
            // 业绩报表
            const performancePath = `${constants_2.DATA_PATH}/${code}_performance.csv`;
            // if (!fs.existsSync(performancePath)) {
            promiseArr.push(utils_1.fetchPerformanceReport(code).then(res => {
                const { fields, data } = utils_1.formatJsonpData2csv(res.fontMap, res.data);
                const csv = json2csv_1.parse(data, { fields });
                console.log(`${performancePath} download finish`);
                fs_1.default.writeFile(performancePath, csv, constants_2.ENCODING, err => {
                    if (err)
                        console.warn(err);
                });
                return data;
            }));
            // }
            // 现金流量表 利润表 资产负债表
            Object.keys(constants_1.REPORT_TABLES).forEach(key => {
                const reportType = key;
                const path = `${constants_2.DATA_PATH}/${code}_${key}.csv`;
                promiseArr.push(utils_1.fetchStockReport({
                    code,
                    reportType
                }).then(res => {
                    utils_2.updateCache({
                        code,
                        reportType,
                        data: JSON.stringify(res, null, 2)
                    });
                    const { fields, data } = utils_1.formatJsonpData2csv(lodash_1.default.get(res, "font.FontMapping", []), lodash_1.default.get(res, "data", []));
                    console.log(`${path} download finish`);
                    const csv = json2csv_1.parse(data, { fields });
                    fs_1.default.writeFile(path, csv, constants_2.ENCODING, err => {
                        if (err)
                            console.warn(err);
                    });
                    return data;
                }));
                // }
            });
            if (promiseArr.length) {
                Promise.all(promiseArr).then(resArr => {
                    utils_1.buildDiy(resArr);
                });
            }
        });
    }
};
