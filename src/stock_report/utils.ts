import axios from "axios";
import iconv from "iconv-lite";
import fs from "fs";
import _ from "lodash";
import { ReportType, CACHE_PATH } from "./constants";

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
  data: string;
  reportType: ReportType;
  force?: boolean;
}
export function updateCache(options: CacheOpt): void {
  const { code, reportType, data, force = false } = options;
  const path = `${CACHE_PATH}/${code}_${reportType}.json`;
  if (fs.existsSync(path) && !force) return;
  fs.writeFile(path, data, "utf8", err => {
    if (err) console.warn(err);
  });
}
export function getCache(
  options: Pick<CacheOpt, "code" | "reportType">
): Promise<unknown> {
  const { code, reportType } = options;
  const path = `${CACHE_PATH}/${code}_${reportType}.json`;
  return new Promise((rev, rej) => {
    if (fs.existsSync(path)) {
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
