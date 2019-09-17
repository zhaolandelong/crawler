"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const fs_1 = __importDefault(require("fs"));
const json2csv_1 = require("json2csv");
const constants_1 = require("../constants");
function decodeData(fontMap, rootData) {
    return rootData.map(da => {
        const result = {};
        Object.entries(da).forEach(([key, value]) => {
            let codeVal = value;
            fontMap.forEach(fm => {
                codeVal = codeVal.replace(new RegExp(fm.code, "g"), String(fm.value));
            });
            result[key] = codeVal;
        });
        return result;
    });
}
exports.decodeData = decodeData;
function formatObj2ArrByHeader(data, headers) {
    const headerKeys = Object.keys(headers);
    const xlsxData = data.map(da => {
        return headerKeys.reduce((accumulator, current) => {
            accumulator.push(da[current]);
            return accumulator;
        }, []);
    });
    xlsxData.unshift(Object.values(headers));
    return xlsxData;
}
exports.formatObj2ArrByHeader = formatObj2ArrByHeader;
function dataFilterCallback(reportData, from, to) {
    return (reportData > String(to) ||
        new RegExp(`^(${lodash_1.default.times(to - from, i => from + i).join("|")})-12-31`).test(reportData));
}
exports.dataFilterCallback = dataFilterCallback;
function buildDiy(dataArr) {
    const [mergeObj, ...mergeSource] = dataArr;
    const totalData = lodash_1.default.merge(mergeObj, ...mergeSource).filter((data) => {
        const reportDate = data.reportdate;
        // current year all report
        // or
        // recent 3 years year-report
        return (reportDate > String(constants_1.CURRENT_YEAR) ||
            new RegExp(`^(${constants_1.CURRENT_YEAR - 1}|${constants_1.CURRENT_YEAR - 2}|${constants_1.CURRENT_YEAR - 3})-12-31`).test(reportDate));
    });
    const csv = json2csv_1.parse(totalData, {
        fields: [
            {
                label: "代码",
                value: "scode"
            },
            {
                label: "名称",
                value: "sname"
            },
            {
                label: "报告期",
                value: "reportdate"
            },
            {
                label: "行业",
                value: "publishname"
            },
            {
                label: "营业总收入(元)",
                value: "totaloperatereve"
            },
            {
                label: "同比增长(%)",
                value: "ystz"
            },
            {
                label: "季度环比增长(%)",
                value: "yshz"
            },
            {
                label: "销售商品、提供劳务收到的现金",
                value: "salegoodsservicerec"
            },
            {
                label: "销售商品、提供劳务收到的现金占比",
                value: "salegoodsservicerec_zb"
            },
            {
                label: "净利润(元)",
                value: "parentnetprofit"
            },
            {
                label: "净利润同比(%)",
                value: "sjltz"
            },
            {
                label: "季度环比增长(%)",
                value: "sjlhz"
            },
            {
                label: "销售毛利率(%)",
                value: "xsmll"
            },
            {
                label: "总负债(元)",
                value: "sumliab"
            },
            {
                label: "总负债同比(%)",
                value: "tdetz"
            }
        ]
    });
    fs_1.default.appendFile(`./data/diy_report.csv`, csv, "utf-8", err => {
        err && console.log(err);
    });
}
exports.buildDiy = buildDiy;
