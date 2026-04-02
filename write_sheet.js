const https = require('https');

const token = 't-g1043paJRQE6LUJK6JN33KSJD7YO36JDON4MT6LT';
const st = 'CPUCsz8YLhbuVUtt2RFcnV4dnhe';

const data = JSON.stringify({
  valueRange: {
    range: 'A1:C2',
    values: [
      ['标题', '数据', '时间'],
      ['测试', '123', new Date().toLocaleString()]
    ]
  }
});

const req = https.request({
  hostname: 'open.feishu.cn',
  path: '/open-apis/sheets/v3/spreadsheets/' + st + '/values/A1:C2',
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(res.statusCode, body));
});

req.write(data);
req.end();