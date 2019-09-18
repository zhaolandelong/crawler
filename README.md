# Crawler

## 1. Stock report
Catch stock report data from http://quote.eastmoney.com/ (China) and http://stock.finance.sina.com.cn (HK & US). And then export recnet **4 years** data to `.xlsx`.
  
- ### Runtime eviroment
1. You should install [nodejs](https://nodejs.org/en/) first.
2. Download this repo to local.
3. Enter the project path and install dependencies
``` bash
# use npm
$ npm i

# or use yarn
$ yarn
```

- ### Run the program
If on Windows OS, double click the `data/_stock.bat` can start the program, or you can run the command below at the project root path:
``` bash
$ npm run stock
```
- ### Input the stock code
If want search multiple, use `,` to split. The code should be like `600519`(China), `00700`(HK) or `goog`(US). They could be split auto by group of `cn`, `hk` and `us`.

- ### Deal with the output
The `.xlsx` files will be export to `data/` and named like `cn_2019-9-18 15/31/42.xlsx`. Do what you want!
