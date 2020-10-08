Feature: Mojaloop API

Scenario Outline: <OperationId> endpoint returns <StatusCode>
  Given pisp-demo-server
  When I sent a <OperationId> request
  Then I should get a <StatusCode> response

  Examples: 
    | OperationId                | StatusCode | 
    | putConsentRequestsById     | 200        | 
    | putConsentsById            | 200        | 
    | putParticipants            | 200        | 
    | putParticipantsError       | 200        | 
    | putPartiesByTypeAndId      | 200        | 
    | putPartiesByTypeAndIdError | 200        | 
    | postConsents               | 202        | 
    | putTransfersById           | 200        | 
    | authorizations             | 202        | 