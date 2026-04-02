// 使用 refresh_token 刷新Token
const fs = require('fs');
const tokenData = JSON.parse(fs.readFileSync('./user-token.json', 'utf8'));

const APP_ID = 'cli_a949f94b0ffa9bc2';
const APP_SECRET = 'AL22hFMXmxOnsL6kxq68ygvfv37d1EVW';
const REFRESH_TOKEN = tokenData.refresh_token;

async function main() {
  // 用 refresh_token 刷新
  const resp = await fetch('https://open.feishu.cn/open-apis/authen/v1/refresh_access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      grant_type: 'refresh_token', 
      refresh_token: REFRESH_TOKEN,
      app_id: APP_ID,
      app_secret: APP_SECRET 
    })
  });
  const data = await resp.json();
  console.log('刷新结果:', data.msg);
  
  if (data.data?.access_token) {
    console.log('✓ Token刷新成功');
    console.log('有效期:', data.data.expires_in, '秒');
    fs.writeFileSync('./user-token.json', JSON.stringify(data.data, null, 2));
    console.log('✓ 已保存');
  } else {
    console.log('需要重新授权');
  }
}

main();