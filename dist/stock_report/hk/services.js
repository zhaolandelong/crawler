"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const constants_1 = require("./constants");
const constants_2 = require("../constants");
function fetchDataByPeriod(params) {
    const { code, reportType, period = "zero" } = params;
    const { type, query } = constants_1.HK_REPORT_TYPE_MAP[reportType];
    return utils_1.fetchJsonp(`http://stock.finance.sina.com.cn/hkstock/api/jsonp.php/var%20tableData%20=%20/FinanceStatusService.${type}`, {
        symbol: code,
        [query]: period
    }, "tableData");
}
exports.fetchDataByPeriod = fetchDataByPeriod;
function fetchData(params) {
    const { code, reportType } = params;
    if (utils_1.checkCache({ code, reportType })) {
        return utils_1.getCache({ code, reportType });
    }
    return Promise.all([
        fetchDataByPeriod({
            code,
            reportType,
            period: "all"
        }),
        fetchDataByPeriod({
            code,
            reportType,
            period: "zero"
        })
    ]).then(dataArr => {
        const [dataAll, dataByYear] = dataArr;
        const res = [
            ...dataAll.filter(
            // 只要当年季报数据
            da => typeof da[0] === "string" && da[0] > String(constants_2.CURRENT_YEAR)),
            ...dataByYear
        ];
        utils_1.updateCache({
            code,
            reportType,
            data: JSON.stringify(res, null, 2)
        });
        console.log(`${code}_${reportType} data download finish`);
        return res;
    });
}
exports.fetchData = fetchData;
//# sourceMappingURL=services.js.map