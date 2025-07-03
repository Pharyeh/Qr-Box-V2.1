# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 2.1.x   | :white_check_mark: |
| < 2.1   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** create a public GitHub issue
Security vulnerabilities should be reported privately to prevent potential exploitation.

### 2. **Email us directly**
Send an email to [pharyehnation@gmail.com] with the following information:
- **Subject:** `[SECURITY] QR Box Demo Vulnerability Report`
- **Description:** Detailed description of the vulnerability
- **Steps to reproduce:** Clear steps to reproduce the issue
- **Impact:** Potential impact of the vulnerability
- **Suggested fix:** If you have any suggestions for fixing the issue

### 3. **What happens next**
- We will acknowledge receipt within 48 hours
- We will investigate and provide updates
- We will work on a fix and release timeline
- We will credit you in the security advisory (if you wish)

### 4. **Public disclosure**
Once the vulnerability is fixed, we will:
- Release a security patch
- Create a security advisory on GitHub
- Update the changelog
- Notify users through appropriate channels

## Security Best Practices

When using QR Box Demo:

1. **Keep your API keys secure**
   - Never commit API keys to version control
   - Use environment variables for all sensitive data
   - Rotate API keys regularly

2. **Update regularly**
   - Keep the application updated to the latest version
   - Monitor for security advisories

3. **Network security**
   - Use HTTPS in production
   - Implement proper CORS policies
   - Validate all user inputs

4. **Data protection**
   - Encrypt sensitive data at rest
   - Implement proper access controls
   - Follow data retention policies

## Security Features

QR Box Demo includes several security features:

- **Input validation** on all API endpoints
- **Rate limiting** to prevent abuse
- **CORS protection** for cross-origin requests
- **Environment variable** management for secrets
- **No sensitive data** stored in the codebase

## Responsible Disclosure

We appreciate security researchers who:
- Report vulnerabilities privately
- Give us reasonable time to fix issues
- Work with us to coordinate disclosure
- Follow responsible disclosure practices

Thank you for helping keep QR Box Demo secure! 🔒 
