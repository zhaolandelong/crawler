const fs = require("fs");
const _ = require("lodash");
const { parse } = require("json2csv");
const inquirer = require("inquirer");
const {
  formatJsonpData2csv,
  fetchStockReport,
  fetchPerformanceReport
} = require("./utils");
const { REPORT_TYPE, DATA_PATH, ENCODING } = require("./constants");

if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH);
}
inquirer
  .prompt([
    {
      type: "input",
      name: "stockCode",
      message: "Please input stock code:",
      validate: function(input) {
        if (isNaN(input)) {
          return "Must be number!";
        }
        return true;
      }
    }
  ])
  .then(answers => {
    const { stockCode } = answers;

    // 业绩报表
    const performancePath = `${DATA_PATH}/${stockCode}_performance.csv`;
    if (!fs.existsSync(performancePath)) {
      fetchPerformanceReport(stockCode).then(res => {
        // fs.writeFile(
        //   `./mock/${stockCode}_performance.json`,
        //   JSON.stringify(res, null, 2),
        //   ENCODING,
        //   err => {
        //     if (err) console.warn(err);
        //   }
        // );
        const { fields, data } = formatJsonpData2csv(res.fontMap, res.data);
        const csv = parse(data, { fields });
        console.log(`${performancePath} download finish`);
        fs.writeFile(performancePath, csv, ENCODING, err => {
          if (err) console.warn(err);
        });
      });
    }

    // 现金流量表 利润表 资产负债表
    Object.keys(REPORT_TYPE).forEach(reportType => {
      const path = `${DATA_PATH}/${stockCode}_${reportType}.csv`;
      if (!fs.existsSync(path)) {
        const report = REPORT_TYPE[reportType];
        fetchStockReport({
          stockCode,
          ...report
        }).then(res => {
          // fs.writeFile(
          //   `./mock/${stockCode}_${reportType}.json`,
          //   JSON.stringify(res, null, 2),
          //   ENCODING,
          //   err => {
          //     if (err) console.warn(err);
          //   }
          // );
          const { fields, data } = formatJsonpData2csv(
            _.get(res, "font.FontMapping", []),
            _.get(res, "data", [])
          );
          console.log(`${path} download finish`);
          const csv = parse(data, { fields });
          fs.writeFile(path, csv, ENCODING, err => {
            if (err) console.warn(err);
          });
        });
      }
    });
  });
