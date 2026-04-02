// 检查用户信息和企业信息
const fs = require('fs');
const t = JSON.parse(fs.readFileSync('./user-token.json', 'utf8'));
const TOKEN = t.access_token;

async function main() {
  console.log('=== 用户信息 ===');
  console.log('用户ID:', t.user_id);
  console.log('用户名称:', t.name);
  console.log('企业ID:', t.tenant_key);
  
  // 检查用户所在的企业
  const tenantResp = await fetch('https://open.feishu.cn/open-apis/tenant/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      app_id: 'cli_a949f94b0ffa9bc2', 
      app_secret: 'AL22hFMXmxOnsL6kxq68ygvfv37d1EVW' 
    })
  });
  const tenant = await tenantResp.json();
  console.log('\n=== 企业信息 ===');
  console.log(JSON.stringify(tenant, null, 2));
}

main();