// MongoDB Database Initialization Script
// Run: mongosh financeapp < init.js

db = db.getSiblingDB('financeapp');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'name', 'email', 'password'],
      properties: {
        userId: { bsonType: 'string', description: 'Unique user ID' },
        name: { bsonType: 'string', minLength: 2 },
        email: { bsonType: 'string', pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
        password: { bsonType: 'string', minLength: 6 }
      }
    }
  }
});

db.createCollection('transactions');
db.createCollection('loans');
db.createCollection('alerts');
db.createCollection('budgets');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ userId: 1 }, { unique: true });

db.transactions.createIndex({ userId: 1, transactionDate: -1 });
db.transactions.createIndex({ userId: 1, category: 1 });
db.transactions.createIndex({ transactionId: 1 }, { unique: true });

db.loans.createIndex({ userId: 1, status: 1 });
db.loans.createIndex({ loanId: 1 }, { unique: true });

db.alerts.createIndex({ userId: 1, isRead: 1, createdAt: -1 });
db.alerts.createIndex({ alertId: 1 }, { unique: true });

db.budgets.createIndex({ userId: 1, year: 1, month: 1 }, { unique: true });

print('✅ FinGuard database initialized successfully!');
print('Collections created: users, transactions, loans, alerts, budgets');
print('Indexes applied for optimal query performance.');
