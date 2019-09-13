const _ = require("lodash");
const fs = require("fs");
const axios = require("axios");
const iconv = require("iconv-lite");
const strRandom = require("string-random");
const { parse } = require("json2csv");
const { TOKEN, HEADER_MAP, MOCK_PATH, CURRENT_YEAR } = require("./constants");

module.exports = {
  formatJsonpData2csv,
  returnJsonpData,
  fetchStockReport,
  fetchPerformanceReport,
  buildDiy
};

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
    label: (HEADER_MAP[fKey] || "") + "_" + fKey,
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
  const stockMockPath = `${MOCK_PATH}/${stockCode}_${params.type}.json`;
  if (fs.existsSync(stockMockPath)) {
    return new Promise((rev, rej) => {
      fs.readFile(stockMockPath, (err, data) => {
        if (err) rej(err);
        rev(JSON.parse(data));
      });
    });
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
  const performanceMockPath = `${MOCK_PATH}/${stockCode}_performance.json`;
  if (fs.existsSync(performanceMockPath)) {
    return new Promise((rev, rej) => {
      fs.readFile(performanceMockPath, (err, data) => {
        if (err) rej(err);
        rev(JSON.parse(data));
      });
    });
  }
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

        const htmlStr = iconv.decode(buffer, "gbk");

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

function buildDiy(data) {
  const totalData = _.merge(...data).filter(data => {
    const reportDate = data.reportdate;
    // current year all report
    // or
    // recent 3 years year-report
    return (
      reportDate > String(CURRENT_YEAR) ||
      new RegExp(
        `^(${CURRENT_YEAR - 1}|${CURRENT_YEAR - 2}|${CURRENT_YEAR - 3})-12-31`
      ).test(reportDate)
    );
  });

  const csv = parse(totalData, {
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
  fs.appendFile(`./data/diy_report.csv`, csv, "utf-8", err => {
    err && console.log(err);
  });
}
