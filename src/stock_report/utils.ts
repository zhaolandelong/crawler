import axios from "axios";
import iconv from "iconv-lite";
import fs from "fs";
import _ from "lodash";
import xlsx from "xlsx";
import { ReportType, CACHE_PATH, DATA_PATH } from "./constants";

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
  return axios(url, { params }).then(res => {
    eval(res.data.replace("var ", "global."));
    return eval(`global.${callback}`);
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

export type XlsxData = (string | null | number)[][];
export function exportXlsx(
  code: string,
  dataMap: Record<Partial<ReportType>, XlsxData>
): void {
  const wb = xlsx.utils.book_new();
  Object.keys(dataMap).forEach(key => {
    const reportType = key as Partial<ReportType>;
    xlsx.utils.book_append_sheet(
      wb,
      xlsx.utils.aoa_to_sheet(dataMap[reportType]),
      reportType
    );
  });
  xlsx.writeFile(wb, `${DATA_PATH}/${code}.xlsx`);
}
