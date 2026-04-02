const https = require('https');

const token = 't-g1043pf2GVHITZTVO7AHPA2WTNAEFHUS54WFN26S';
const spreadsheetToken = 'CPUCsz8YLhbuVUtt2RFcnV4dnhe';

// 测试写入表格
const writeData = JSON.stringify({
  valueRange: {
    range: 'A1',
    values: [['测试写入']]
  }
});

console.log('测试写入表格...');
const writeReq = https.request({
  hostname: 'open.feishu.cn',
  path: '/open-apis/sheets/v3/spreadsheets/' + spreadsheetToken + '/values/A1',
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
    'Content-Length': writeData.length
  }
}, writeRes => {
  let writeBody = '';
  writeRes.on('data', chunk => writeBody += chunk);
  writeRes.on('end', () => {
    console.log('写入结果:', writeRes.statusCode, writeBody);
  });
});

writeReq.on('error', e => console.log('写入错误:', e.message));
writeReq.write(writeData);
writeReq.end();