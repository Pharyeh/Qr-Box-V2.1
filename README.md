# QR Box

A powerful dashboard for tracking market phases, generating trade ideas, and providing AI-driven insights.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/qr-box.git
   cd qr-box
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `server` directory.
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```

## Running the App

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

## Features

- **Phase Monitor:** Track market phases for assets. The data source for each asset (OANDA or YahooFinance) is now accurately shown in the dashboard, reflecting the true provider for each symbol.
- **Trade Ideas:** Generate trade ideas based on market data.
- **GPT Thesis:** Get AI-driven insights with hybrid memory and caching.

## Data Sources

- The backend determines the data source for each asset dynamically:
  - If OANDA data is available, it is used and the source is set to `OANDA`.
  - If OANDA data is not available, Yahoo Finance is used and the source is set to `YahooFinance`.
- The frontend displays the correct source for each row in the Phase Monitor table.

## API Endpoints

- **Phase Monitor:**
  - `GET /api/phasemonitor`: Get phase data for assets.

- **Trade Ideas:**
  - `GET /api/tradeideas`: Get trade ideas based on market data.

- **GPT Thesis:**
  - `GET /api/gptthesis?symbol=<symbol>`: Get AI-generated insights for a specific asset.

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -m 'Add your feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Submit a pull request.

## License

This project is licensed under the MIT License. 