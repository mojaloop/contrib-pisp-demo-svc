Feature: pisp-demo-server server

Scenario: Create Consent
  Given pisp-demo-server server
  When I create a new Consent
  Then the status should be updated and a request id should be assigned

Scenario: Create Consent With Defined Status
  Given pisp-demo-server server
  When I create a Consent with a defined status
  Then nothing should happen

Scenario: Update Consent With No Status
  Given pisp-demo-server server
  When the Consent that has been updated has no status
  Then the server should log an error

Scenario: Update Consent Pending Party Lookup
  Given pisp-demo-server server
  When the Consent is pending party lookup
  Then the server should initiate party lookup on Mojaloop

Scenario: Update Consent Pending Party Confirmation
  Given pisp-demo-server server
  When the Consent is pending party confirmation
  Then the server should initiate consent request on Mojaloop

Scenario: Update Consent Requiring Authentication
  Given pisp-demo-server server
  When the Consent is requiring authentication
  Then the server should initiate authentication on Mojaloop

Scenario: Update Granted Consent
  Given pisp-demo-server server
  When the Consent is granted after authentication has occurred
  Then the server should initiate challenge generation on Mojaloop
  
Scenario: Update Active Consent
  Given pisp-demo-server server
  When the Consent is active
  Then the server should handle the signed challenge on Mojaloop

Scenario: Update Consent With Revoke Requested
  Given pisp-demo-server server
  When the Consent revocation is requested
  Then the server should initiate a revocation of that consent on Mojaloop