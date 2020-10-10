Feature: Firestore Transaction Handlers

Background: 
  Given pisp-demo-server

Scenario: Create Transaction
  When I create a new Transaction
  Then a transaction request id and the status should be assigned

Scenario: Create Transaction With Defined Status
  When I create a Transaction with a existing status
  Then do nothing

Scenario Outline: Update Transaction With <Status> Status
  When the Transaction that has been updated has <Status> status
  Then the server should <Action> on Mojaloop
  
  Examples: 
    | Status                     | Action                      | 
    | undefined                  | log an error                | 
    | PENDING_PARTY_LOOKUP       | initiate party lookup       | 
    | PENDING_PAYEE_CONFIRMATION | initiate payee confirmation | 
    | AUTHORIZATION_REQUIRED     | initiate authorization      |   
