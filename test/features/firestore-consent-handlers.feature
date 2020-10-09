Feature: Firestore Consent Handlers

Background:
  Given pisp-demo-server

Scenario: Create Consent
  When I create a new Consent
  Then the status should be updated and a request id should be assigned

Scenario: Create Consent With Defined Status
  When I create a Consent with a defined status
  Then nothing should happen

Scenario Outline: Update Consent With <Status> Status
  When the Consent that has been updated has <Status> status
  Then the server should <Action> on Mojaloop
  
  Examples: 
    | Status                     | Action                          | 
    | undefined                  | log an error                    | 
    | PENDING_PARTY_LOOKUP       | initiate party lookup           | 
    | PENDING_PARTY_CONFIRMATION | initiate consent request        | 
    | AUTHENTICATION_REQUIRED    | initiate authentication         | 
    | CONSENT_GRANTED            | initiate challenge generation   | 
    | ACTIVE                     | handle signed challenge         | 
    | REVOKE_REQUESTED           | initiate revocation for consent | 