import { ReportType } from "../constants";

export const TOKEN: string = "70f12f2f4f091e459a279469fe49eca5";

export interface ReportTableValue {
  label: string;
  type: string;
  rt: number;
}

export type ReportTypeWithoutStandard = Exclude<ReportType, "standard">;

export const REPORT_TABLES: Record<
  ReportTypeWithoutStandard,
  ReportTableValue
> = {
  cash: {
    label: "现金流量表",
    type: "CWBB_XJLLB20",
    rt: 52137153
  },
  profit: {
    label: "利润表",
    type: "CWBB_LRB20",
    rt: 52137490
  },
  balance: {
    label: "资产负债表",
    type: "CWBB_ZCFZB20",
    rt: 52137497
  }
};
export const HEADER_MAP: { [key: string]: string } = {
  // 业绩报表
  reportdate: "报告期",
  basiceps: "每股收益(元)",
  cutbasiceps: "每股收益(扣除)(元)",
  totaloperatereve: "营业总收入(元)",
  ystz: "同比增长(%)",
  yshz: "季度环比增长(%)",
  parentnetprofit: "净利润(元)",
  sjltz: "净利润同比(%)",
  sjlhz: "季度环比增长(%)",
  bps: "每股净资产(元)",
  roeweighted: "净资产收益率(%)",
  mgjyxjje: "每股经营现金流量(元)",
  xsmll: "销售毛利率(%)",
  firstnoticedate: "首次公告日期",
  latestnoticedate: "最新公告日期",
  gxl: "股息率(%)",
  // 利润表
  kcfjcxsyjlr: "扣非归母净利润(元)",
  sjlktz: "扣非归母净利润同比(%)",
  commnreve: "手续费及佣金净收入(元)",
  intnreve: "利息净收入(元)",
  intnreve_tb: "利息净收入同比(%)",
  operatereve: "营业总收入(元)",
  tystz: "营业总收入同比(%)",
  operatetax: "营业税金及附加(元)",
  operatemanageexp: "管理费用(元)",
  operateexp: "营业总支出(元)",
  totaloperateexp_tb: "营业总支出同比(%)",
  commnreve_tb: "手续费及佣金净收入同比(%)",
  manageexp: "管理费用(元)",
  totaloperateexp: "营业总支出(元)",
  investincome: "投资收益(元)",
  premiumearned: "已赚保费(元)",
  premiumearned_tb: "已赚保费同比(%)",
  surrenderpremium: "退保金(元)",
  indemnityexp: "赔付支出(元)",
  yyzc: "营业支出(元)",
  operateexp_tb: "营业支出同比(%)",
  saleexp: "销售费用(元)",
  financeexp: "财务费用(元)",
  operateprofit: "营业利润(元)",
  yltz: "营业利润同比(%)",
  sumprofit: "利润总额(元)",
  noticedate: "公告日期",
  // 现金流量表
  nicashequi: "净现金流(元)",
  nicashequi_tb: "净现金流同比(%)",
  netoperatecashflow: "经营性现金流量净额(元)",
  netoperatecashflow_zb: "经营性现金流量净额占比(%)",
  intandcommrec: "金额(元)",
  intandcommrec_zb: "占比(%)",
  premiumrec: "应收保费(元)",
  premiumrec_zb: "占比(%)",
  indemnitypay: "金额(元)",
  indemnitypay_zb: "占比(%)",
  netinvcashflow: "投资性现金流量净额(元)",
  netinvcashflow_zb: "投资性现金流量净额净额占比(%)",
  invincomerec: "金额(元)",
  invincomerec_zb: "占比(%)",
  invpay: "金额(元)",
  invpay_zb: "占比(%)",
  nideposit: "金额(元)",
  nideposit_zb: "占比(%)",
  niloanadvances: "金额(元)",
  niloanadvances_zb: "占比(%)",
  salegoodsservicerec: "金额(元)",
  salegoodsservicerec_zb: "占比(%)",
  buyfilassetpay: "金额(元)",
  buyfilassetpay_zb: "占比(%)",
  netfinacashflow: "融资性现金流量净额(元)",
  netfinacashflow_zb: "融资性现金流量净额占比(%)",
  // 资产负债表
  sumasset: "总资产(元)",
  tsatz: "总资产同比(%)",
  cashanddepositcbank: "存放中央银行款项(元)",
  cashanddepositcbank_tb: "同比(%)",
  loanadvances: "发放贷款及垫款(元)",
  loanadvances_tb: "同比(%)",
  saleablefasset: "可供出售金融资产(元)",
  saleablefasset_tb: "同比(%)",
  sumliab: "总负债(元)",
  tdetz: "总负债同比(%)",
  borrowfromcbank: "向中央银行借款(元)",
  borrowfromcbank_tb: "同比(%)",
  acceptdeposit: "吸收存款(元)",
  acceptdeposit_tb: "同比(%)",
  sellbuybackfasset: "卖出回购金融资产款(元)",
  sellbuybackfasset_tb: "同比(%)",
  monetaryfund: "货币资金(元)",
  monetaryfund_tb: "同比(%)",
  settlementprovision: "结算备付金(元)",
  settlementprovision_tb: "同比(%)",
  borrowfund: "拆入资金(元)",
  borrowfund_tb: "同比(%)",
  agenttradesecurity: "代理买卖证券款(元)",
  agenttradesecurity_tb: "同比(%)",
  premiumrec_tb: "同比(%)",
  stborrow: "短期借款(元)",
  stborrow_tb: "同比(%)",
  premiumadvance: "预收保费(元)",
  premiumadvance_tb: "同比(%)",
  fixedasset: "固定资产(元)",
  accountrec: "应收账款(元)",
  accountrec_tb: "同比(%)",
  inventory: "存货(元)",
  inventory_tb: "同比(%)",
  accountpay: "应付账款(元)",
  accountpay_tb: "同比(%)",
  advancereceive: "预收账款(元)",
  advancereceive_tb: "同比(%)",
  sumshequity: "股东权益合计(元)",
  sumshequity_tb: "股东权益同比(%)",
  zcfzl: "资产负债率(%)"
};
