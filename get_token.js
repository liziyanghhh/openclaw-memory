const https = require('https');
const querystring = require('querystring');

const appId = process.argv[2];
const appSecret = process.argv[3];

const postData = querystring.stringify({
  app_id: appId,
  app_secret: appSecret
});

const req = https.request({
  hostname: 'open.feishu.cn',
  path: '/open-apis/auth/v3/tenant_access_token/internal',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(body));
});

req.write(postData);
req.end();