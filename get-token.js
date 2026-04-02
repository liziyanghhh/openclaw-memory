// 获取Token并读取Wiki
const APP_ID = 'cli_a949f94b0ffa9bc2';
const APP_SECRET = 'AL22hFMXmxOnsL6kxq68ygvfv37d1EVW';
const CODE = '3DxvGc6yJGc84G12HAaG8E8wf1Cffed1';
const fs = require('fs');

async function main() {
  const resp = await fetch('https://open.feishu.cn/open-apis/authen/v1/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'authorization_code', code: CODE, app_id: APP_ID, app_secret: APP_SECRET })
  });
  const data = await resp.json();
  const token = data.data?.access_token;
  if (!token) { console.log('失败', data); return; }
  
  fs.writeFileSync('./user-token.json', JSON.stringify(data.data, null, 2));
  console.log('✓ Token保存\n');
  
  // 获取Wiki空间
  const spaces = await (await fetch('https://open.feishu.cn/open-apis/wiki/v2/spaces', { 
    headers: { Authorization: `Bearer ${token}` } 
  })).json();
  console.log('Wiki空间:', JSON.stringify(spaces, null, 2));
  
  // 获取文档
  const DOC_ID = 'S65QwGl3BiUjFekvznHc7XMcnOd';
  const node = await (await fetch(`https://open.feishu.cn/open-apis/wiki/v2/nodes/${DOC_ID}`, { 
    headers: { Authorization: `Bearer ${token}` } 
  })).json();
  console.log('\n文档:', JSON.stringify(node, null, 2));
}

main();