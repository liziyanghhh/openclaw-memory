// 列出用户所有云表格和文件
const fs = require('fs');
const t = JSON.parse(fs.readFileSync('./user-token.json', 'utf8'));
const TOKEN = t.access_token;

async function scan(folderToken = '', path = '/') {
  const resp = await fetch(`https://open.feishu.cn/open-apis/drive/v1/files?folder_token=${folderToken}&page_size=100`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  const data = await resp.json();
  
  for (const f of data.data?.files || []) {
    const match = f.name.match(/大版|协作表|协作/i);
    console.log(`${path}${f.name} [${f.type}] ${match ? '<-- 匹配!' : ''}`);
    
    if (f.type === 'folder') await scan(f.token, path + f.name + '/');
  }
}

async function main() {
  console.log('=== 扫描所有文件 ===\n');
  await scan('');
  console.log('\n完成');
}

main();