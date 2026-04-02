// 检查用户Token能访问什么
const fs = require('fs');
const tokenData = JSON.parse(fs.readFileSync('./user-token.json', 'utf8'));
const TOKEN = tokenData.access_token;

async function testAPI(name, url) {
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const text = await resp.text();
  return { name, status: resp.status, data: text.slice(0, 200) };
}

async function main() {
  console.log('=== 测试各API ===\n');
  
  const tests = [
    ['Wiki空间', 'https://open.feishu.cn/open-apis/wiki/v2/spaces'],
    ['Wiki节点', 'https://open.feishu.cn/open-apis/wiki/v2/nodes/B63SwbWKCiILFzkhR5fcBdtDnTh'],
    ['云表格1', 'https://open.feishu.cn/open-apis/bitable/v1/apps/VIyVbYdgtaUZxbsODNjcTWHmndb'],
    ['用户文件', 'https://open.feishu.cn/open-apis/drive/v1/files?folder_token='],
  ];
  
  for (const [name, url] of tests) {
    const r = await testAPI(name, url);
    console.log(`${name}: ${r.status}`);
    if (r.status !== 200) console.log(`  ${r.data}`);
  }
}

main();