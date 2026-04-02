const https = require('https');

const token = 't-g1043pf2GVHITZTVO7AHPA2WTNAEFHUS54WFN26S';

// 1. 创建新表格
const createData = JSON.stringify({
  title: '测试写入 ' + new Date().getTime()
});

const createReq = https.request({
  hostname: 'open.feishu.cn',
  path: '/open-apis/sheets/v3/spreadsheets',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
    'Content-Length': createData.length
  }
}, createRes => {
  let createBody = '';
  createRes.on('data', chunk => createBody += chunk);
  createRes.on('end', () => {
    console.log('创建表格:', createRes.statusCode, createBody.substring(0, 200));
    
    try {
      const result = JSON.parse(createBody);
      if (result.data && result.data.spreadsheet) {
        const newToken = result.data.spreadsheet.token;
        console.log('新表格token:', newToken);
        
        // 2. 尝试写入数据
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
          path: '/open-apis/sheets/v3/spreadsheets/' + newToken + '/values/A1:C2',
          method: 'PUT',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            'Content-Length': writeData.length
          }
        }, writeRes => {
          let writeBody = '';
          writeRes.on('data', chunk => writeBody += chunk);
          writeRes.on('end', () => console.log('写入数据:', writeRes.statusCode, writeBody));
        });
        
        writeReq.write(writeData);
        writeReq.end();
      }
    } catch (e) {
      console.log('解析失败:', e.message);
    }
  });
});

createReq.write(createData);
createReq.end();