const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

async function parseStocks(excelPath) {
  try {
    if (!fs.existsSync(excelPath)) {
      throw new Error(`文件不存在: ${excelPath}`);
    }

    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const stocks = [];
    
    for (const row of data) {
      const keys = Object.keys(row);
      for (const key of keys) {
        const value = String(row[key]).trim();
        
        // 匹配股票代码格式：6位数字
        if (/^\d{6}$/.test(value)) {
          const stockCode = value;
          const stockName = row['股票名称'] || row['名称'] || row['name'] || '';
          const exchange = stockCode.startsWith('6') ? 'SH' : 'SZ';
          
          stocks.push({
            code: stockCode,
            name: stockName,
            exchange: exchange,
            fullCode: `${exchange}${stockCode}`
          });
          break;
        }
      }
    }

    // 去重
    const uniqueStocks = stocks.filter((stock, index, self) =>
      index === self.findIndex(s => s.code === stock.code)
    );

    console.log(JSON.stringify({
      success: true,
      count: uniqueStocks.length,
      stocks: uniqueStocks
    }, null, 2));

    return uniqueStocks;
  } catch (error) {
    console.error(JSON.stringify({
      success: false,
      error: error.message
    }, null, 2));
    process.exit(1);
  }
}

const excelPath = process.argv[2];
if (!excelPath) {
  console.error('用法: node parse-stocks.js <excel文件路径>');
  process.exit(1);
}

parseStocks(excelPath);
