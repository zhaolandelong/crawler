"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const lodash_1 = __importDefault(require("lodash"));
const utils_1 = require("../utils");
const constants_1 = require("./constants");
function fetchData(code, reportType, name) {
    return utils_1.getCache({
        code,
        reportType
    }).then(cacheData => {
        if (cacheData)
            return cacheData;
        const { type, headers } = constants_1.US_REPORT_TYPE_MAP[reportType];
        return Promise.all([
            fetchDataByPeriod(code, type, "quarter", name || code),
            fetchDataByPeriod(code, type, "annual", name || code)
        ]).then(resArr => {
            const result = lodash_1.default.concat(...resArr);
            utils_1.updateCache({
                code,
                reportType,
                data: JSON.stringify(result, null, 2)
            });
            console.log(`${code}_${reportType} data download finish`);
            return result;
        });
    });
}
exports.fetchData = fetchData;
function fetchDataByPeriod(code, type, period, name) {
    return utils_1.fetchHTML(`http://quotes.sina.com.cn/usstock/hq/${type}.php?s=${code}&t=${period}`).then(htmlStr => {
        const tmp = [];
        const $ = cheerio_1.default.load(htmlStr);
        const $table = $(".data_tbl").eq(1);
        const $rows = $table.find("tr");
        $rows.each((i, row) => {
            const rowData = [];
            $(row)
                .children("td")
                .each((j, td) => {
                rowData.push($(td)
                    .text()
                    .replace(/\s+|至/g, ""));
            });
            tmp.push(rowData);
        });
        const result = (tmp[0] || []).map((col, i) => [code, name, period].concat(tmp.map(row => row[i])));
        return result;
    });
}
//# sourceMappingURL=services.js.map