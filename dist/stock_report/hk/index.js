"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const services_1 = require("./services");
const constants_1 = require("./constants");
const constants_2 = require("../constants");
const utils_1 = require("../utils");
exports.default = {
    run(codeArr) {
        const allData = {
            standard: [],
            cash: [],
            profit: [],
            balance: []
        };
        const allPromise = [];
        codeArr.forEach(code => {
            allPromise.push(new Promise((rev, rej) => {
                setTimeout(() => {
                    const promiseArr = [];
                    const dataMap = {};
                    Object.keys(constants_1.HK_REPORT_TYPE_MAP).forEach(key => {
                        const reportType = key;
                        promiseArr.push(services_1.fetchData({
                            code,
                            reportType
                        }).then(res => {
                            const result = res
                                // .filter(
                                //   row =>
                                //     typeof row[0] === "string" && row[0] > String(DEAL_YEAR)
                                // )
                                .map(row => {
                                row.unshift(code);
                                return row;
                            });
                            dataMap[reportType] = result;
                            return result;
                        }));
                    });
                    Promise.all(promiseArr).then(() => {
                        rev(lodash_1.default.cloneDeep(dataMap));
                        // 每个都生成单独的文件
                        // 加头
                        // Object.entries(dataMap).forEach(([key, value]) => {
                        //   value.unshift([
                        //     "股票代码",
                        //     ...HK_REPORT_TYPE_MAP[key as ReportType].headers
                        //   ]);
                        //   return value;
                        // });
                        // exportXlsx(`${DATA_PATH}/${code}.xlsx`, dataMap);
                    });
                }, 100);
            }));
        });
        Promise.all(allPromise).then(allDataArr => {
            allDataArr.forEach(allDa => {
                lodash_1.default.mergeWith(allData, allDa, (objValue, srcValue) => {
                    const filterRes = srcValue.filter(row => typeof row[1] === "string" && row[1] > String(constants_2.DEAL_YEAR));
                    return objValue.concat(filterRes);
                });
            });
            // 加头
            Object.entries(allData).forEach(([key, value]) => {
                value.unshift([
                    "股票代码",
                    ...constants_1.HK_REPORT_TYPE_MAP[key].headers
                ]);
                return value;
            });
            utils_1.exportXlsx(`${constants_2.DATA_PATH}/hk_${new Date().toLocaleString()}.xlsx`, allData);
        });
    }
};
