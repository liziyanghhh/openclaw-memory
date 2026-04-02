const https = require('https');
const querystring = require('querystring');

const appId = 'cli_a949f94b0ffa9bc2';
const appSecret = 'AL22hFMXmxOnsL6kxq68ygvfv37d1EVW';

// 1. 获取 tenant_access_token (应用凭据)
const getTenantToken = () => {
  return new Promise((resolve, reject) => {
    const data = querystring.stringify({
      app_id: appId,
      app_secret: appSecret
    });
    
    const req = https.request({
      hostname: 'open.feishu.cn',
      path: '/open-apis/auth/v3/tenant_access_token/internal',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
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

// 2. 获取用户授权码
const getUserAuthCode = (tenantToken) => {
  return new Promise((resolve, reject) => {
    const redirectUri = encodeURIComponent('https://wcnjaznqdu9b.feishu.cn/');
    const state = 'test';
    
    console.log('请访问以下地址扫码授权:');
    console.log(`https://open.feishu.cn/open-apis/authen/v1/authorize?app_id=${appId}&redirect_uri=${redirectUri}&state=${state}`);
    console.log('\n授权完成后，请输入显示的授权码: ');
    
    // 读取用户输入
    const readline = require('readline');
    const rl = readline.createInterface({input: process.stdin, output: process.stdout});
    rl.question('授权码: ', (code) => {
      rl.close();
      resolve(code);
    });
  });
};

// 3. 用授权码换取 user_access_token
const getUserToken = (tenantToken, code) => {
  return new Promise((resolve, reject) => {
    const data = querystring.stringify({
      grant_type: 'authorization_code',
      code: code
    });
    
    const req = https.request({
      hostname: 'open.feishu.cn',
      path: '/open-apis/authen/v3/user_access_token',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + tenantToken,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('获取user_token响应:', body);
        try {
          const result = JSON.parse(body);
          if (result.data && result.data.access_token) {
            resolve(result.data.access_token);
          } else {
            reject(new Error('获取失败: ' + body));
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

// 4. 用 user_token 写入表格
const writeWithUserToken = (userToken, spreadsheetToken) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      valueRange: {
        range: 'A1',
        values: [['测试写入(USER)', new Date().toLocaleString()]]
      }
    });
    
    const req = https.request({
      hostname: 'open.feishu.cn',
      path: '/open-apis/sheets/v3/spreadsheets/' + spreadsheetToken + '/values/A1',
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + userToken,
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
    console.log('1. 获取应用token...');
    const tenantToken = await getTenantToken();
    console.log('应用token获取成功\n');
    
    console.log('2. 获取用户授权...');
    const code = await getUserAuthCode(tenantToken);
    console.log('授权码:', code, '\n');
    
    console.log('3. 获取用户token...');
    const userToken = await getUserToken(tenantToken, code);
    console.log('用户token获取成功\n');
    
    console.log('4. 写入表格数据...');
    const spreadsheetToken = 'CPUCsz8YLhbuVUtt2RFcnV4dnhe';
    const result = await writeWithUserToken(userToken, spreadsheetToken);
    console.log('写入完成!', result);
    
  } catch (e) {
    console.error('错误:', e.message);
  }
}

main();