# DCAport API Documentation

## Overview
DCAport provides RESTful APIs for managing financial data, portfolios, and transactions.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All API endpoints require authentication using NextAuth.js session.

## Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signup` - Sign up user
- `GET /api/auth/session` - Get current session

### Transactions
- `GET /api/transactions` - Get all transactions (paginated)
  - Query params: `page`, `pageSize`
  - Response: `{ items: Transaction[], total: number, page: number, pageSize: number, totalPages: number }`
- `POST /api/transactions` - Create new transaction
- `PATCH /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Portfolios
- `GET /api/portfolio` - Get all portfolios
- `POST /api/portfolio` - Create new portfolio
- `DELETE /api/portfolio/[id]` - Delete portfolio
- `POST /api/portfolio/refresh` - Refresh portfolio prices

### Trades
- `GET /api/trades` - Get all trades
- `POST /api/trades` - Create new trade
- `PATCH /api/trades/[id]` - Update trade
- `DELETE /api/trades/[id]` - Delete trade

### DCA Allocation
- `GET /api/dca` - Get DCA allocation settings
- `POST /api/dca` - Update DCA allocation

### Goals (Priority 3)
- `GET /api/goals` - Get all investment goals
- `POST /api/goals` - Create new goal
- `PATCH /api/goals/[id]` - Update goal
- `DELETE /api/goals/[id]` - Delete goal

### Slip Upload
- `POST /api/slip` - Upload and process trading slip

## Data Models

### Transaction
```typescript
interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: string
  category: string
  note?: string
  date: string
  createdAt: string
}
```

### Portfolio
```typescript
interface Portfolio {
  id: string
  name: string
  symbol: string
  currentPrice: string
  createdAt: string
}
```

### Trade
```typescript
interface Trade {
  id: string
  portfolioId: string
  quantity: string
  price: string
  amount: string
  date: string
  createdAt: string
}
```

### Goal
```typescript
interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: 'RETIREMENT' | 'HOUSE' | 'EDUCATION' | 'TRAVEL' | 'OTHER'
  createdAt: string
}
```

## Error Handling
All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

Error responses include:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Rate Limiting
API endpoints are rate-limited to prevent abuse:
- 100 requests per minute per user
- 1000 requests per hour per user

## Examples

### Get Transactions
```bash
curl -X GET "http://localhost:3000/api/transactions?page=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Transaction
```bash
curl -X POST "http://localhost:3000/api/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "INCOME",
    "amount": "50000",
    "category": "เงินเดือน",
    "note": "เงินเดือนเดือนเมษายน",
    "date": "2024-04-02"
  }'
```

### Create Portfolio
```bash
curl -X POST "http://localhost:3000/api/portfolio" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Schwab U.S. Large-Cap Growth ETF",
    "symbol": "SCHG",
    "currentPrice": "52.30"
  }'
```

## SDK Examples

### JavaScript/TypeScript
```typescript
// Get transactions
const response = await fetch('/api/transactions?page=1&pageSize=20')
const data = await response.json()

// Create transaction
const newTransaction = await fetch('/api/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'INCOME',
    amount: '50000',
    category: 'เงินเดือน',
    date: '2024-04-02'
  })
})
```

### Python
```python
import requests

# Get transactions
response = requests.get('http://localhost:3000/api/transactions', headers={
    'Authorization': 'Bearer YOUR_TOKEN'
})
data = response.json()

# Create transaction
new_transaction = requests.post('http://localhost:3000/api/transactions', 
    json={
        'type': 'INCOME',
        'amount': '50000',
        'category': 'เงินเดือน',
        'date': '2024-04-02'
    },
    headers={'Authorization': 'Bearer YOUR_TOKEN'}
)
```

## WebSocket Support (Future)
Real-time updates for portfolio prices and transactions will be available via WebSocket connections.

```typescript
const ws = new WebSocket('ws://localhost:3000/api/ws')
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // Handle real-time updates
}
```

## Development
Run the development server:
```bash
npm run dev
```

API will be available at `http://localhost:3000/api`

## Testing
Run tests:
```bash
npm run test
```

API tests are located in `tests/api/` directory.
