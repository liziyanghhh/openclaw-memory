// 多种权限授权链接
console.log('请用这个链接重新授权：\n');
console.log('https://open.feishu.cn/open-apis/authen/v1/authorize?app_id=cli_a949f94b0ffa9bc2&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth%2Fcallback&state=wiki-auth&scope=wiki%3Awiki%2Cwiki%3Awiki%3Areadonly%2Cwiki%3Aspace%3Aretrieve%2Cwiki%3Anode%3Areadonly%2Cbitable%3Aapp%2Cbitable%3Aapp%3Areadonly%2Cdrive%3Adrive%2Cdrive%3Adrive%3Areadonly%2Cdoc%3Adoc%2Cdoc%3Adoc%3Areadonly');
console.log('\n\n授权时请确保勾选了以下权限：');
console.log('- 知识库 (wiki)');
console.log('- 云表格 (bitable)');
console.log('- 云盘 (drive)');