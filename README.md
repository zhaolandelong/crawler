# Crawler

## 1. stock report v1.0
Catch stock report data from http://quote.eastmoney.com/.
- ### Run the program
If on Windows OS, double click the `data/_stock.bat` can also start the program. Or you can use the command below on any OS:
``` bash
$ npm run stock
```
- ### Input the stock code
If want search multiple, use `,` to split. 
Then you will get recent 50 balance, cash, performance, profit data of each stock which will be saved in `data/` as `csv` files. These files are writen into `.ignore` file, so they won't be upload to the repo.
**What's more?**
Some important fields *(only all current year data and recent **3 years** year-data)* will be appended to `data/diy_report.csv`.
- ### Deal with the `diy_report.csv`
You'd better to trans the `.csv` to `.xls`, because it's really more benifit. Then deal with the data as you want.
