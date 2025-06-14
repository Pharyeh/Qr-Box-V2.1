const fs = require('fs');
const csv = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Function to convert PhaseMonitor CSV to TradingView format
async function convertToTradingView(inputFile, outputFile) {
    try {
        // Read the input CSV file
        const fileContent = fs.readFileSync(inputFile, 'utf-8');
        
        // Parse the CSV
        const records = csv.parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });

        // Transform the data for TradingView
        const tradingViewRecords = records.map(record => {
            // Assuming the symbol is in a column named 'symbol' or 'ticker'
            // Adjust the column name based on your actual CSV structure
            const symbol = record.symbol || record.ticker;
            
            // Create TradingView compatible record
            return {
                Symbol: symbol,
                Description: record.name || '', // Add description if available
                Exchange: record.exchange || 'BINANCE' // Default to BINANCE, adjust as needed
            };
        });

        // Convert to CSV string
        const output = stringify(tradingViewRecords, {
            header: true,
            columns: ['Symbol', 'Description', 'Exchange']
        });

        // Write to output file
        fs.writeFileSync(outputFile, output);
        
        console.log(`Successfully converted ${tradingViewRecords.length} symbols to TradingView format`);
        console.log(`Output saved to: ${outputFile}`);
    } catch (error) {
        console.error('Error converting file:', error.message);
    }
}

// Example usage
const inputFile = 'phase_monitor.csv'; // Your input file
const outputFile = 'tradingview_watchlist.csv'; // Output file

convertToTradingView(inputFile, outputFile); 