/**
 * 飞书云文档自动化脚本
 * 功能：从网页抓取数据 -> 写入飞书云文档
 */

const axios = require('axios');
const XLSX = require('xlsx');

// ============== 配置区域 ==============
const FEISHU_APP_ID = '你的App ID';
const FEISHU_APP_SECRET = '你的App Secret';
const SPREADSHEET_TOKEN = '你的表格Token'; // 飞书表格URL中的token
// =====================================

class FeishuAPI {
  constructor(appId, appSecret) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.accessToken = null;
  }

  // 获取访问令牌
  async getAccessToken() {
    const res = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      app_id: this.appId,
      app_secret: this.appSecret
    });
    this.accessToken = res.data.tenant_access_token;
    return this.accessToken;
  }

  // 写入数据到表格
  async writeData(range, values) {
    if (!this.accessToken) await this.getAccessToken();
    
    const res = await axios.post(
      `https://open.feishu.cn/open-apis/sheets/v3/spreadsheets/${SPREADSHEET_TOKEN}/values`,
      {
        range: range,
        values: values
      },
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );
    return res.data;
  }

  // 读取表格数据
  async readData(range) {
    if (!this.accessToken) await this.getAccessToken();
    
    const res = await axios.get(
      `https://open.feishu.cn/open-apis/sheets/v3/spreadsheets/${SPREADSHEET_TOKEN}/values/${range}`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );
    return res.data;
  }
}

// 示例：从本地Excel读取数据 -> 写入飞书
async function syncDataToFeishu(localExcelPath, feishuRange) {
  const feishu = new FeishuAPI(FEISHU_APP_ID, FEISHU_APP_SECRET);
  
  // 1. 读取本地Excel
  const workbook = XLSX.readFile(localExcelPath);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
  
  // 2. 写入飞书表格
  await feishu.writeData(feishuRange, data);
  
  console.log('数据同步完成！');
}

// 从飞书读取数据 -> 写入本地Excel
async function syncDataFromFeishu(feishuRange, localExcelPath) {
  const feishu = new FeishuAPI(FEISHU_APP_ID, FEISHU_APP_SECRET);
  
  // 1. 从飞书读取数据
  const response = await feishu.readData(feishuRange);
  const data = response.data.valueRange.values;
  
  // 2. 写入本地Excel
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, localExcelPath);
  
  console.log('数据同步完成！');
}

module.exports = { FeishuAPI, syncDataToFeishu, syncDataFromFeishu };
