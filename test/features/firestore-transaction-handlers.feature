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


Scenario: Update Transaction With No Status

Scenario: Update Transaction Pending Party Lookup
  When the Transaction that has been updated is pending party lookup
  Then initiate party lookup on Mojaloop

Scenario: Update Transaction Pending Payee Confirmation
  When the Transaction that has been updated is pending payee confirmation
  Then initiate a post transactions request

Scenario: Update Transaction Pending Authorization
  When the Transaction that has been updated is pending authorization
  Then initiate authorization request on Mojaloop