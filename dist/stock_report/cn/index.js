"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const constants_1 = require("./constants");
const services_1 = require("./services");
const constants_2 = require("../constants");
const utils_1 = require("../utils");
const utils_2 = require("./utils");
exports.default = {
    run(codeArr) {
        const allPromise = [];
        codeArr.forEach(({ code }) => {
            allPromise.push(new Promise((rev, rej) => {
                setTimeout(() => {
                    const promiseArr = [];
                    const dataMap = {};
                    Object.keys(constants_1.CN_REPORT_TYPE_MAP).forEach(key => {
                        const reportType = key;
                        if (reportType === "standard") {
                            promiseArr.push(services_1.fetchStandard(code).then(res => {
                                const result = utils_2.formatObj2ArrByHeader(res.filter(row => utils_2.dataFilterCallback(row.reportdate, constants_2.DEAL_YEAR, constants_2.CURRENT_YEAR)), constants_1.CN_REPORT_TYPE_MAP[reportType].headers);
                                dataMap[reportType] = result;
                                return result;
                            }));
                        }
                        else {
                            promiseArr.push(services_1.fetchOtherReport({
                                code,
                                reportType
                            }).then(res => {
                                const result = utils_2.formatObj2ArrByHeader(res.filter(row => utils_2.dataFilterCallback(row.reportdate, constants_2.DEAL_YEAR, constants_2.CURRENT_YEAR)), constants_1.CN_REPORT_TYPE_MAP[reportType].headers);
                                dataMap[reportType] = result;
                                return result;
                            }));
                        }
                    });
                    Promise.all(promiseArr).then(() => {
                        rev(lodash_1.default.cloneDeep(dataMap));
                        // 每个都生成单独的文件
                        // 加头
                        // Object.entries(dataMap).forEach(([key, value]) => {
                        //   value.unshift(
                        //     Object.values(CN_REPORT_TYPE_MAP[key as ReportType].headers)
                        //   );
                        //   return value;
                        // });
                        // exportXlsx(`${DATA_PATH}/${code}.xlsx`, dataMap);
                    });
                }, 100);
            }));
        });
        Promise.all(allPromise).then(allDataArr => {
            const allData = utils_1.mergeDataByStock(allDataArr);
            // 加头
            Object.entries(allData).forEach(([key, value]) => {
                const headers = lodash_1.default.get(constants_1.CN_REPORT_TYPE_MAP, `${key}.headers`);
                if (value && headers) {
                    value.unshift(Object.values(headers));
                }
                return value;
            });
            utils_1.exportXlsx(`${constants_2.DATA_PATH}/cn_${new Date()}.xlsx`, allData);
        });
    },
    checkStock(code) {
        return /\d{6}/.test(code);
    }
};
//# sourceMappingURL=index.js.map