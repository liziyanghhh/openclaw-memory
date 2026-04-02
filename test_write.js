const https = require('https');

const token = 't-g1043pf2GVHITZTVO7AHPA2WTNAEFHUS54WFN26S';
const spreadsheetToken = 'CPUCsz8YLhbuVUtt2RFcnV4dnhe';

const paths = [
  '/open-apis/sheets/v3/spreadsheets/' + spreadsheetToken + '/values',
  '/open-apis/sheets/v3/spreadsheets/' + spreadsheetToken + '/values/A1',
  '/open-apis/sheets/v3/spreadsheets/' + spreadsheetToken + '/cells/A1',
  '/open-apis/sheets/v3/spreadsheets/' + spreadsheetToken + '/data'
];

paths.forEach(path => {
  const data = JSON.stringify({ valueRange: { range: 'A1', values: [['测试']] }});
  const req = https.request({
    hostname: 'open.feishu.cn',
    path: path,
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(path + ' => ' + res.statusCode + ' ' + body.substring(0, 80)));
  });
  req.write(data);
  req.end();
});