# FinGuard Database Setup

## MongoDB Setup

### 1. Install MongoDB (if not installed)
Download from: https://www.mongodb.com/try/download/community

### 2. Start MongoDB Service
```bash
# Windows
net start MongoDB

# Or start mongod manually
mongod --dbpath C:\data\db
```

### 3. Initialize the Database
```bash
mongosh financeapp < init.js
```

### 4. Verify Setup
```bash
mongosh
use financeapp
show collections
# Should show: users, transactions, loans, alerts, budgets
```

## Connection String
```
mongodb://localhost:27017/financeapp
```

## Collections Schema
| Collection   | Purpose                          | Key Indexes                        |
|-------------|----------------------------------|------------------------------------|
| users       | User profiles & bank accounts    | email, userId                      |
| transactions| All financial transactions        | userId+date, userId+category       |
| loans       | Loan & EMI records               | userId+status, loanId              |
| alerts      | AI-generated financial alerts    | userId+isRead+createdAt            |
| budgets     | Monthly budget allocations       | userId+year+month (unique)         |
