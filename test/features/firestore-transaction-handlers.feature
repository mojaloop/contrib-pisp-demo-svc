Feature: Firestore Transaction Handlers

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
