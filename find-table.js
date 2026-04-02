// 尝试更多搜索
const fs = require('fs');
const tokenData = JSON.parse(fs.readFileSync('./user-token.json', 'utf8'));
const TOKEN = tokenData.access_token;

async function main() {
  const searchResp = await fetch('https://open.feishu.cn/open-apis/search/v2/files?query=协作&page_size=20', {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  console.log('Status:', searchResp.status);
  console.log(await searchResp.text());
}

main();