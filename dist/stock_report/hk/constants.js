"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const STANDARD_HEADERS = [
    "股票代码",
    "股票名称",
    "开始日期",
    "截止日期",
    "公告日期",
    "报表类型",
    "营业额",
    "损益额",
    "盈利或亏损",
    "变动幅度",
    "非經常性收益/(虧損)",
    "基本每股盈利(仙)",
    "摊薄每股盈利(仙)",
    "特别股息",
    "股息截止日期开始",
    "股息截止日期结束",
    "股息应付日期",
    "币种"
];
const BALANCE_HEADERS = [
    "股票代码",
    "股票名称",
    "报告期",
    "报表类型",
    "非流动资产",
    "流动资产",
    "流动负债",
    "净流动资产/(负债)",
    " 非流动负债",
    "少数股东权益 - (借)/贷",
    "净资产/(负债)",
    "已发行股本",
    "储备",
    "股东权益/(亏损)",
    "无形资产(非流动资产)",
    "物业、厂房及设备(非流动资产)",
    "附属公司权益(非流动资产)",
    "联营公司权益 (非流动资产)",
    "其他投资(非流动资产)",
    "应收账款(流动资产)",
    "存货(流动资产)",
    "现金及银行结存(流动资产)",
    "应付帐款(流动负债)",
    "银行贷款(流动负债)",
    "非流动银行贷款",
    "总资产",
    "总负债",
    "股份数目(香港)",
    "币种"
];
const CASH_HEADERS = [
    "股票代码",
    "股票名称",
    "报告期",
    "报表类型",
    "经营业务所得之现金流入净额",
    "投资活动之现金流入净额",
    "融资活动之现金流入净额",
    "现金及现金等价物增加",
    "会计年初之现金及现金等价物",
    "会计年终之现金及现金等价物",
    "外汇兑换率变动之影响",
    "购置固定资产款项",
    "币种"
];
const PROFIT_HEADERS = [
    "股票代码",
    "股票名称",
    "报告期",
    "报表类型",
    "营业额",
    " 除税前盈利/(亏损)",
    "税项",
    " 除税后盈利/(亏损)",
    "少数股东权益",
    "股东应占盈利/(亏损)",
    "股息",
    "除税及股息后盈利/(亏损)",
    "基本每股盈利(仙)",
    "摊薄每股盈利(仙)",
    "每股股息(仙)",
    "销售成本",
    "折旧",
    "销售及分销费用",
    "一般及行政费用",
    "利息费用/融资成本",
    "毛利",
    "经营盈利",
    "应占联营公司盈利",
    "币种"
];
exports.HK_REPORT_TYPE_MAP = {
    standard: {
        type: "getFinanceStandardForjs",
        query: "financeStanderd",
        headers: STANDARD_HEADERS
    },
    balance: {
        type: "getBalanceSheetForjs",
        query: "balanceSheet",
        headers: BALANCE_HEADERS
    },
    cash: {
        type: "getCashFlowForjs",
        query: "cashFlow",
        headers: CASH_HEADERS
    },
    profit: {
        type: "getFinanceStatusForjs",
        query: "financeStatus",
        headers: PROFIT_HEADERS
    }
};
//# sourceMappingURL=constants.js.map