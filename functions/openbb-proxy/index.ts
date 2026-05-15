import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

async function fetchYahooFinanceData(symbol: string): Promise<any> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch from Yahoo Finance');
  return await response.json();
}

async function fetchAlphaVantageQuote(symbol: string, apiKey: string): Promise<any> {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch from Alpha Vantage');
  return await response.json();
}

async function fetchAlphaVantageOverview(symbol: string, apiKey: string): Promise<any> {
  const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch overview');
  return await response.json();
}

async function fetchAlphaVantageIncome(symbol: string, apiKey: string): Promise<any> {
  const url = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch income data');
  return await response.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbol, type = 'quote' } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY') || 'demo';
    
    let data: any = {};
    
    switch (type) {
      case 'quote':
        const quoteData = await fetchAlphaVantageQuote(symbol, apiKey);
        const overviewData = await fetchAlphaVantageOverview(symbol, apiKey);
        data = {
          symbol: quoteData['Global Quote']?.['01. symbol'] || symbol,
          price: parseFloat(quoteData['Global Quote']?.['05. price'] || 0),
          change: parseFloat(quoteData['Global Quote']?.['09. change'] || 0),
          changePercent: parseFloat((quoteData['Global Quote']?.['10. change percent'] || '0%').replace('%', '')),
          volume: parseInt(quoteData['Global Quote']?.['06. volume'] || 0),
          name: overviewData.Name || symbol,
          pe: parseFloat(overviewData.PERatio || 0),
          pb: parseFloat(overviewData.PriceToBookRatio || 0),
          marketCap: parseFloat(overviewData.MarketCapitalization || 0),
          dividendYield: parseFloat(overviewData.DividendYield || 0) * 100,
        };
        break;
        
      case 'financial':
        const incomeData = await fetchAlphaVantageIncome(symbol, apiKey);
        const overview = await fetchAlphaVantageOverview(symbol, apiKey);
        const annualReports = incomeData.annualReports?.[0] || {};
        data = {
          revenue: parseFloat(annualReports.totalRevenue || 0),
          netIncome: parseFloat(annualReports.netIncome || 0),
          grossProfit: parseFloat(annualReports.grossProfit || 0),
          operatingIncome: parseFloat(annualReports.operatingIncome || 0),
          roe: parseFloat(overview.ReturnOnEquityTTM || 0) * 100,
          roa: parseFloat(overview.ReturnOnAssetsTTM || 0) * 100,
          grossMargin: parseFloat(overview.GrossProfitTTM || 0) / parseFloat(annualReports.totalRevenue || 1) * 100,
          profitMargin: parseFloat(overview.ProfitMargin || 0) * 100,
        };
        break;
        
      default:
        data = { message: 'Unknown type' };
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: corsHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
