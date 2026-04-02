// 飞书Wiki文档读取 - 尝试获取用户Wiki空间
const APP_ID = 'cli_a949f94b0ffa9bc2';
const APP_SECRET = 'AL22hFMXmxOnsL6kxq68ygvfv37d1EVW';
const WIKI_NODE_ID = 'PH6hwN5T2ipvhYkPU8RcoEZRnFf';

async function main() {
  try {
    // 1. 获取 tenant_access_token
    const tokenResp = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET })
    });
    const tokenData = await tokenResp.json();
    const token = tokenData.tenant_access_token;
    console.log('✓ Token 获取成功\n');

    // 2. 获取用户的wiki空间列表
    console.log('=== 获取Wiki空间列表 ===');
    const spacesResp = await fetch('https://open.feishu.cn/open-apis/wiki/v2/spaces', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', spacesResp.status);
    const spacesText = await spacesResp.text();
    console.log('Response:', spacesText.slice(0, 1000));
    
    const spacesData = JSON.parse(spacesText);
    console.log('\n空间列表:');
    for (const space of spacesData.data?.items || []) {
      console.log(`- ${space.name} (${space.space_id})`);
    }
    
    if (spacesData.data?.items?.length > 0) {
      // 用第一个空间的 ID 尝试获取节点
      const firstSpaceId = spacesData.data.items[0].space_id;
      console.log(`\n=== 尝试用 space_id=${firstSpaceId} 获取节点 ===`);
      
      const nodeResp = await fetch(`https://open.feishu.cn/open-apis/wiki/v2/spaces/${firstSpaceId}/nodes/${WIKI_NODE_ID}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Status:', nodeResp.status);
      const nodeText = await nodeResp.text();
      console.log('Response:', nodeText.slice(0, 1000));
    }
    
  } catch (e) {
    console.error('错误:', e);
  }
}

main();