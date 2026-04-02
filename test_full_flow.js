const https = require('https');

// 1. 获取 token
const getToken = () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      app_id: 'cli_a949f94b0ffa9bc2',
      app_secret: 'AL22hFMXmxOnsL6kxq68ygvfv37d1EVW'
    });
    
    const req = https.request({
      hostname: 'open.feishu.cn',
      path: '/open-apis/auth/v3/tenant_access_token/internal',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result.tenant_access_token);
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.write(data);
    req.end();
  });
};

// 2. 创建新表格
const createSpreadsheet = (token) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      title: 'API测试表格 ' + Date.now()
    });
    
    const req = https.request({
      hostname: 'open.feishu.cn',
      path: '/open-apis/sheets/v3/spreadsheets',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.data && result.data.spreadsheet) {
            resolve(result.data.spreadsheet);
          } else {
            reject(new Error('创建失败: ' + body));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.write(data);
    req.end();
  });
};

// 3. 写入数据
const writeValue = (token, spreadsheetToken) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      valueRange: {
        range: 'A1',
        values: [['测试写入', new Date().toLocaleString()]]
      }
    });
    
    const req = https.request({
      hostname: 'open.feishu.cn',
      path: '/open-apis/sheets/v3/spreadsheets/' + spreadsheetToken + '/values/A1',
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('写入结果:', res.statusCode, body);
        resolve({ status: res.statusCode, body: body });
      });
    });
    
    req.write(data);
    req.end();
  });
};

// 主流程
async function main() {
  try {
    console.log('1. 获取token...');
    const token = await getToken();
    console.log('Token获取成功');
    
    console.log('2. 创建新表格...');
    const spreadsheet = await createSpreadsheet(token);
    console.log('创建成功:', spreadsheet.title, spreadsheet.url);
    console.log('Token:', spreadsheet.token);
    
    console.log('3. 写入数据...');
    const result = await writeValue(token, spreadsheet.token);
    console.log('写入完成:', result);
    
  } catch (e) {
    console.error('错误:', e.message);
  }
}

main();