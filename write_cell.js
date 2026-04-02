const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const spreadsheetToken = 'GOjmsTOcFhDSa2totIIcrl0bn5f';
const sheetId = 'b12a4d';
const range = 'b12a4d!A2:U2';
const values = fs.readFileSync('values.json', 'utf-8');

try {
  // Use cmd /c to run the command
  const fullCmd = `cmd /c "lark-cli sheets +write --spreadsheet-token ${spreadsheetToken} --sheet-id ${sheetId} --range ${range} --values ${values}"`;
  console.log('Executing:', fullCmd);
  const result = execSync(fullCmd, { encoding: 'utf-8' });
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error.message);
}
