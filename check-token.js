// 检查Token授权的权限
const fs = require('fs');
const t = JSON.parse(fs.readFileSync('./user-token.json', 'utf8'));

console.log('Token信息:');
console.log('- user_id:', t.user_id);
console.log('- name:', t.name);
console.log('- expires_in:', t.expires_in);
console.log('- refresh_expires_in:', t.refresh_expires_in);
console.log('\n注意: 授权时请确保勾选了 Wiki/知识库 权限');
console.log('如果之前授权时没勾选，需要重新授权并勾选');