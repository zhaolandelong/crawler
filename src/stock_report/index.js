const fs = require("fs");
const _ = require("lodash");
const { parse } = require("json2csv");
const inquirer = require("inquirer");
const {
  formatJsonpData2csv,
  fetchStockReport,
  fetchPerformanceReport
} = require("./utils");
const { REPORT_TYPE, DATA_PATH } = require("./constants");
const mockData = require("./mockData");
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
        const { fields, data } = formatJsonpData2csv(res.fontMap, res.data);
        const csv = parse(data, { fields });
        console.log(`${performancePath} download finish`);
        fs.writeFile(performancePath, csv, 'utf-8', err => {
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
          const { fields, data } = formatJsonpData2csv(
            _.get(res, "font.FontMapping", []),
            _.get(res, "data", [])
          );
          console.log(`${path} download finish`);
          const csv = parse(data, { fields });
          fs.writeFile(path, csv, 'utf-8', err => {
            if (err) console.warn(err);
          });
        });
      }
    });
  });
