import { fetchData } from "./services";
import { HK_REPORT_TYPE_MAP } from "./constants";
import { ReportType } from "../constants";
import { updateCache } from "../utils";

export default {
  run(codeArr: string[]): void {
    codeArr.forEach(code => {
      Object.keys(HK_REPORT_TYPE_MAP).forEach(key => {
        const reportType = key as ReportType;
        setTimeout(() => {
          fetchData({
            code,
            reportType
          }).then(res => {
            res.unshift(HK_REPORT_TYPE_MAP[reportType].headers);
            updateCache({
              code,
              reportType,
              data: JSON.stringify(res, null, 2),
              force: false
            });
          });
        }, 100);
      });
    });
  }
};
