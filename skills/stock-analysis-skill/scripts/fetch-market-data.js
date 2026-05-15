const axios = require('axios');

/**
 * 获取市场数据
 * @param {string} symbol - 股票代码
 * @param {string} period - 时间周期 (1d, 1w, 1m, 3m, 6m, 1y)
 * @returns {Promise<Object>} 市场数据
 */
async function fetchMarketData(symbol, period = '1d') {
  try {
    // 模拟API调用，实际使用时需要替换为真实的数据源API
    const response = await axios.get(`https://api.example.com/stock/${symbol}`, {
      params: {
        period: period,
        api_key: process.env.STOCK_API_KEY
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取市场数据失败:', error.message);
    throw error;
  }
}

/**
 * 获取大盘指数数据
 * @param {string} index - 指数代码 (SH000001, SZ399001, etc.)
 * @returns {Promise<Object>} 指数数据
 */
async function fetchIndexData(index) {
  try {
    // 模拟API调用
    const response = await axios.get(`https://api.example.com/index/${index}`, {
      params: {
        api_key: process.env.STOCK_API_KEY
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取指数数据失败:', error.message);
    throw error;
  }
}

module.exports = {
  fetchMarketData,
  fetchIndexData
};