Feature: Firestore Transaction Handlers

Scenario: Create Transaction With Existing Status
  Given pisp-demo-server
  When the Transaction that has been created has an existing status
  Then the server should do nothing

Scenario: Create New Transaction
  Given pisp-demo-server
  When a new Transaction is created
  Then the server should assign a transactionRequestId and a new status in the transaction repository

Scenario Outline: Update Transaction With <Status> Status
  Given pisp-demo-server
  When the Transaction that has been updated has <Status> status
  Then the server should <Action> on Mojaloop
  
  Examples: 
    | Status                     | Action                      | 
    | undefined                  | log an error                | 
    | PENDING_PARTY_LOOKUP       | initiate party lookup       | 
    | PENDING_PAYEE_CONFIRMATION | initiate payee confirmation | 
    | AUTHORIZATION_REQUIRED     | initiate authorization      |   
