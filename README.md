# ATM Transaction System Backend

A secure and robust ATM transaction system built with Node.js, Express, and MongoDB. This system provides a complete backend solution for ATM operations including card validation, session management, balance checking, withdrawals, deposits, and transaction history.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, express-rate-limit
- **Validation**: express-validator
- **Logging**: Winston
- **Environment**: dotenv, envalid

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Yarn or npm package manager

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/binayachaudari/tr-assessment-backend.git
cd backend
```

### 2. Install Dependencies

```bash
yarn install
# or
npm install
```

### 3. Environment Setup

Copy the environment example file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=8848

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/atm_demo

# Security
JWT_SECRET=your_super_secret_jwt_key_here

# CORS (Optional)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Seed the Database

Populate the database with demo data:

```bash
yarn seed
# or
npm run seed
```

### 5. Start the Server

**Development mode:**

```bash
yarn dev
# or
npm run dev
```

**Production mode:**

```bash
yarn start
# or
npm start
```

The server will start on `http://localhost:8848`

## 📚 API Documentation

### Base URL

```
http://localhost:8848/api/v1
```

### Authentication

Most endpoints require a valid session token in the Authorization header:

```
Authorization: Bearer <session_token>
```

## Demo Account

For testing purposes, use these demo credentials:

- **Card Number**: `4532123456789012`
- **PIN**: `1234`
- **CVV**: `123`

**Linked Accounts:**

- **Primary (Checking)**: `1234567890123456` - Balance: $5,000.00
- **Savings**: `9876543210987654` - Balance: $15,000.00

## Configuration

### Environment Variables

| Variable          | Description               | Default                 |
| ----------------- | ------------------------- | ----------------------- |
| `MONGODB_URI`     | MongoDB connection string | Required                |
| `JWT_SECRET`      | JWT signing secret        | Required                |
| `ENCRYPTION_KEY`  | 32-byte encryption key    | Required                |
| `PORT`            | Server port               | 8848                    |
| `ALLOWED_ORIGINS` | CORS allowed origins      | `http://localhost:5173` |

### Rate Limiting Configuration

Rate limits can be adjusted in `configs/config.js`:

```javascript
rateLimit: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  generalAPILimit: 100,
  authAPILimit: 5,
  transactionAPILimit: 10,
  cardAPILimit: 20,
  sessionAPILimit: 15,
}
```

## Scripts

| Script       | Description                           |
| ------------ | ------------------------------------- |
| `yarn start` | Start production server               |
| `yarn dev`   | Start development server with nodemon |
| `yarn seed`  | Seed database with demo data          |

## ️ Security Features

### Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Transactions**: 10 per 15 minutes
- **Card Operations**: 20 per 15 minutes
- **Sessions**: 15 per 15 minutes

### Transaction Limits

- **Daily Withdrawal**: $20,000
- **Daily Transactions**: $100,000
- **Per Transaction**: $2,000

### Security Measures

- PIN hashing with bcryptjs
- JWT-based session management
- Card blocking after 3 failed PIN attempts
- Request validation and sanitization
- CORS protection
- Helmet security headers

## Author

**Binaya Chaudhary**

- Email: binayachaudhary@live.com
- GitHub: [@binayachaudari](https://github.com/binayachaudari)
