const https = require('https');

const token = 't-g1043pda6UCDFLPKG4GZLOEDGJSWL4BSODGBODGJ';
const spreadsheetToken = 'CPUCsz8YLhbuVUtt2RFcnV4dnhe';

// 先获取表格信息
const getReq = https.request({
  hostname: 'open.feishu.cn',
  path: '/open-apis/sheets/v3/spreadsheets/' + spreadsheetToken,
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + token }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('GET spreadsheet:', body);
    
    // 尝试写入数据
    const writeData = JSON.stringify({
      valueRange: {
        range: 'A1:C2',
        values: [
          ['标题', '数据', '时间'],
          ['测试', '123', new Date().toLocaleString()]
        ]
      }
    });
    
    const writeReq = https.request({
      hostname: 'open.feishu.cn',
      path: '/open-apis/sheets/v3/spreadsheets/' + spreadsheetToken + '/values/A1:C2',
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': writeData.length
      }
    }, writeRes => {
      let writeBody = '';
      writeRes.on('data', chunk => writeBody += chunk);
      writeRes.on('end', () => console.log('PUT values:', writeRes.statusCode, writeBody));
    });
    
    writeReq.write(writeData);
    writeReq.end();
  });
});

getReq.end();