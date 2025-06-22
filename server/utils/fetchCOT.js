// server/utils/fetchCOT.js

import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import { COT_MAP } from './cotMapping.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, 'cot-latest.json');

// --- Dynamic Year Logic ---
const now = new Date();
const curYear = now.getFullYear();
const prevYear = curYear - 1;

const COT_YEARS = [curYear, prevYear];
const COT_URLS = COT_YEARS.map(y => `https://www.cftc.gov/files/dea/history/fut_fin_txt_${y}.zip`);
const COT_DCOT_URLS = COT_YEARS.map(y => `https://www.cftc.gov/files/dea/history/fut_disagg_txt_${y}.zip`);

function parseNum(val) {
  if (!val) return 0;
  const n = Number(String(val).replace(/,/g, '').trim());
  return isNaN(n) ? 0 : n;
}

function getCotSentimentLabel(netNonComm) {
  if (netNonComm >= 100000) return 'Extremely Bullish';
  if (netNonComm >= 50000) return 'Strong Bullish';
  if (netNonComm >= 10000) return 'Moderate Bullish';
  if (netNonComm <= -100000) return 'Extremely Bearish';
  if (netNonComm <= -50000) return 'Strong Bearish';
  if (netNonComm <= -10000) return 'Moderate Bearish';
  return 'Neutral';
}

function getCotScore(netNonComm) {
  // Normalize COT score between -100 to +100
  const maxRef = 200000;
  const score = Math.max(-100, Math.min(100, Math.round((netNonComm / maxRef) * 100)));
  return score;
}

async function fetchAndParseCOT() {
  let records = [];
  let dcotRecords = [];

  for (const url of COT_URLS) {
    console.log('Trying COT financial URL:', url);
    const res = await fetch(url);
    if (!res.ok) continue;
    const buffer = await res.arrayBuffer();
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(Buffer.from(buffer));
    const entries = zip.getEntries();
    if (!entries.length) continue;
    const csvData = entries[0].getData().toString('utf8');
    records = parse(csvData, { columns: true, skip_empty_lines: true });
    if (records.length > 0) break;
  }

  for (const url of COT_DCOT_URLS) {
    console.log('Trying DCOT URL:', url);
    const res = await fetch(url);
    if (!res.ok) continue;
    const buffer = await res.arrayBuffer();
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(Buffer.from(buffer));
    const entries = zip.getEntries();
    if (!entries.length) continue;
    const csvData = entries[0].getData().toString('utf8');
    dcotRecords = parse(csvData, { columns: true, skip_empty_lines: true });
    if (dcotRecords.length > 0) break;
  }

  let allDates = [];
  records.forEach(row => allDates.push(row['Report_Date_as_YYYY-MM-DD']));
  dcotRecords.forEach(row => allDates.push(row['Report_Date_as_YYYY-MM-DD']));
  const latestDate = allDates.sort().reverse()[0];

  const weekRecords = {};
  const addRows = (rows, isDCOT = false) => {
    for (const row of rows) {
      const code = row['CFTC_Contract_Market_Code'];
      const date = row['Report_Date_as_YYYY-MM-DD'];
      if (date !== latestDate) continue;
      let nonCommLong, nonCommShort, commLong, commShort, openInterest;

      if (isDCOT) {
        nonCommLong = parseNum(row['Prod_Merc_Positions_Long_All']) + parseNum(row['Swap_Positions_Long_All']) + parseNum(row['M_Money_Positions_Long_All']);
        nonCommShort = parseNum(row['Prod_Merc_Positions_Short_All']) + parseNum(row['Swap_Positions_Short_All']) + parseNum(row['M_Money_Positions_Short_All']);
        commLong = parseNum(row['Other_Rept_Positions_Long_All']);
        commShort = parseNum(row['Other_Rept_Positions_Short_All']);
      } else {
        nonCommLong = parseNum(row['Asset_Mgr_Positions_Long_All']) + parseNum(row['Lev_Money_Positions_Long_All']);
        nonCommShort = parseNum(row['Asset_Mgr_Positions_Short_All']) + parseNum(row['Lev_Money_Positions_Short_All']);
        commLong = parseNum(row['Comm_Positions_Long_All']);
        commShort = parseNum(row['Comm_Positions_Short_All']);
      }

      openInterest = parseNum(row['Open_Interest_All']);
      if (nonCommLong === 0 && commLong === 0) continue;

      const netNonComm = nonCommLong - nonCommShort;
      const netComm = commLong - commShort;

      weekRecords[code] = {
        date,
        code,
        market: row['Market_and_Exchange_Names'],
        nonCommLong,
        nonCommShort,
        commLong,
        commShort,
        openInterest,
        netNonComm,
        netComm,
        cotSentiment: getCotSentimentLabel(netNonComm),
        cotScore: getCotScore(netNonComm)
      };
    }
  };

  addRows(records, false);
  addRows(dcotRecords, true);

  const USD_PAIRS_TO_INVERT = ['USDCAD', 'USDCHF', 'USDJPY'];

  function invertCOT(cot) {
    return {
      ...cot,
      nonCommLong: cot.nonCommShort,
      nonCommShort: cot.nonCommLong,
      commLong: cot.commShort,
      commShort: cot.commLong,
      netNonComm: -cot.netNonComm,
      netComm: -cot.netComm,
      cotSentiment: getCotSentimentLabel(-cot.netNonComm),
      cotScore: getCotScore(-cot.netNonComm)
    };
  }

  const output = {};
  const missing = [];

  for (const [symbol, codeOrArr] of Object.entries(COT_MAP)) {
    if (Array.isArray(codeOrArr)) {
      const [codeA, codeB] = codeOrArr;
      if (weekRecords[codeA] && weekRecords[codeB]) {
        const netNonComm = weekRecords[codeA].netNonComm - weekRecords[codeB].netNonComm;
        output[symbol] = {
          date: latestDate,
          netNonComm,
          netComm: weekRecords[codeA].netComm - weekRecords[codeB].netComm,
          cotSentiment: getCotSentimentLabel(netNonComm),
          cotScore: getCotScore(netNonComm),
          base: weekRecords[codeA],
          quote: weekRecords[codeB]
        };
      } else {
        missing.push(symbol);
        output[symbol] = { market: 'N/A', reason: 'Missing leg in synthetic pair.' };
      }
    } else if (weekRecords[codeOrArr]) {
      output[symbol] = USD_PAIRS_TO_INVERT.includes(symbol)
        ? invertCOT(weekRecords[codeOrArr])
        : weekRecords[codeOrArr];
    } else {
      missing.push(symbol);
      output[symbol] = { market: 'N/A', reason: 'Missing COT record' };
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  const latest = new Date(latestDate);
  const daysOld = Math.floor((now - latest) / (1000 * 60 * 60 * 24));
  if (daysOld > 5) console.warn(`⚠️ Warning: Latest COT data is ${daysOld} days old (${latestDate})`);

  const datedBackupPath = path.join(__dirname, `cot-${latestDate}.json`);
  fs.writeFileSync(datedBackupPath, JSON.stringify(output, null, 2));

  console.log('✅ COT data saved to:', OUTPUT_FILE);
  console.log('📦 Snapshot saved as:', datedBackupPath);
  if (missing.length) console.warn('⚠️ Missing symbols:', missing);
  else console.log('🎯 All mapped symbols processed successfully.');
}

fetchAndParseCOT().catch(err => {
  console.error('COT fetch/parse error:', err);
  process.exit(1);
});
