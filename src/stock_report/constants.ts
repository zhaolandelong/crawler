import path from "path";

export const DATA_PATH: string = path.resolve(__dirname, "../../data");
export const MOCK_PATH: string = path.resolve(__dirname, "../../mock");
export const CACHE_PATH: string = path.resolve(__dirname, "../../cache");
export const CURRENT_YEAR: number = new Date().getFullYear();
export const DEAL_YEAR: number = CURRENT_YEAR - 4;

export type ReportType = "cash" | "profit" | "balance" | "standard"; // cash - 现金流量 profit - 利润 balance - 资产负债 standard - 基本信息
