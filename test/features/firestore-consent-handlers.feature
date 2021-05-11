Feature: Firestore Consent Handlers

Scenario: Create Consent With Existing Status
  Given pisp-demo-server
  When I create a Consent with an existing status
  Then the server should do nothing

Scenario: Create New Consent
  Given pisp-demo-server
  When a new Consent is created
  Then the server should assign a consentRequestId and a new status in the consent repository

Scenario Outline: Update Consent With <Status> Status
  Given pisp-demo-server
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