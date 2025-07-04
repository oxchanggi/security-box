# Security Box

## Overview

Security Box is a secure private key management service built with NestJS that provides wallet operations for multiple blockchain networks, including Ethereum, Solana, Cosmos, and zkSync. It offers a comprehensive API for creating, importing, and managing crypto wallets while ensuring the secure storage of private keys.

## Key Features

- **Secure Private Key Management**: Encrypted storage and retrieval of private keys
- **Two-Factor Authentication**: Authenticator integration for secure access
- **Multi-Chain Support**: 
  - Ethereum and EVM-compatible chains
  - Solana 
  - Cosmos-based chains
  - zkSync Lite

## Core Functionality

- Create and import wallets across different blockchain networks
- Securely store and retrieve private keys using encryption
- Sign transactions and messages for different blockchain protocols
- Two-factor authentication (2FA) for accessing sensitive operations
- Support for zkSync Lite specific operations like account activation

## API Endpoints

The service provides RESTful API endpoints for:

- User management
- Wallet creation and import
- Transaction signing
- Message signing
- Authenticator verification

## Security Features

- Private keys are encrypted at rest
- Authentication required for sensitive operations
- Two-factor authentication support
- Environment-based security controls

## Technologies

- NestJS framework
- TypeORM for database operations
- Multiple blockchain SDKs (Ethereum, Solana, Cosmos, zkSync)
- Docker for containerization

## Getting Started

See the documentation for setup and configuration instructions.
