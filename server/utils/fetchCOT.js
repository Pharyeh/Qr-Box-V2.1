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
// Use Disaggregated COT for commodities (metals, energies, grains, softs)
const COT_DCOT_URLS = COT_YEARS.map(y => `https://www.cftc.gov/files/dea/history/fut_disagg_txt_${y}.zip`);

function parseNum(val) {
  if (!val) return 0;
  const n = Number(String(val).replace(/,/g, '').trim());
  return isNaN(n) ? 0 : n;
}

async function fetchAndParseCOT() {
  let records = [];
  let dcotRecords = [];

  // Fetch main COT data (CME, CBOT, NYMEX, COMEX)
  for (const url of COT_URLS) {
    console.log('Trying COT financial URL:', url);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Failed: ${url} (${res.status})`);
      continue;
    }
    const buffer = await res.arrayBuffer();
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(Buffer.from(buffer));
    const entries = zip.getEntries();
    if (!entries.length) continue;
    const csvData = entries[0].getData().toString('utf8');
    records = parse(csvData, { columns: true, skip_empty_lines: true });
    if (records.length > 0) break;
  }

  // Fetch Disaggregated COT data (metals, energies, grains, softs)
  for (const url of COT_DCOT_URLS) {
    console.log('Trying DCOT URL:', url);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Failed: ${url} (${res.status})`);
      continue;
    }
    const buffer = await res.arrayBuffer();
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(Buffer.from(buffer));
    const entries = zip.getEntries();
    if (!entries.length) continue;
    const csvData = entries[0].getData().toString('utf8');
    dcotRecords = parse(csvData, { columns: true, skip_empty_lines: true });
    if (dcotRecords.length > 0) break;
  }

  // --- Find the most recent week across ALL records ---
  let allDates = [];
  records.forEach(row => allDates.push(row['Report_Date_as_YYYY-MM-DD']));
  dcotRecords.forEach(row => allDates.push(row['Report_Date_as_YYYY-MM-DD']));
  const latestDate = allDates.sort().reverse()[0];

  // --- Build a lookup of COT records for that week ---
  const weekRecords = {};
  const addRows = (rows, isDCOT = false) => {
    for (const row of rows) {
      const code = row['CFTC_Contract_Market_Code'];
      const date = row['Report_Date_as_YYYY-MM-DD'];
      if (date !== latestDate) continue;
      let nonCommLong, nonCommShort, commLong, commShort, openInterest;
      if (isDCOT) {
        // DCOT format: Producer/Merchant/Processor/User + Swap Dealers + Managed Money
        nonCommLong = parseNum(row['Prod_Merc_Positions_Long_All']) + 
                     parseNum(row['Swap_Positions_Long_All']) + 
                     parseNum(row['M_Money_Positions_Long_All']);
        nonCommShort = parseNum(row['Prod_Merc_Positions_Short_All']) + 
                      parseNum(row['Swap_Positions_Short_All']) + 
                      parseNum(row['M_Money_Positions_Short_All']);
        commLong = parseNum(row['Other_Rept_Positions_Long_All']);
        commShort = parseNum(row['Other_Rept_Positions_Short_All']);
        openInterest = parseNum(row['Open_Interest_All']);
      } else {
        // Financial format: Asset Manager + Leveraged Money
        nonCommLong = parseNum(row['Asset_Mgr_Positions_Long_All']) + parseNum(row['Lev_Money_Positions_Long_All']);
        nonCommShort = parseNum(row['Asset_Mgr_Positions_Short_All']) + parseNum(row['Lev_Money_Positions_Short_All']);
        commLong = parseNum(row['Comm_Positions_Long_All']);
        commShort = parseNum(row['Comm_Positions_Short_All']);
        openInterest = parseNum(row['Open_Interest_All']);
      }
      if (nonCommLong === 0 && commLong === 0) continue;
      weekRecords[code] = {
        date,
        code,
        market: row['Market_and_Exchange_Names'],
        nonCommLong,
        nonCommShort,
        commLong,
        commShort,
        openInterest,
        netNonComm: nonCommLong - nonCommShort,
        netComm: commLong - commShort
      };
    }
  };
  addRows(records, false);
  addRows(dcotRecords, true);

  // Print all available contract codes for debugging
  const allCodes = new Set();
  records.forEach(row => allCodes.add(row['CFTC_Contract_Market_Code']));
  dcotRecords.forEach(row => allCodes.add(row['CFTC_Contract_Market_Code']));
  console.log('DEBUG: All contract codes found in CFTC files:', Array.from(allCodes).sort());

  // Print first 30 records from DCOT file to see actual codes and market names
  console.log('\n================ DCOT CODES & MARKETS (FIRST 30) ================');
  let count = 0;
  for (const row of dcotRecords) {
    const code = row['CFTC_Contract_Market_Code'];
    const name = row['Market_and_Exchange_Names'];
    console.log(`${code} | ${name}`);
    if (++count >= 30) break;
  }
  console.log('================ END DCOT CODES & MARKETS ================\n');

  // Build a lookup for the latest report date per code for both datasets
  const latest = {};
  const processRows = (rows, isDCOT = false, sourceLabel = '') => {
    for (const row of rows) {
      const code = row['CFTC_Contract_Market_Code'];
      const date = row['Report_Date_as_YYYY-MM-DD'];
      if (date !== latestDate) continue;
      if (!latest[code] || date > latest[code].date) {
        latest[code] = {
          date,
          code,
          market: row['Market_and_Exchange_Names'],
          source: sourceLabel,
          ...(isDCOT ? {
            nonCommLong: parseNum(row['Prod_Merc_Positions_Long_All']),
            nonCommShort: parseNum(row['Prod_Merc_Positions_Short_All']),
            commLong: parseNum(row['Other_Rept_Positions_Long_All']),
            commShort: parseNum(row['Other_Rept_Positions_Short_All']),
            openInterest: parseNum(row['Open_Interest_All']),
            netNonComm: parseNum(row['Prod_Merc_Positions_Long_All']) - parseNum(row['Prod_Merc_Positions_Short_All']),
            netComm: parseNum(row['Other_Rept_Positions_Long_All']) - parseNum(row['Other_Rept_Positions_Short_All'])
          } : {
            nonCommLong: parseNum(row['Asset_Mgr_Positions_Long_All']) + parseNum(row['Lev_Money_Positions_Long_All']),
            nonCommShort: parseNum(row['Asset_Mgr_Positions_Short_All']) + parseNum(row['Lev_Money_Positions_Short_All']),
            commLong: parseNum(row['Comm_Positions_Long_All']),
            commShort: parseNum(row['Comm_Positions_Short_All']),
            openInterest: parseNum(row['Open_Interest_All']),
            netNonComm: parseNum(row['Asset_Mgr_Positions_Long_All']) + parseNum(row['Lev_Money_Positions_Long_All']) - (parseNum(row['Asset_Mgr_Positions_Short_All']) + parseNum(row['Lev_Money_Positions_Short_All'])),
            netComm: parseNum(row['Comm_Positions_Long_All']) - parseNum(row['Comm_Positions_Short_All'])
          })
        };
      }
    }
  };
  processRows(records, false, 'COT');
  processRows(dcotRecords, true, 'DCOT');

  // --- Build output for all mapped codes ---
  const output = {};
  const missing = [];
  for (const [symbol, codeOrArr] of Object.entries(COT_MAP)) {
    if (Array.isArray(codeOrArr)) {
      // Synthetic: e.g., EURGBP
      const [codeA, codeB] = codeOrArr;
      if (weekRecords[codeA] && weekRecords[codeB]) {
        output[symbol] = {
          date: latestDate,
          netNonComm: weekRecords[codeA].netNonComm - weekRecords[codeB].netNonComm,
          netComm: weekRecords[codeA].netComm - weekRecords[codeB].netComm,
          base: weekRecords[codeA],
          quote: weekRecords[codeB],
        };
      } else {
        output[symbol] = {
          market: 'N/A',
          reason: 'Synthetic pair or cross; one or both legs missing COT data for latest week.'
        };
        missing.push(symbol);
      }
    } else if (weekRecords[codeOrArr]) {
      output[codeOrArr] = weekRecords[codeOrArr];
    } else {
      output[codeOrArr] = {
        market: 'N/A',
        reason: 'No COT data for latest week.'
      };
      missing.push(symbol);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log('Latest COT week:', latestDate);
  console.log('COT data saved to', OUTPUT_FILE);
  if (missing.length) {
    console.warn('Missing COT data for:', missing);
  } else {
    console.log('COT data available for all mapped assets!');
  }
}

fetchAndParseCOT().catch(err => {
  console.error('COT fetch/parse error:', err);
  process.exit(1);
});
