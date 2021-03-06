import axios from "axios";
import iconv from "iconv-lite";
import fs from "fs";
import path from "path";
import _ from "lodash";
import xlsx from "xlsx";
import { ReportType, CACHE_PATH, XlsxDataMap, XlsxData, DATA_PATH, StockObj } from "./constants";

const history = require(path.resolve(DATA_PATH, "./history.json"));

export function fetchHTML(
  url: string,
  options?: {
    encode: string;
  }
): Promise<string> {
  return new Promise((rev, rej) => {
    axios({
      url,
      responseType: "stream" //将数据转化为流返回
    }).then(res => {
      //此时的res.data 则为stream
      let chunks: Buffer[] = [];
      res.data.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });
      res.data.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const htmlStr = iconv.decode(buffer, _.get(options, "encode", "gbk"));
        rev(htmlStr);
      });
    });
  });
}

export function fetchJsonp(
  url: string,
  params: any = null,
  callback: string = "callback"
) {
  return axios({ url, params }).then(res => {
    eval(res.data.replace("var ", "global."));
    return eval(`global.${callback}`);
  });
}

export function fetchNameByCode(code: string): Promise<string> {
  let codeName: string = '';
  Object.values(history).some((objArr) => {
    return (objArr as StockObj[]).some(obj => {
      if (obj.code === code) {
        codeName = obj.name;
        return true;
      }
      return false;
    });
  });
  if (codeName) {
    return new Promise((rev, rej) => {
      rev(codeName)
    });
  }
  const cb = `suggestdata_${Date.now()}`;
  // type: 11 - A股 31 - 港股 41 - 美股
  return fetchHTML(
    `https://suggest3.sinajs.cn/suggest/type=11,31,41&key=${code}&name=${cb}`
  ).then(res => {
    const matchStr = _.get(res.match(/"(.+)"/), "[1]", "");
    const fisrtRes = _.get(matchStr.split(";"), "[0]", "");
    codeName = fisrtRes.split(",")[4];
    return codeName;
  });
}

interface CacheOpt {
  code: string;
  reportType: ReportType;
  cachePath?: string;
}
export function updateCache(options: CacheOpt & { data: string }): void {
  const { code, reportType, data, cachePath = CACHE_PATH } = options;
  const path = `${cachePath}/${code}_${reportType}.json`;
  fs.writeFile(path, data, "utf8", err => {
    if (err) console.warn(err);
  });
}

export function checkCache(options: CacheOpt): boolean {
  const { code, reportType, cachePath = CACHE_PATH } = options;
  const path = `${cachePath}/${code}_${reportType}.json`;
  return fs.existsSync(path);
}

export function getCache(options: CacheOpt): Promise<unknown> {
  const { code, reportType, cachePath = CACHE_PATH } = options;
  const path = `${cachePath}/${code}_${reportType}.json`;
  return new Promise((rev, rej) => {
    if (checkCache({ code, reportType, cachePath })) {
      fs.readFile(path, "utf8", (err, data) => {
        if (err) {
          rej(err);
        }
        console.log(`Get ${code}_${reportType}.json from cache`);
        rev(JSON.parse(data));
      });
    } else {
      rev(null);
    }
  });
}

export function exportXlsx(path: string, dataMap: XlsxDataMap): void {
  const wb = xlsx.utils.book_new();
  Object.keys(dataMap).forEach(key => {
    const reportType = key as ReportType;
    if (dataMap[reportType]) {
      xlsx.utils.book_append_sheet(
        wb,
        xlsx.utils.aoa_to_sheet(dataMap[reportType] as XlsxData[]),
        reportType
      );
    }
  });
  xlsx.writeFile(wb, path);
}

export function mergeDataByStock(
  dataArr: XlsxDataMap[],
  filterCallback?: (row: XlsxData) => boolean,
  initData?: XlsxDataMap
): XlsxDataMap {
  const allData = initData || {
    standard: [],
    cash: [],
    profit: [],
    balance: []
  };
  dataArr.forEach(allDa => {
    _.mergeWith(
      allData,
      allDa,
      (objValue: XlsxData[], srcValue: XlsxData[]) => {
        if (typeof filterCallback === "function") {
          const filterRes = srcValue.filter(filterCallback);
          return objValue.concat(filterRes);
        }
        return objValue.concat(srcValue);
      }
    );
  });
  return allData;
}
