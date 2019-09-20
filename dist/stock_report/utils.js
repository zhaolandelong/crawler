"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const xlsx_1 = __importDefault(require("xlsx"));
const constants_1 = require("./constants");
const history = require(path_1.default.resolve(constants_1.DATA_PATH, "./history.json"));
function fetchHTML(url, options) {
    return new Promise((rev, rej) => {
        axios_1.default({
            url,
            responseType: "stream" //将数据转化为流返回
        }).then(res => {
            //此时的res.data 则为stream
            let chunks = [];
            res.data.on("data", (chunk) => {
                chunks.push(chunk);
            });
            res.data.on("end", () => {
                const buffer = Buffer.concat(chunks);
                const htmlStr = iconv_lite_1.default.decode(buffer, lodash_1.default.get(options, "encode", "gbk"));
                rev(htmlStr);
            });
        });
    });
}
exports.fetchHTML = fetchHTML;
function fetchJsonp(url, params = null, callback = "callback") {
    return axios_1.default({ url, params }).then(res => {
        eval(res.data.replace("var ", "global."));
        return eval(`global.${callback}`);
    });
}
exports.fetchJsonp = fetchJsonp;
function fetchNameByCode(code) {
    let codeName = '';
    Object.values(history).some((objArr) => {
        return objArr.some(obj => {
            if (obj.code === code) {
                codeName = obj.name;
                return true;
            }
            return false;
        });
    });
    if (codeName) {
        return new Promise((rev, rej) => {
            rev(codeName);
        });
    }
    const cb = `suggestdata_${Date.now()}`;
    // type: 11 - A股 31 - 港股 41 - 美股
    return fetchHTML(`https://suggest3.sinajs.cn/suggest/type=11,31,41&key=${code}&name=${cb}`).then(res => {
        const matchStr = lodash_1.default.get(res.match(/"(.+)"/), "[1]", "");
        const fisrtRes = lodash_1.default.get(matchStr.split(";"), "[0]", "");
        codeName = fisrtRes.split(",")[4];
        return codeName;
    });
}
exports.fetchNameByCode = fetchNameByCode;
function updateCache(options) {
    const { code, reportType, data, cachePath = constants_1.CACHE_PATH } = options;
    const path = `${cachePath}/${code}_${reportType}.json`;
    fs_1.default.writeFile(path, data, "utf8", err => {
        if (err)
            console.warn(err);
    });
}
exports.updateCache = updateCache;
function checkCache(options) {
    const { code, reportType, cachePath = constants_1.CACHE_PATH } = options;
    const path = `${cachePath}/${code}_${reportType}.json`;
    return fs_1.default.existsSync(path);
}
exports.checkCache = checkCache;
function getCache(options) {
    const { code, reportType, cachePath = constants_1.CACHE_PATH } = options;
    const path = `${cachePath}/${code}_${reportType}.json`;
    return new Promise((rev, rej) => {
        if (checkCache({ code, reportType, cachePath })) {
            fs_1.default.readFile(path, "utf8", (err, data) => {
                if (err) {
                    rej(err);
                }
                console.log(`Get ${code}_${reportType}.json from cache`);
                rev(JSON.parse(data));
            });
        }
        else {
            rev(null);
        }
    });
}
exports.getCache = getCache;
function exportXlsx(path, dataMap) {
    const wb = xlsx_1.default.utils.book_new();
    Object.keys(dataMap).forEach(key => {
        const reportType = key;
        if (dataMap[reportType]) {
            xlsx_1.default.utils.book_append_sheet(wb, xlsx_1.default.utils.aoa_to_sheet(dataMap[reportType]), reportType);
        }
    });
    xlsx_1.default.writeFile(wb, path);
}
exports.exportXlsx = exportXlsx;
function mergeDataByStock(dataArr, filterCallback, initData) {
    const allData = initData || {
        standard: [],
        cash: [],
        profit: [],
        balance: []
    };
    dataArr.forEach(allDa => {
        lodash_1.default.mergeWith(allData, allDa, (objValue, srcValue) => {
            if (typeof filterCallback === "function") {
                const filterRes = srcValue.filter(filterCallback);
                return objValue.concat(filterRes);
            }
            return objValue.concat(srcValue);
        });
    });
    return allData;
}
exports.mergeDataByStock = mergeDataByStock;
//# sourceMappingURL=utils.js.map