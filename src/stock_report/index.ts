import inquirer from "inquirer";
import cn from "./cn";
import hk from "./hk";

inquirer
  .prompt([
    {
      type: "input",
      name: "stockCodeList",
      message: "Please input stock code:"
      // validate: function(input) {
      //   if (isNaN(input)) {
      //     return "Must be number!";
      //   }
      //   return true;
      // }
    }
  ])
  .then(answers => {
    const { stockCodeList } = answers;
    const cnList: string[] = [];
    const hkList: string[] = [];
    const usList: string[] = [];
    stockCodeList
      .replace(/\s+/g, "")
      .split(",")
      .forEach((stockCode: string) => {
        if (/\d{6}/.test(stockCode)) {
          cnList.push(stockCode);
        } else if (/\d{5}/.test(stockCode)) {
          hkList.push(stockCode);
        } else if (/^[A-Za-z]+$/.test(stockCode)) {
          usList.push(stockCode);
        }
      });
    if (cnList.length > 0) cn.run(cnList);
    if (hkList.length > 0) hk.run(hkList);
  });
