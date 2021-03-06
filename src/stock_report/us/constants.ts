import { ReportTypeWithoutStandard } from "../constants";

const BALANCE_HEADERS: string[] = [
  "股票代码",
  "股票名称",
  "报告类型",
  "截止日期",
  "流动资产",
  "现金及短期投资",
  "短期应收账款",
  "存货",
  "其他流动资产",
  "非流动资产",
  "厂房及设备净资产",
  "项目总投资及垫款",
  "长期应收票据",
  "无形资产",
  "递延所得税资产",
  "其他资产",
  "合计总资产",
  "流动负债",
  "短期债务（含部分LTD）",
  "应付账款",
  "应付所得税",
  "其他流动负债",
  "非流动负债",
  "长期负债",
  "拨备风险及费用",
  "递延所得税负债",
  "其他负债",
  "合计总负债",
  "股东权益合计",
  "非股权储备",
  "优先股-账面价值",
  "普通股权益（合计）",
  "累计少数股东权益",
  "权益总额",
  "负债与股东权益合计",
  "每股账面价值",
  "每股账面价值-有形"
];
const CASH_HEADERS: string[] = [
  "股票代码",
  "股票名称",
  "报告类型",
  "截止日期",
  "净收益",
  "+折旧损耗及摊稍",
  "+递延税及投资税减免",
  "+其他经营基金",
  "营运资金",
  "+特别项目",
  "+营运资金变动",
  "经营现金流",
  "资本支出",
  "收购所得净资产",
  "固定资产和业务出售收入",
  "投资买卖净额",
  "非现金项目",
  "投资现金流",
  "发放现金股利",
  "股本变动",
  "发行/削减债务净额",
  "其他融资基金",
  "筹资现金流",
  "汇率影响",
  "杂项基金",
  "现金净流动",
  "自由现金流"
];
const PROFIT_HEADERS: string[] = [
  "股票代码",
  "股票名称",
  "报告类型",
  "截止日期",
  "营业总收入",
  "-营业成本",
  "毛利",
  "-销售管理及行政费用",
  "-其他运营费用",
  "计息税前利润",
  "+非经营收入(支出)",
  "-非经常性支出",
  "-利息支出",
  "税前净利润",
  "-所得税",
  "+其他税后调整",
  "+联署公司盈利权益",
  "合并净利润",
  "-少数股东权益开支",
  "净利润",
  "-优先股股息",
  "一般可用收入净利润",
  "每股基本收益",
  "摊薄每股收益",
  "息税折旧摊销前利润"
];

export type USQueryType = "balance" | "cash" | "income";
export const US_REPORT_TYPE_MAP: Record<
  ReportTypeWithoutStandard,
  {
    type: USQueryType;
    headers: string[];
  }
> = {
  balance: {
    type: "balance",
    headers: BALANCE_HEADERS
  },
  cash: {
    type: "cash",
    headers: CASH_HEADERS
  },
  profit: {
    type: "income",
    headers: PROFIT_HEADERS
  }
};
