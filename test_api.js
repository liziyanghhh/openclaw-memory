const https = require('https');
const token = process.argv[2];

const paths = [
  '/open-apis/document/v1/documents',
  '/open-apis/doc/v1/documents', 
  '/open-apis/drive/v1/files/files/create_from_template',
  '/open-apis/doc/v3/documents',
  '/open-apis/document/v1/documents/create',
  '/open-apis/document/v1/create'
];

for (const path of paths) {
  const data = JSON.stringify({title: 'test'});
  const req = https.request({
    hostname: 'open.feishu.cn',
    path: path,
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log(path + ' => ' + res.statusCode + ' : ' + body.substring(0, 100));
    });
  });
  req.write(data);
  req.end();
}