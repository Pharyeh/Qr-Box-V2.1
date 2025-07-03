# Contributing to QR Box Demo

Thank you for your interest in contributing to QR Box Demo! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/pharyeh/Qr-Box-V2.1.git
   cd qr-box-demo
   ```
3. **Set up the development environment**:
   ```bash
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Guidelines

### Code Style
- Use **TypeScript** for both frontend and backend
- Follow **ESLint** rules (if configured)
- Use **Prettier** for code formatting
- Write **descriptive commit messages**

### Project Structure
```
qr-box-demo/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── panels/         # Dashboard panels
│   │   ├── api/           # API integration
│   │   └── utils/         # Frontend utilities
├── server/                # Express backend
│   ├── controllers/       # API controllers
│   ├── routes/           # API routes
│   ├── utils/            # Backend utilities
│   └── data/             # Data storage
```

### Testing
- Test your changes thoroughly
- Ensure the app runs without errors
- Test both development and production builds

## 📝 Making Changes

1. **Make your changes** in your feature branch
2. **Test your changes**:
   ```bash
   npm run dev  # Test development mode
   npm run build-client  # Test build process
   ```
3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```
4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

## 🔄 Submitting Changes

1. **Create a Pull Request** on GitHub
2. **Fill out the PR template** with:
   - Description of changes
   - Screenshots (if UI changes)
   - Testing steps
3. **Wait for review** from maintainers

## 🎯 Areas for Contribution

### Frontend (React/TypeScript)
- UI/UX improvements
- New dashboard panels
- Component enhancements
- Performance optimizations

### Backend (Node.js/Express)
- API endpoint improvements
- Data processing enhancements
- Error handling
- Performance optimizations

### Documentation
- README improvements
- Code comments
- API documentation
- Tutorial guides

### Testing
- Unit tests
- Integration tests
- E2E tests
- Performance testing

## 🐛 Reporting Issues

When reporting issues, please include:
- **Clear description** of the problem
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Environment details** (OS, Node version, etc.)
- **Screenshots** (if applicable)

## 📋 Commit Message Format

Use conventional commit format:
```
type(scope): description

feat(api): add new endpoint for market data
fix(ui): resolve layout issue in dashboard
docs(readme): update installation instructions
style(components): format code with prettier
refactor(utils): simplify data processing logic
test(api): add unit tests for new endpoint
```

## 🤝 Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the project's coding standards

## 📞 Getting Help

- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check the README and code comments

Thank you for contributing to QR Box Demo! 🎉 
