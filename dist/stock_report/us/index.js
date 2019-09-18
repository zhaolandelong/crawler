"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const constants_2 = require("./constants");
const lodash_1 = __importDefault(require("lodash"));
const utils_1 = require("../utils");
const services_1 = require("./services");
exports.default = {
    run(codeArr) {
        const allPromise = [];
        codeArr.forEach(code => {
            allPromise.push(new Promise((rev, rej) => {
                setTimeout(() => {
                    const promiseArr = [];
                    const dataMap = {};
                    Object.keys(constants_2.US_REPORT_TYPE_MAP).forEach(key => {
                        const reportType = key;
                        promiseArr.push(services_1.fetchData(code, reportType).then(res => {
                            dataMap[reportType] = res;
                            return res;
                        }));
                    });
                    Promise.all(promiseArr).then(() => {
                        rev(lodash_1.default.cloneDeep(dataMap));
                        // 每个都生成单独的文件
                        // 加头
                        // Object.entries(dataMap).forEach(([key, value]) => {
                        //   value.unshift(
                        //     US_REPORT_TYPE_MAP[key as ReportTypeWithoutStandard].headers
                        //   );
                        //   return value;
                        // });
                        // exportXlsx(`${DATA_PATH}/${code}.xlsx`, dataMap);
                    });
                }, 100);
            }));
        });
        Promise.all(allPromise).then(allDataArr => {
            const allData = utils_1.mergeDataByStock(allDataArr, row => {
                if (typeof row[1] === "string" && typeof row[2] === "string") {
                    return ((row[1] === "quarter" && row[2] > String(constants_1.CURRENT_YEAR)) ||
                        (row[1] === "annual" && row[2] > String(constants_1.DEAL_YEAR)));
                }
                return false;
            });
            // 加头
            Object.entries(allData).forEach(([key, value]) => {
                const headers = lodash_1.default.get(constants_2.US_REPORT_TYPE_MAP, `${key}.headers`);
                if (value && headers) {
                    value.unshift(headers);
                }
                return value;
            });
            utils_1.exportXlsx(`${constants_1.DATA_PATH}/us_${new Date().toLocaleString()}.xlsx`, allData);
        });
    },
    checkStock(code) {
        return /^[A-Za-z]+$/.test(code);
    }
};
//# sourceMappingURL=index.js.map