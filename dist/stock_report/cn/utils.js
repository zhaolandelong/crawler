"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
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
    // xlsxData.unshift(Object.values(headers));
    return xlsxData;
}
exports.formatObj2ArrByHeader = formatObj2ArrByHeader;
function dataFilterCallback(reportData, from, to) {
    return (reportData > String(to) ||
        new RegExp(`^(${lodash_1.default.times(to - from, i => from + i).join("|")})-12-31`).test(reportData));
}
exports.dataFilterCallback = dataFilterCallback;
