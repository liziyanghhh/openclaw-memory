const XLSX = require('xlsx');
const path = require('path');

// 3月23日合计14条记录的数据（从页面提取）
const data = {
  sheetName: 'Sheet1',
  data: [
    [
      '消费',
      '展现量',
      '点击量',
      '点击率',
      '平均点击成本',
      '平均千次展示费用',
      '点赞',
      '评论',
      '关注',
      '分享',
      '互动量',
      '平均互动成本',
      '私信进线数',
      '私信进线成本',
      '私信开口数',
      '私信开口成本'
    ],
    [
      '1,317.01',
      '14,872',
      '558',
      '3.75%',
      '2.36',
      '88.56',
      '30',
      '2',
      '11',
      '10',
      '73',
      '18.04',
      '37',
      '35.59',
      '29',
      '45.41'
    ]
  ]
};

const desktopPath = 'C:\\Users\\liziy\\Desktop';
const fileName = '大阪3.23.xlsx';
const filePath = path.join(desktopPath, fileName);

try {
  // 先尝试读取，如果不存在则创建
  let workbook;
  try {
    workbook = XLSX.readFile(filePath);
  } catch (e) {
    workbook = XLSX.utils.book_new();
  }
  
  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(data.data);
  
  // 删除旧的Sheet1并添加新的
  if (workbook.SheetNames.includes('Sheet1')) {
    delete workbook.Sheets['Sheet1'];
  }
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // 写入文件
  XLSX.writeFile(workbook, filePath);

  console.log('数据已成功写入: ' + filePath);
  console.log('数据科目数: 16');
  console.log('数据日期: 2026-03-23');
} catch (error) {
  console.error('写入失败: ' + error.message);
  // 如果还是失败，尝试写入新文件
  const newFileName = '大阪3.23_新.xlsx';
  const newFilePath = path.join(desktopPath, newFileName);
  const newWorkbook = XLSX.utils.book_new();
  const newWorksheet = XLSX.utils.aoa_to_sheet(data.data);
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1');
  XLSX.writeFile(newWorkbook, newFilePath);
  console.log('已写入新文件: ' + newFilePath);
}
