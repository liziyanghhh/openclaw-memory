const https = require('https');

const token = 't-g1043pda6UCDFLPKG4GZLOEDGJSWL4BSODGBODGJ';
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
  path: '/open-apis/sheets/v3/spreadsheets/' + st + '/values/A1:C2?valueInputOption=USER_ENTERED',
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(res.statusCode, body));
});

req.write(data);
req.end();