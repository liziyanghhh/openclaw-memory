// 尝试通过各种方式获取Wiki
const fs = require('fs');
const t = JSON.parse(fs.readFileSync('./user-token.json', 'utf8'));
const TOKEN = t.access_token;
const DOC_ID = 'S65QwGl3BiUjFekvznHc7XMcnOd';

async function main() {
  console.log('=== 尝试不同方式 ===\n');
  
  // 1. 尝试获取Wiki空间
  const spaces = await (await fetch('https://open.feishu.cn/open-apis/wiki/v2/spaces', { 
    headers: { Authorization: `Bearer ${TOKEN}` } 
  })).json();
  console.log('Wiki空间:', JSON.stringify(spaces, null, 2));
  
  // 2. 尝试通过space获取节点
  const nodeInSpace = await (await fetch('https://open.feishu.cn/open-apis/wiki/v2/spaces//nodes/' + DOC_ID, { 
    headers: { Authorization: `Bearer ${TOKEN}` } 
  })).json();
  console.log('\n节点(space):', JSON.stringify(nodeInSpace, null, 2));
  
  // 3. 获取文档内容
  const content = await (await fetch('https://open.feishu.cn/open-apis/doc/v3/documents/' + DOC_ID + '/content', { 
    headers: { Authorization: `Bearer ${TOKEN}` } 
  })).json();
  console.log('\n文档内容:', JSON.stringify(content, null, 2).slice(0, 1000));
}

main();