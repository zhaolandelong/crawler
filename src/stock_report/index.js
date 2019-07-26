const fs = require("fs");
const { parse } = require("json2csv");
const inquirer = require("inquirer");
const { formatJsonpData2csv, fetchStockReport } = require("./utils");
const { REPORT_TYPE, DATA_PATH } = require("./constants");
const mockData = require("./mockData");

inquirer
  .prompt([
    {
      type: "input",
      name: "stockCode",
      message: "Please input stock code: ",
      validate: function(input) {
        if (isNaN(input)) {
          return "Must be number!";
        }
        return true;
      }
    }
    // {
    //   type: "list",
    //   name: "reportType",
    //   message: "What kind of report?",
    //   choices: Object.keys(REPORT_TYPE).map(key => ({
    //     name: REPORT_TYPE[key].label,
    //     value: key
    //   }))
    // }
  ])
  .then(answers => {
    const { stockCode } = answers;
    Object.keys(REPORT_TYPE).forEach(reportType => {
      const report = REPORT_TYPE[reportType];
      fetchStockReport({
        stockCode,
        ...report
      }).then(rootData => {
        const { fields, data } = formatJsonpData2csv(rootData);
        const csv = parse(data, fields);
        fs.writeFile(
          `${DATA_PATH}/${stockCode}_${reportType}.csv`,
          csv,
          err => {
            if (err) console.warn(err);
          }
        );
      });
    });
  });
