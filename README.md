# License Key Manager CLI

A command-line application for generating and verifying secure license keys.

## Features

- Generate license keys based on domain name and expiration date
- Verify license keys with checksum validation
- Hardware ID binding for additional security
- Domain format and date validation

## Installation

```bash
npm install
```

## Usage

### Generate License Key

```bash
npm run generate -- -d example.com -e 2025-12-31
```

Parameters:
- `-d, --domain`: Domain name
- `-e, --expire`: Expiration date (YYYY-MM-DD format)

### Verify License Key

```bash
npm run verify -- -k <license_key>
```

Parameters:
- `-k, --key`: License key to verify

### Quick Test Commands

Generate test license key:
```bash
npm run test:generate
```

Verify a license key:
```bash
npm run test:verify -- -k <license_key>
```

## License Key Format

The license key consists of three parts separated by dots:
1. Salt (16 byte hex)
2. Hash (SHA-256)
3. Checksum (8 character MD5)

Example:
```
a1b2c3d4e5f6g7h8.abcdef1234567890.12345678
```

## Security Features

- Strong cryptography (SHA-256, MD5)
- Hardware binding
- Checksum validation
- Random salt for each key
- Domain validation
- Date validation and expiration check

## Tech Stack

- Node.js
- Commander.js for CLI interface
- node-machine-id for hardware binding
- Native crypto module for encryption

## License

ISC © 2025 A3ST1CODE. All rights reserved.