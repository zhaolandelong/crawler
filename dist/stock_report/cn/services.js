"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const string_random_1 = __importDefault(require("string-random"));
const utils_1 = require("./utils");
const utils_2 = require("../utils");
const constants_1 = require("./constants");
function fetchStandard(code) {
    return utils_2.getCache({
        code,
        reportType: "standard"
    }).then(standardData => {
        if (standardData)
            return standardData;
        return utils_2.fetchHTML(`http://data.eastmoney.com/bbsj/yjbb/${code}.html`).then(htmlStr => {
            const fontMapMath = htmlStr.match(/"FontMapping":(\[.+"value":0}])/);
            const fontMap = JSON.parse(lodash_1.default.get(fontMapMath, "[1]", "[]"));
            const dataMatch = htmlStr.match(/data: (\[.+\]),font:/);
            const data = JSON.parse(lodash_1.default.get(dataMatch, "[1]", "[]"));
            const result = utils_1.decodeData(fontMap, data);
            utils_2.updateCache({
                code,
                reportType: "standard",
                data: JSON.stringify(result, null, 2)
            });
            console.log(`${code}_standard data download finish`);
            return result;
        });
    });
}
exports.fetchStandard = fetchStandard;
function fetchOtherReport(params) {
    const { code, reportType } = params;
    return utils_2.getCache({
        code,
        reportType
    }).then(data => {
        if (data)
            return data;
        const callback = string_random_1.default(6, { numbers: false });
        const baseParams = Object.assign({ filter: `(scode=${code})`, js: `var ${callback}={pages:(tp),data: (x),font:(font)}`, p: "1", ps: "50", sr: "-1", st: "reportdate", token: constants_1.TOKEN }, constants_1.CN_REPORT_TYPE_MAP[reportType].query);
        return utils_2.fetchJsonp("http://dcfm.eastmoney.com/em_mutisvcexpandinterface/api/js/get", lodash_1.default.merge(baseParams, params), callback).then(res => {
            const result = utils_1.decodeData(lodash_1.default.get(res, "font.FontMapping", []), lodash_1.default.get(res, "data", []));
            utils_2.updateCache({
                code,
                reportType,
                data: JSON.stringify(result, null, 2)
            });
            console.log(`${code}_${reportType} data download finish`);
            return result;
        });
    });
}
exports.fetchOtherReport = fetchOtherReport;
//# sourceMappingURL=services.js.map