"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
exports.DATA_PATH = path_1.default.resolve(__dirname, "../../data");
exports.MOCK_PATH = path_1.default.resolve(__dirname, "../../mock");
exports.CACHE_PATH = path_1.default.resolve(__dirname, "../../cache");
exports.CURRENT_YEAR = new Date().getFullYear();
exports.DEAL_YEAR = exports.CURRENT_YEAR - 4;
