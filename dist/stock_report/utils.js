"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const xlsx_1 = __importDefault(require("xlsx"));
const constants_1 = require("./constants");
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
    return axios_1.default(url, { params }).then(res => {
        eval(res.data.replace("var ", "global."));
        return eval(`global.${callback}`);
    });
}
exports.fetchJsonp = fetchJsonp;
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
function exportXlsx(code, dataMap) {
    const wb = xlsx_1.default.utils.book_new();
    Object.keys(dataMap).forEach(key => {
        const reportType = key;
        xlsx_1.default.utils.book_append_sheet(wb, xlsx_1.default.utils.aoa_to_sheet(dataMap[reportType]), reportType);
    });
    xlsx_1.default.writeFile(wb, `${constants_1.DATA_PATH}/${code}.xlsx`);
}
exports.exportXlsx = exportXlsx;
