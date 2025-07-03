# QR Box Demo

A cross-platform trading dashboard built with Electron, React, TypeScript, and Express.

## 🧠 Key Features

- **Electron-based desktop app** - Cross-platform trading dashboard
- **Modular React dashboard panels** - Phase Monitor, Trade Ideas, and GPT Thesis
- **Real-time market signal scanner** - Track market phases across multiple assets
- **TypeScript across frontend and backend** - Type-safe development
- **Auto-refresh, CSV export, dark mode** - Professional trading interface
- **Multi-timeframe analysis** - Comprehensive market analysis tools

## 🚀 Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Desktop:** Electron.js
- **Data Sources:** OANDA API, Yahoo Finance, OpenAI GPT
- **UI Components:** Radix UI, Heroicons, React Sparklines

## 🖥️ Demo Preview

> A powerful trading dashboard that combines technical analysis with AI-driven insights

### Features Overview:
- **Phase Monitor:** Real-time market phase tracking for 30+ assets
- **Trade Ideas:** AI-generated trading opportunities with risk analysis
- **GPT Thesis:** Advanced market insights using OpenAI integration
- **Multi-timeframe Analysis:** Comprehensive market analysis across timeframes
- **Export Capabilities:** CSV export for backtesting and analysis

## 🛠️ Running the App

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

#### Quick Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/qr-box-demo.git
cd qr-box-demo

# Run the setup script
npm run setup
```

#### Manual Setup
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/qr-box-demo.git
cd qr-box-demo

# Install dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies  
cd server && npm install && cd ..
```

### Environment Setup

Create a `.env` file in the `server` directory:

```bash
# Required for AI features
OPENAI_API_KEY=your_openai_api_key_here

# Optional: For enhanced data
OANDA_API_KEY=your_oanda_api_key_here
OANDA_ACCOUNT_ID=your_oanda_account_id_here
TINGO_API_KEY=your_tingo_api_key_here
```

### Development

```bash
# Run both client and server in development mode
npm run dev

# Or run separately:
npm run client  # Frontend dev server
npm run server  # Backend API server
```

### Building

```bash
# Build the client
npm run build-client

# Build with Tauri (optional)
npm run tauri:build
```

## 📁 Project Structure

```
qr-box-demo/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── panels/         # Dashboard panels
│   │   ├── api/           # API integration
│   │   └── utils/         # Frontend utilities
├── server/                # Express backend
│   ├── controllers/       # API controllers
│   ├── routes/           # API routes
│   ├── utils/            # Backend utilities
│   └── data/             # Data storage
└── results/              # Backtesting results
```

## 🔧 API Endpoints

- `GET /api/phasemonitor` - Get market phase data
- `GET /api/tradeideas` - Get AI-generated trade ideas  
- `GET /api/gptthesis?symbol=<symbol>` - Get AI insights for specific asset

## 🎯 Use Cases

- **Day Trading:** Real-time market phase monitoring
- **Swing Trading:** Multi-timeframe analysis and trade ideas
- **Research:** AI-powered market insights and thesis generation
- **Backtesting:** Export data for strategy validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is for educational and research purposes only. Trading involves substantial risk of loss and is not suitable for all investors. Past performance does not guarantee future results.

---

**Built with ❤️ for the trading community** 