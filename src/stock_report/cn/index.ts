import fs from "fs";
import _ from "lodash";
import { parse } from "json2csv";
import {
  formatJsonpData2csv,
  fetchStockReport,
  fetchPerformanceReport,
  buildDiy
} from "./utils";
import { REPORT_TABLES, ReportTableValue, ReportType } from "./constants";
import { DATA_PATH, MOCK_PATH, ENCODING } from "../constants";

if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH);
}

export default {
  run(codeArr: string[]) {
    codeArr.forEach(stockCode => {
      const promiseArr = [];
      // 业绩报表
      const performancePath = `${DATA_PATH}/${stockCode}_performance.csv`;
      // if (!fs.existsSync(performancePath)) {
      promiseArr.push(
        fetchPerformanceReport(stockCode).then(res => {
          const { fields, data } = formatJsonpData2csv(res.fontMap, res.data);
          const csv = parse(data, { fields });
          console.log(`${performancePath} download finish`);
          fs.writeFile(performancePath, csv, ENCODING, err => {
            if (err) console.warn(err);
          });
          return data;
        })
      );
      // }

      // 现金流量表 利润表 资产负债表
      Object.keys(REPORT_TABLES).forEach(reportType => {
        const path = `${DATA_PATH}/${stockCode}_${reportType}.csv`;
        // if (!fs.existsSync(path)) {
        const report: ReportTableValue =
          REPORT_TABLES[reportType as ReportType];
        promiseArr.push(
          fetchStockReport({
            stockCode,
            ...report
          }).then(res => {
            fs.writeFile(
              `${MOCK_PATH}/${stockCode}_${reportType}.json`,
              JSON.stringify(res, null, 2),
              ENCODING,
              err => {
                if (err) console.warn(err);
              }
            );
            const { fields, data } = formatJsonpData2csv(
              _.get(res, "font.FontMapping", []),
              _.get(res, "data", [])
            );
            console.log(`${path} download finish`);
            const csv = parse(data, { fields });
            fs.writeFile(path, csv, ENCODING, err => {
              if (err) console.warn(err);
            });
            return data;
          })
        );
        // }
      });
      if (promiseArr.length) {
        Promise.all(promiseArr).then(resArr => {
          buildDiy(resArr);
        });
      }
    });
  }
};