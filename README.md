# 🏦 Synthetic Bank Data API

A Node.js + Express.js API that generates **realistic Indian banking data** including accounts, balances, transactions, and summaries.  
This API can simulate personal banking datasets for **testing, prototyping, or financial apps** without exposing real banking information.  

✨ Deployed at:  
👉 [https://synthetic-bank-data.onrender.com](https://synthetic-bank-data.onrender.com)

---

## 📌 Features

- 🔹 **Synthetic Account Data** (Savings, Current, Salary accounts with IFSC codes, branch codes, etc.)  
- 🔹 **Synthetic Transactions** (credits, debits, UPI, NEFT, shopping, bills, dining, etc.)  
- 🔹 **Google Gemini AI Integration** for realistic personal and transaction details (with fallback when no API key provided).  
- 🔹 **Filtering & Pagination** for transactions.  
- 🔹 **Account Summaries** (debit, credit, net balance, average transactions).  
- 🔹 **On-demand data generation** for new accounts and transactions.  
- 🔹 **Ready-to-use REST API** deployed on Render.

---

## 🚀 Getting Started (Local Setup)

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/synthetic-bank-api.git
   cd synthetic-bank-api
   ```

2. Install dependencies:
  ```bash
  npm install
  ```

3. Create a .env file and add your Gemini API key (optional):
  ```bash
  GEMINI_API_KEY=your_google_gemini_api_key
  PORT=5000
  ```

4. Run the server:
  ```bash
  node index.js
  ```

Or with nodemon:
  ```bash
  npm run dev
  ```

5.API is available at:
  ```bash
  http://localhost:5000
  ```

## 🌐 Live Deployment

https://synthetic-bank-data.onrender.com

## 📊 API Endpoints

### 🔹 Health Check

- GET /health

```json
{
  "success": true,
  "message": "Synthetic Bank API is running",
  "ai_provider": "Fallback Templates",
  "timestamp": "2025-08-20T18:35:12.140Z",
  "data": {
    "accounts": 3,
    "transactions": 122
  }
}
```
### 🔹 Accounts
- Get all accounts
```GET /api/accounts```

- Get specific account
```GET /api/accounts/:accountId```

- Get account balance
```GET /api/accounts/:accountId/balance```

- Get account transactions (with filters)
```GET /api/accounts/:accountId/transactions?limit=10&offset=0&type=debit&category=Food&status=completed```

- Get account summary
```GET /api/accounts/:accountId/summary```


```Response

{
  "success": true,
  "data": {
    "account": {
      "id": "ae3b-45f6-9ac0",
      "type": "Savings",
      "balance": 23450.75,
      "availableBalance": 23200.10
    },
    "statistics": {
      "totalTransactions": 42,
      "totalDebit": 11800.50,
      "totalCredit": 13250.25,
      "netAmount": 1450,
      "last30DaysTransactions": 15,
      "avgTransactionAmount": 560.45
    }
  }
}

```

### 🔹 Transactions
- Get all transactions
```GET /api/transactions?accountId=123&type=credit&limit=20&offset=0&startDate=2025-01-01&endDate=2025-01-31```

- Get specific transaction
```GET /api/transactions/:transactionId```

- Create a new transaction
```POST /api/accounts/:accountId/transactions```


```Request Body

{
  "type": "debit",
  "amount": 500,
  "category": "Food & Dining",
  "description": "Swiggy Order"
}

```

### 🔹Generate Synthetic Data

- Generate new accounts & transactions
```POST /api/generate-data```


```Request Body

{
  "accountCount": 2,
  "transactionsPerAccount": 10
}
```

```Response

{
  "success": true,
  "message": "Indian bank data generated using high-quality fallback templates",
  "ai_provider": "fallback_mode",
  "generated": {
    "accounts": 2,
    "transactions": 20
  },
  "samples": {
    "accountHolders": ["Rahul Sharma", "Priya Patel"],
    "banks": ["HDFC Bank", "ICICI Bank"],
    "sampleTransactions": [
      { "description": "Dominos Pizza", "category": "Food & Dining", "amount": 450.25, "type": "debit" }
    ]
  }
}

```

---

## 📬 Postman Collection (Quick Test)

Here’s a quick-access table of all endpoints. You can copy-paste these URLs directly into **Postman** (or cURL).

| Endpoint | Method | Description | Example URL |
|----------|--------|-------------|-------------|
| `/health` | GET | Health check | [https://synthetic-bank-data.onrender.com/health](https://synthetic-bank-data.onrender.com/health) |
| `/api/accounts` | GET | Get all accounts | [https://synthetic-bank-data.onrender.com/api/accounts](https://synthetic-bank-data.onrender.com/api/accounts) |
| `/api/accounts/:accountId` | GET | Get specific account | `https://synthetic-bank-data.onrender.com/api/accounts/12345` |
| `/api/accounts/:accountId/balance` | GET | Get account balance | `https://synthetic-bank-data.onrender.com/api/accounts/12345/balance` |
| `/api/accounts/:accountId/transactions` | GET | Get transactions (filters: `limit`, `type`, `category`, `status`) | `https://synthetic-bank-data.onrender.com/api/accounts/12345/transactions?limit=10&type=debit` |
| `/api/accounts/:accountId/summary` | GET | Get account summary | `https://synthetic-bank-data.onrender.com/api/accounts/12345/summary` |
| `/api/transactions` | GET | Get all transactions (filters: `accountId`, `type`, `startDate`, `endDate`) | `https://synthetic-bank-data.onrender.com/api/transactions?accountId=12345&type=credit` |
| `/api/transactions/:transactionId` | GET | Get specific transaction | `https://synthetic-bank-data.onrender.com/api/transactions/txn_6789` |
| `/api/accounts/:accountId/transactions` | POST | Create new transaction | `https://synthetic-bank-data.onrender.com/api/accounts/12345/transactions` |
| `/api/generate-data` | POST | Generate new synthetic accounts & transactions | `https://synthetic-bank-data.onrender.com/api/generate-data` |

---

### 📌 Example cURL (Create Transaction)

```bash
curl -X POST https://synthetic-bank-data.onrender.com/api/accounts/12345/transactions \
-H "Content-Type: application/json" \
-d '{
  "type": "debit",
  "amount": 500,
  "category": "Food & Dining",
  "description": "Swiggy Order"
}'


📌 Example Usage (JavaScript)

```javascript
// Example: Fetch account balance using fetch API
const fetchAccountBalance = async (accountId) => {
  const res = await fetch(`https://synthetic-bank-data.onrender.com/api/accounts/${accountId}/balance`);
  const data = await res.json();
  console.log(data);
};

fetchAccountBalance("your-account-id");
```


## 🛠️ Tech Stack

  - Backend: Node.js, Express.js

  - AI Integration: Google Gemini (Generative AI)

  - Utilities: UUID, CORS, dotenv

  - Deployment: Render

## 📌 Roadmap

  ✅ Deploy API (Render)

  🔲 Add authentication (JWT) for restricted routes

  🔲 Add MongoDB/PostgreSQL persistence instead of in-memory storage

  🔲 Expand categories & merchants with regional diversity

  🔲 Create a Swagger / Postman collection for easy API testing

## 🤝 Contributing

  - Pull requests are welcome! For major changes, open an issue first to discuss your idea.

## 📜 License

  - MIT License © 2025

