"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const services_1 = require("./services");
const constants_2 = require("../constants");
const utils_1 = require("../utils");
const utils_2 = require("./utils");
exports.default = {
    run(codeArr) {
        codeArr.forEach(code => {
            const promiseArr = [];
            Object.keys(constants_1.CN_REPORT_TYPE_MAP).forEach(key => {
                const reportType = key;
                if (reportType === "standard") {
                    promiseArr.push(services_1.fetchStandard(code).then(res => res.filter(row => utils_2.dataFilterCallback(row.reportdate, constants_2.DEAL_YEAR, constants_2.CURRENT_YEAR))));
                }
                else {
                    promiseArr.push(services_1.fetchOtherReport({
                        code,
                        reportType
                    }).then(res => res.filter(row => utils_2.dataFilterCallback(row.reportdate, constants_2.DEAL_YEAR, constants_2.CURRENT_YEAR))));
                }
            });
            Promise.all(promiseArr).then(resArr => {
                const dataMap = {};
                Object.keys(constants_1.CN_REPORT_TYPE_MAP).forEach((key, index) => {
                    const reportType = key;
                    dataMap[reportType] = utils_2.formatObj2ArrByHeader(resArr[index], constants_1.CN_REPORT_TYPE_MAP[reportType].headers);
                });
                utils_1.exportXlsx(code, dataMap);
            });
        });
    }
};
