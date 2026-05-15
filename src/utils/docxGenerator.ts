import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { saveAs } from 'file-saver';

interface StockData {
  basic: {
    code: string;
    name: string;
    price: number;
    change_percent: number;
    pe_ttm: number;
    pb: number;
    market_cap: number;
    dividend_yield: number;
  };
  financial: {
    revenue: number;
    revenue_growth: number;
    net_profit: number;
    profit_growth: number;
    roe: number;
    gross_margin: number;
  };
  reports: Array<{
    institution: string;
    rating: string;
    target_price: number;
  }>;
}

function createCell(text: string, isHeader = false): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: isHeader })],
        alignment: AlignmentType.CENTER,
      }),
    ],
    shading: isHeader ? { fill: 'F3F4F6' } : undefined,
  });
}

function createSectionTitle(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 180 },
  });
}

function createKeyValueTable(rows: Array<[string, string, string, string]>): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      ([labelA, valueA, labelB, valueB]) =>
        new TableRow({
          children: [
            createCell(labelA, true),
            createCell(valueA),
            createCell(labelB, true),
            createCell(valueB),
          ],
        }),
    ),
  });
}

export async function generateStockReportDocx(stockData: StockData): Promise<void> {
  const { basic, financial, reports } = stockData;
  const avgTarget =
    reports.length > 0
      ? reports.reduce((sum, report) => sum + report.target_price, 0) / reports.length
      : basic.price * 1.1;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          new Paragraph({
            text: `${basic.name} (${basic.code}) Investment Report`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
          }),

          createSectionTitle('Executive Summary'),
          new Paragraph({
            text: `Average target price: ${avgTarget.toFixed(2)}`,
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: `Current price: ${basic.price.toFixed(2)} | Change: ${basic.change_percent.toFixed(2)}%`,
            spacing: { after: 200 },
          }),

          createSectionTitle('Basic Information'),
          createKeyValueTable([
            ['Name', basic.name, 'Code', basic.code],
            ['Price', basic.price.toFixed(2), 'Change %', basic.change_percent.toFixed(2)],
            ['PE (TTM)', basic.pe_ttm.toFixed(2), 'PB', basic.pb.toFixed(2)],
            ['Market Cap', basic.market_cap.toFixed(0), 'Dividend Yield', basic.dividend_yield.toFixed(2)],
          ]),

          createSectionTitle('Financial Snapshot'),
          createKeyValueTable([
            ['Revenue', financial.revenue.toFixed(2), 'Revenue Growth %', financial.revenue_growth.toFixed(2)],
            ['Net Profit', financial.net_profit.toFixed(2), 'Profit Growth %', financial.profit_growth.toFixed(2)],
            ['ROE %', financial.roe.toFixed(2), 'Gross Margin %', financial.gross_margin.toFixed(2)],
            ['Report Count', String(reports.length), 'Target Price Avg', avgTarget.toFixed(2)],
          ]),

          createSectionTitle('Broker Reports'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell('Institution', true),
                  createCell('Rating', true),
                  createCell('Target Price', true),
                ],
              }),
              ...reports.slice(0, 5).map(
                (report) =>
                  new TableRow({
                    children: [
                      createCell(report.institution),
                      createCell(report.rating),
                      createCell(report.target_price.toFixed(2)),
                    ],
                  }),
              ),
            ],
          }),

          new Paragraph({
            children: [new TextRun({ text: 'Disclaimer: ', bold: true }), new TextRun('This document is for reference only.')],
            spacing: { before: 420 },
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${basic.name}_${basic.code}_report.docx`);
}
