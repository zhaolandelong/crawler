"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const string_random_1 = __importDefault(require("string-random"));
const json2csv_1 = require("json2csv");
const constants_1 = require("./constants");
const constants_2 = require("../constants");
const utils_1 = require("../utils");
function formatJsonpData2csv(fontMap, rootData) {
    let fields = [];
    const data = rootData.map(da => {
        const result = {};
        if (fields.length === 0) {
            fields = formatCsvFields(Object.keys(da));
        }
        Object.entries(da).forEach(([key, value]) => {
            let codeVal = value;
            fontMap.forEach(fm => {
                codeVal = codeVal.replace(new RegExp(fm.code, "g"), fm.value);
            });
            result[key] = codeVal;
        });
        return result;
    });
    return {
        fields,
        data
    };
}
exports.formatJsonpData2csv = formatJsonpData2csv;
function formatCsvFields(fields) {
    return fields.map(fKey => ({
        label: (constants_1.HEADER_MAP[fKey] || "") + "_" + fKey,
        value: fKey
    }));
}
exports.formatCsvFields = formatCsvFields;
function returnJsonpData(varName, evalStr) {
    eval(evalStr.replace("var ", "global."));
    return eval(`global.${varName}`);
}
exports.returnJsonpData = returnJsonpData;
function fetchStockReport(params) {
    const { code, reportType } = params;
    if (!code) {
        console.warn("[code] is required in [fetchStockReport] !");
        return new Promise(rev => rev(null));
    }
    if (!reportType) {
        console.warn("[type] is required in [fetchStockReport] !");
        return new Promise(rev => rev(null));
    }
    return utils_1.getCache({
        code,
        reportType
    }).then(data => {
        if (data)
            return data;
        const jsonp = string_random_1.default(6, { numbers: false });
        const { type, rt } = constants_1.REPORT_TABLES[reportType];
        const baseParams = {
            filter: `(scode=${code})`,
            js: `var ${jsonp}={pages:(tp),data: (x),font:(font)}`,
            p: "1",
            ps: "50",
            sr: "-1",
            st: "reportdate",
            token: constants_1.TOKEN,
            type,
            rt
        };
        return axios_1.default
            .get("http://dcfm.eastmoney.com/em_mutisvcexpandinterface/api/js/get", {
            params: lodash_1.default.merge(baseParams, params)
        })
            .then(res => {
            const rootData = returnJsonpData(jsonp, res.data);
            return rootData;
        });
    });
}
exports.fetchStockReport = fetchStockReport;
function fetchPerformanceReport(code) {
    return utils_1.getCache({
        code,
        reportType: "standard"
    }).then(standardData => {
        if (standardData)
            return standardData;
        return utils_1.fetchHTML(`http://data.eastmoney.com/bbsj/yjbb/${code}.html`).then(htmlStr => {
            const fontMapMath = htmlStr.match(/"FontMapping":(\[.+"value":0}])/);
            const fontMap = JSON.parse(lodash_1.default.get(fontMapMath, "[1]", "[]"));
            const dataMatch = htmlStr.match(/data: (\[.+\]),font:/);
            const data = JSON.parse(lodash_1.default.get(dataMatch, "[1]", "[]"));
            const result = {
                fontMap,
                data
            };
            utils_1.updateCache({
                code,
                reportType: "standard",
                data: JSON.stringify(result, null, 2)
            });
            return result;
        });
    });
}
exports.fetchPerformanceReport = fetchPerformanceReport;
function buildDiy(dataArr) {
    const [mergeObj, ...mergeSource] = dataArr;
    const totalData = lodash_1.default.merge(mergeObj, ...mergeSource).filter((data) => {
        const reportDate = data.reportdate;
        // current year all report
        // or
        // recent 3 years year-report
        return (reportDate > String(constants_2.CURRENT_YEAR) ||
            new RegExp(`^(${constants_2.CURRENT_YEAR - 1}|${constants_2.CURRENT_YEAR - 2}|${constants_2.CURRENT_YEAR - 3})-12-31`).test(reportDate));
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
