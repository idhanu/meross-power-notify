# ledger-as-a-service-hackeroo
A highly available, globally deployed ledger service built for the Hackathon 4

# Installation
Need the following installed:
 - python3.11 (`brew install python@3.11`) (this is for Sceptre)

# Getting started
```
npm i
```
## Running development mode
```
npm run dev
```

## Lint

```
npm run lint
```
## Build

```
npm run build
```
## Useful commands

### Run dynamodb-admin
```
make dynamodb-admin
```
## Testing
Endpoint:
```
POST http://localhost:3000/transaction 
```
JSON Payload:
```json
{
    "accountId": "org:123123:postpaid",
    "amount": 40,
    "description": "Deposit",
    "reference": "DFDF",
    "limit": -110
}
```