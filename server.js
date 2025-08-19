const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Check if API key is available
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
  console.warn('⚠️  API will use fallback data generation');
  console.warn('⚠️  To use Gemini AI, set GEMINI_API_KEY in your .env file');
}

// Initialize Google Gemini (only if API key is available)
let gemini = null;
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    gemini = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }); // Using Gemini 2.0 Flash (latest available)
    console.log('✅ Google Gemini AI initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Gemini API:', error.message);
    gemini = null;
    genAI = null;
  }
} else {
  console.log('📝 Using fallback data generation (no API key provided)');
}

// Indian bank data
const indianBanks = [
  { name: 'State Bank of India', code: 'SBI', ifsc: 'SBIN' },
  { name: 'HDFC Bank', code: 'HDFC', ifsc: 'HDFC' },
  { name: 'ICICI Bank', code: 'ICICI', ifsc: 'ICIC' },
  { name: 'Punjab National Bank', code: 'PNB', ifsc: 'PUNB' },
  { name: 'Bank of Baroda', code: 'BOB', ifsc: 'BARB' },
  { name: 'Canara Bank', code: 'CNB', ifsc: 'CNRB' },
  { name: 'Union Bank of India', code: 'UBI', ifsc: 'UBIN' },
  { name: 'Bank of India', code: 'BOI', ifsc: 'BKID' },
  { name: 'Indian Bank', code: 'IB', ifsc: 'IDIB' },
  { name: 'Central Bank of India', code: 'CBI', ifsc: 'CBIN' },
  { name: 'Axis Bank', code: 'AXIS', ifsc: 'UTIB' },
  { name: 'Kotak Mahindra Bank', code: 'KMB', ifsc: 'KKBK' },
  { name: 'IndusInd Bank', code: 'IIB', ifsc: 'INDB' },
  { name: 'Yes Bank', code: 'YES', ifsc: 'YESB' },
  { name: 'IDFC FIRST Bank', code: 'IDFC', ifsc: 'IDFB' }
];

// Indian cities for branch codes
const indianCities = [
  'MUM', 'DEL', 'BLR', 'HYD', 'CHN', 'KOL', 'PUN', 'AHM', 'SUR', 'VIS',
  'KAN', 'NAG', 'IND', 'THA', 'BHO', 'COI', 'LUD', 'AGR', 'MER', 'RJK',
  'JAI', 'JOD', 'KOT', 'AMD', 'VAD', 'RJT', 'BHV', 'UJN', 'GWL', 'JAB'
];

// Middleware
app.use(cors());
app.use(express.json());

// Sample data generators
const generateRandomAmount = (min = 10, max = 5000) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

const generateRandomDate = (daysBack = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
};

const transactionCategories = [
  'Food & Dining', 'Groceries', 'Transportation', 'Bills & Utilities',
  'Entertainment', 'Healthcare', 'Travel', 'Education', 'Shopping',
  'Fuel & Gas', 'Mobile Recharge', 'DTH/Cable', 'Insurance Premium',
  'Mutual Fund SIP', 'Fixed Deposit', 'Gold Purchase', 'Online Shopping',
  'UPI Payment', 'NEFT Transfer', 'Salary Credit', 'Bonus', 'Dividend',
  'Interest Credit', 'Cash Withdrawal', 'Loan EMI', 'Credit Card Payment',
  'Investment', 'Donation', 'Medical', 'Pharmacy', 'Petrol Pump'
];

// Gemini API-powered data generation functions
async function generateIndianPersonalDetails() {
  // Check if Gemini API is available
  if (!gemini) {
    console.log('🔄 Using fallback personal details generation');
    return generateFallbackPersonalDetails();
  }

  try {
    const prompt = `Generate realistic Indian personal details in JSON format with the following structure:
    {
      "name": "Full name with first and last name",
      "email": "realistic email address", 
      "phone": "+91 followed by 10 digit mobile number",
      "address": {
        "street": "Indian street address",
        "city": "Indian city",
        "state": "Indian state", 
        "pincode": "6 digit pincode"
      }
    }
    
    Use common Indian names from different regions (North, South, East, West India). Make it diverse and realistic. Return only valid JSON, no additional text.`;

    const result = await gemini.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    // Clean up the response to extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0]);
      console.log('✅ Generated personal details using Gemini AI');
      return jsonData;
    }
    
    throw new Error('Invalid JSON response from Gemini');
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    console.log('🔄 Falling back to static data generation');
    return generateFallbackPersonalDetails();
  }
}

async function generateIndianTransactionDescription(category, type) {
  // Check if Gemini API is available
  if (!gemini) {
    return getFallbackTransactionDescription(category, type);
  }

  try {
    const prompt = `Generate a realistic Indian transaction description for:
    Category: ${category}
    Type: ${type}
    
    Make it sound like a real Indian merchant/service. Use real Indian business names, services, or generic descriptions that Indians would recognize. Be specific and authentic.
    
    Examples:
    - For Food: "Domino's Pizza", "Haldiram's", "McDonald's India", "Local Restaurant"
    - For Groceries: "Big Bazaar", "Reliance Fresh", "Spencer's", "DMart"
    - For Transport: "Ola Cab", "Uber India", "BEST Bus Pass", "Metro Card Recharge"
    - For Bills: "MSEB Bill Payment", "Airtel Mobile", "Jio Recharge", "BSES Electricity"
    
    Return only the merchant/description name, no quotes or extra text.`;

    const result = await gemini.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim().replace(/"/g, '');
    
    console.log(`✅ Generated transaction: ${content}`);
    return content;
  } catch (error) {
    console.error('❌ Gemini API error for transaction:', error.message);
    return getFallbackTransactionDescription(category, type);
  }
}

// Fallback functions when Gemini is unavailable
function generateFallbackPersonalDetails() {
  const firstNames = [
    'Rahul', 'Priya', 'Amit', 'Sneha', 'Rajesh', 'Kavya', 'Suresh', 'Meera',
    'Vikram', 'Anita', 'Arjun', 'Divya', 'Karan', 'Pooja', 'Ravi', 'Nisha',
    'Arun', 'Shreya', 'Manoj', 'Rekha', 'Deepak', 'Sunita', 'Rohit', 'Asha'
  ];
  
  const lastNames = [
    'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Mehta', 'Shah',
    'Verma', 'Jain', 'Bansal', 'Sinha', 'Malhotra', 'Chopra', 'Kapoor', 'Joshi',
    'Reddy', 'Rao', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Das', 'Bose'
  ];
  
  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
    'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore'
  ];
  
  const states = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal',
    'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh'
  ];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  
  return {
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
    phone: `+91 ${Math.random().toString().slice(2, 7)}-${Math.random().toString().slice(2, 7)}`,
    address: {
      street: `${Math.floor(Math.random() * 999) + 1}, ${lastName} Colony`,
      city: city,
      state: state,
      pincode: `${Math.floor(Math.random() * 900000) + 100000}`
    }
  };
}

function getFallbackTransactionDescription(category, type) {
  const descriptions = {
    'Food & Dining': ['Dominos Pizza', 'McDonalds India', 'Zomato Order', 'Swiggy Delivery', 'Haldiram\'s', 'CCD'],
    'Groceries': ['DMart', 'Big Bazaar', 'Reliance Fresh', 'Spencer\'s', 'More Supermarket', 'Nature\'s Basket'],
    'Transportation': ['Ola Cab', 'Uber India', 'BEST Bus Pass', 'Metro Card', 'IRCTC Booking', 'Rapido Bike'],
    'Bills & Utilities': ['Airtel Mobile', 'Jio Recharge', 'MSEB Bill', 'BSES Electricity', 'Mahanagar Gas', 'VI Recharge'],
    'Mobile Recharge': ['Airtel Recharge', 'Jio Top Up', 'VI Mobile', 'BSNL Recharge', 'Idea Payment'],
    'Entertainment': ['BookMyShow', 'Netflix India', 'Amazon Prime', 'Hotstar', 'Zee5', 'SonyLIV'],
    'Shopping': ['Amazon India', 'Flipkart', 'Myntra', 'Ajio', 'Nykaa', 'Snapdeal'],
    'Healthcare': ['Apollo Pharmacy', 'Medplus', '1mg Order', 'Practo Consult', 'PharmEasy'],
    'Fuel & Gas': ['Indian Oil Petrol', 'HP Gas', 'Bharat Petroleum', 'Shell India', 'Indane Gas']
  };
  
  const categoryDescriptions = descriptions[category] || ['General Payment', 'Service Payment'];
  return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
}

const generateTransaction = async (accountId, forceType = null) => {
  const isCredit = forceType === 'credit' || (forceType !== 'debit' && Math.random() > 0.7);
  const amount = generateRandomAmount(5, isCredit ? 3000 : 1500);
  const category = transactionCategories[Math.floor(Math.random() * transactionCategories.length)];
  
  // Generate realistic description using Gemini
  const description = await generateIndianTransactionDescription(category, isCredit ? 'credit' : 'debit');
  
  return {
    id: uuidv4(),
    accountId: accountId,
    type: isCredit ? 'credit' : 'debit',
    amount: amount,
    description: description,
    category: category,
    date: generateRandomDate(60),
    status: Math.random() > 0.1 ? 'completed' : 'pending',
    reference: `UPI${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    balance_after: null // Will be calculated
  };
};

const generateAccount = async () => {
  const accountTypes = ['Savings', 'Current', 'Salary'];
  const accountType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
  const bank = indianBanks[Math.floor(Math.random() * indianBanks.length)];
  const city = indianCities[Math.floor(Math.random() * indianCities.length)];
  
  // Generate realistic personal details using Gemini
  const personalDetails = await generateIndianPersonalDetails();
  
  return {
    id: uuidv4(),
    accountNumber: `${Math.random().toString().slice(2, 6)}${Math.random().toString().slice(2, 8)}`,
    accountType: accountType,
    bankName: bank.name,
    bankCode: bank.code,
    branchCode: `${bank.ifsc}0${city}${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
    ifscCode: `${bank.ifsc}0${city}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    accountHolder: personalDetails,
    balance: generateRandomAmount(1000, 50000),
    availableBalance: null, // Will be calculated
    currency: 'INR',
    status: 'Active',
    openDate: generateRandomDate(1825), // Up to 5 years ago
    lastUpdated: new Date().toISOString()
  };
};

// In-memory storage (use a database in production)
let accounts = [];
let transactions = [];

// Initialize with sample data
const initializeSampleData = async () => {
  console.log('🔄 Generating initial synthetic data...');
  
  for (let i = 0; i < 3; i++) {
    const account = await generateAccount();
    accounts.push(account);
    
    console.log(`📝 Generated account for ${account.accountHolder.name} at ${account.bankName}`);
    
    // Generate 20-50 transactions per account
    const numTransactions = Math.floor(Math.random() * 30) + 20;
    let runningBalance = account.balance;
    
    for (let j = 0; j < numTransactions; j++) {
      const transaction = await generateTransaction(account.id);
      
      if (transaction.type === 'debit') {
        runningBalance -= transaction.amount;
      } else {
        runningBalance += transaction.amount;
      }
      
      transaction.balance_after = parseFloat(runningBalance.toFixed(2));
      transactions.push(transaction);
      
      // Add small delay to avoid rate limiting when using Gemini API
      if (gemini && j % 3 === 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Update account balance to final balance
    account.balance = parseFloat(runningBalance.toFixed(2));
    account.availableBalance = account.balance - generateRandomAmount(0, 500);
    
    console.log(`💰 Generated ${numTransactions} transactions for ${account.accountHolder.name}`);
  }
  
  // Sort transactions by date (newest first)
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log('✅ Sample data initialization complete!');
};

// Initialize sample data
initializeSampleData();

// Health check endpoint (first to avoid conflicts)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Synthetic Bank API is running',
    ai_provider: gemini ? 'Google Gemini 2.0 Flash' : 'Fallback Templates',
    timestamp: new Date().toISOString(),
    data: {
      accounts: accounts.length,
      transactions: transactions.length
    }
  });
});

// API Routes - Account endpoints
app.get('/api/accounts', (req, res) => {
  res.json({
    success: true,
    data: accounts,
    count: accounts.length
  });
});

app.get('/api/accounts/:accountId', (req, res) => {
  const accountId = req.params.accountId;
  const account = accounts.find(acc => acc.id === accountId);
  
  if (!account) {
    return res.status(404).json({
      success: false,
      error: 'Account not found'
    });
  }
  
  res.json({
    success: true,
    data: account
  });
});

app.get('/api/accounts/:accountId/balance', (req, res) => {
  const accountId = req.params.accountId;
  const account = accounts.find(acc => acc.id === accountId);
  
  if (!account) {
    return res.status(404).json({
      success: false,
      error: 'Account not found'
    });
  }
  
  res.json({
    success: true,
    data: {
      accountId: account.id,
      balance: account.balance,
      availableBalance: account.availableBalance,
      currency: account.currency,
      lastUpdated: account.lastUpdated
    }
  });
});

app.get('/api/accounts/:accountId/transactions', (req, res) => {
  const accountId = req.params.accountId;
  const { limit = 50, offset = 0, type, category, status } = req.query;
  
  let accountTransactions = transactions.filter(t => t.accountId === accountId);
  
  // Apply filters
  if (type) {
    accountTransactions = accountTransactions.filter(t => t.type === type);
  }
  
  if (category) {
    accountTransactions = accountTransactions.filter(t => 
      t.category.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  if (status) {
    accountTransactions = accountTransactions.filter(t => t.status === status);
  }
  
  // Apply pagination
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedTransactions = accountTransactions.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedTransactions,
    pagination: {
      total: accountTransactions.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasNext: endIndex < accountTransactions.length
    }
  });
});

app.get('/api/accounts/:accountId/summary', (req, res) => {
  const accountId = req.params.accountId;
  const account = accounts.find(acc => acc.id === accountId);
  
  if (!account) {
    return res.status(404).json({
      success: false,
      error: 'Account not found'
    });
  }
  
  const accountTransactions = transactions.filter(t => t.accountId === accountId);
  
  const totalDebit = accountTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalCredit = accountTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const last30Days = accountTransactions.filter(t => {
    const transactionDate = new Date(t.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return transactionDate >= thirtyDaysAgo;
  });
  
  res.json({
    success: true,
    data: {
      account: {
        id: account.id,
        type: account.accountType,
        balance: account.balance,
        availableBalance: account.availableBalance
      },
      statistics: {
        totalTransactions: accountTransactions.length,
        totalDebit: parseFloat(totalDebit.toFixed(2)),
        totalCredit: parseFloat(totalCredit.toFixed(2)),
        netAmount: parseFloat((totalCredit - totalDebit).toFixed(2)),
        last30DaysTransactions: last30Days.length,
        avgTransactionAmount: parseFloat((
          accountTransactions.reduce((sum, t) => sum + t.amount, 0) / 
          accountTransactions.length
        ).toFixed(2))
      }
    }
  });
});

// Transaction endpoints
app.get('/api/transactions', (req, res) => {
  const { 
    accountId, 
    type, 
    category, 
    status, 
    limit = 50, 
    offset = 0,
    startDate,
    endDate
  } = req.query;
  
  let filteredTransactions = [...transactions];
  
  // Apply filters
  if (accountId) {
    filteredTransactions = filteredTransactions.filter(t => t.accountId === accountId);
  }
  
  if (type) {
    filteredTransactions = filteredTransactions.filter(t => t.type === type);
  }
  
  if (category) {
    filteredTransactions = filteredTransactions.filter(t => 
      t.category.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  if (status) {
    filteredTransactions = filteredTransactions.filter(t => t.status === status);
  }
  
  if (startDate) {
    filteredTransactions = filteredTransactions.filter(t => 
      new Date(t.date) >= new Date(startDate)
    );
  }
  
  if (endDate) {
    filteredTransactions = filteredTransactions.filter(t => 
      new Date(t.date) <= new Date(endDate)
    );
  }
  
  // Apply pagination
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedTransactions,
    pagination: {
      total: filteredTransactions.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasNext: endIndex < filteredTransactions.length
    }
  });
});

app.get('/api/transactions/:transactionId', (req, res) => {
  const transactionId = req.params.transactionId;
  const transaction = transactions.find(t => t.id === transactionId);
  
  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: 'Transaction not found'
    });
  }
  
  res.json({
    success: true,
    data: transaction
  });
});

// POST endpoints
app.post('/api/accounts/:accountId/transactions', async (req, res) => {
  const accountId = req.params.accountId;
  const account = accounts.find(acc => acc.id === accountId);
  
  if (!account) {
    return res.status(404).json({
      success: false,
      error: 'Account not found'
    });
  }
  
  const { type, amount, description, category } = req.body;
  
  if (!type || !amount) {
    return res.status(400).json({
      success: false,
      error: 'Type and amount are required'
    });
  }
  
  // Generate description using Gemini if not provided
  const finalDescription = description || await generateIndianTransactionDescription(
    category || 'Other', 
    type
  );
  
  const transaction = {
    id: uuidv4(),
    accountId: accountId,
    type: type,
    amount: parseFloat(amount),
    description: finalDescription,
    category: category || 'Other',
    date: new Date().toISOString(),
    status: 'completed',
    reference: `UPI${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    balance_after: type === 'debit' 
      ? account.balance - parseFloat(amount)
      : account.balance + parseFloat(amount)
  };
  
  transactions.unshift(transaction);
  
  // Update account balance
  account.balance = transaction.balance_after;
  account.availableBalance = account.balance - generateRandomAmount(0, 50);
  account.lastUpdated = new Date().toISOString();
  
  res.status(201).json({
    success: true,
    data: transaction
  });
});

app.post('/api/generate-data', async (req, res) => {
  try {
    const { accountCount = 1, transactionsPerAccount = 25 } = req.body;
    
    // Check if we have API access
    const hasApiAccess = !!gemini;
    
    console.log(`🚀 Generating ${accountCount} new accounts with ${transactionsPerAccount} transactions each...`);
    console.log(`📡 AI Provider: ${hasApiAccess ? 'Google Gemini 2.0 Flash' : 'Fallback Templates'}`);
    
    const newAccounts = [];
    const newTransactions = [];
    
    for (let i = 0; i < accountCount; i++) {
      console.log(`📋 Creating account ${i + 1}/${accountCount}...`);
      
      const account = await generateAccount();
      newAccounts.push(account);
      accounts.push(account);
      
      console.log(`✅ Generated account for ${account.accountHolder.name} at ${account.bankName}`);
      
      let runningBalance = account.balance;
      
      for (let j = 0; j < transactionsPerAccount; j++) {
        const transaction = await generateTransaction(account.id);
        
        if (transaction.type === 'debit') {
          runningBalance -= transaction.amount;
        } else {
          runningBalance += transaction.amount;
        }
        
        transaction.balance_after = parseFloat(runningBalance.toFixed(2));
        newTransactions.push(transaction);
        transactions.push(transaction);
        
        // Add delay to respect API rate limits for Gemini
        if (hasApiAccess && j % 3 === 0) {
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      }
      
      account.balance = parseFloat(runningBalance.toFixed(2));
      account.availableBalance = account.balance - generateRandomAmount(0, 100);
      
      console.log(`💰 Generated ${transactionsPerAccount} transactions for ${account.accountHolder.name}`);
    }
    
    // Sort transactions by date
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log('🎉 Data generation completed successfully!');
    
    res.json({
      success: true,
      message: hasApiAccess 
        ? 'Realistic Indian bank data generated successfully using Google Gemini AI'
        : 'Indian bank data generated using high-quality fallback templates',
      ai_provider: hasApiAccess ? 'google_gemini_2_flash' : 'fallback_mode',
      generated: {
        accounts: newAccounts.length,
        transactions: newTransactions.length
      },
      samples: {
        accountHolders: newAccounts.map(acc => acc.accountHolder.name),
        banks: newAccounts.map(acc => acc.bankName),
        sampleTransactions: newTransactions.slice(0, 5).map(txn => ({
          description: txn.description,
          category: txn.category,
          amount: txn.amount,
          type: txn.type
        }))
      }
    });
    
  } catch (error) {
    console.error('Error generating data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate data',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🏦 Synthetic Bank API server is running on port ${PORT}`);
  console.log(`📊 Generated ${accounts.length} accounts with ${transactions.length} transactions`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API Endpoints:`);
  console.log(`   GET  /api/accounts - Get all accounts`);
  console.log(`   GET  /api/accounts/:id - Get specific account`);
  console.log(`   GET  /api/accounts/:id/balance - Get account balance`);
  console.log(`   GET  /api/accounts/:id/transactions - Get account transactions`);
  console.log(`   GET  /api/accounts/:id/summary - Get account summary`);
  console.log(`   GET  /api/transactions - Get all transactions`);
  console.log(`   POST /api/accounts/:id/transactions - Create transaction`);
  console.log(`   POST /api/generate-data - Generate new synthetic data`);
});

module.exports = app;