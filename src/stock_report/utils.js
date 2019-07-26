const _ = require("lodash");
const axios = require("axios");
const Iconv = require("iconv-lite");
const strRandom = require("string-random");
const { TOKEN, HEADER_MAP } = require("./constants");
/**
 * @param { data:{}, font: { FontMapping:{ code: string; value: string }[] } } res
 */
function formatJsonpData2csv(fontMap, rootData) {
  let fields;
  const data = rootData.map(da => {
    const result = {};
    if (!fields) {
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

function formatCsvFields(fields) {
  return fields.map(fKey => ({
    label: HEADER_MAP[fKey] || fKey,
    value: fKey
  }));
}

function returnJsonpData(varName, evalStr) {
  eval(evalStr);
  return eval(varName);
}

function fetchStockReport(params) {
  const { stockCode, ...rest } = params;
  if (!stockCode) {
    console.warn("[stockCode] is required in [fetchStockReport] !");
    return;
  }
  if (!params.type) {
    console.warn("[type] is required in [fetchStockReport] !");
    return;
  }
  const jsonp = strRandom(6, { numbers: false });

  const baseParams = {
    filter: `(scode=${stockCode})`, // 股票代码
    js: `var ${jsonp}={pages:(tp),data: (x),font:(font)}`, // jsonp 数据结构
    p: "1", // 页码
    ps: "50", // pageSize
    sr: "-1",
    st: "reportdate",
    token: TOKEN,
    ...rest // rt type
  };
  return axios
    .get("http://dcfm.eastmoney.com/em_mutisvcexpandinterface/api/js/get", {
      params: _.merge(baseParams, params)
    })
    .then(res => {
      const rootData = returnJsonpData(jsonp, res.data);
      return rootData;
    });
}

function fetchPerformanceReport(stockCode) {
  return new Promise((rev, rej) => {
    axios({
      url: `http://data.eastmoney.com/bbsj/yjbb/${stockCode}.html`,
      responseType: "stream" //将数据转化为流返回
    }).then(res => {
      //此时的res.data 则为stream
      let chunks = [];
      res.data.on("data", chunk => {
        chunks.push(chunk);
      });
      res.data.on("end", () => {
        let buffer = Buffer.concat(chunks);

        const htmlStr = Iconv.decode(buffer, "gbk").toString();

        const fontMapMath = htmlStr.match(/"FontMapping":(\[.+"value":0}])/);
        const fontMap = JSON.parse(_.get(fontMapMath, "[1]", "[]"));

        const dataMatch = htmlStr.match(/data: (\[.+\]),font:/);
        const data = JSON.parse(_.get(dataMatch, "[1]", "[]"));

        rev({
          fontMap,
          data
        });
      });
    });
  });
}

module.exports = {
  formatJsonpData2csv,
  returnJsonpData,
  fetchStockReport,
  fetchPerformanceReport
};
