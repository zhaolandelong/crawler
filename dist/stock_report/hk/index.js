"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("./services");
const constants_1 = require("./constants");
const constants_2 = require("../constants");
const utils_1 = require("../utils");
exports.default = {
    run(codeArr) {
        codeArr.forEach(code => {
            setTimeout(() => {
                const promiseArr = [];
                Object.keys(constants_1.HK_REPORT_TYPE_MAP).forEach(key => {
                    const reportType = key;
                    promiseArr.push(services_1.fetchData({
                        code,
                        reportType
                    }).then(res => {
                        res.unshift(constants_1.HK_REPORT_TYPE_MAP[reportType].headers);
                        // 只要 DEAL_YEAR 后的数据
                        return res.filter(row => typeof row[0] === "string" && row[0] > String(constants_2.DEAL_YEAR));
                    }));
                });
                Promise.all(promiseArr).then(resArr => {
                    const dataMap = {};
                    Object.keys(constants_1.HK_REPORT_TYPE_MAP).forEach((key, index) => {
                        dataMap[key] = resArr[index];
                    });
                    utils_1.exportXlsx(code, dataMap);
                });
            }, 100);
        });
    }
};
