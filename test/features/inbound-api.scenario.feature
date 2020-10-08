Feature: pisp-demo-server server

Scenario Outline: Endpoints return 200 or 202
  Given pisp-demo-server server
  When I sent a <operationId> request
  Then I get a <statusCode> response

  Examples:
    |                operationId  | statusCode |
    |     putConsentRequestsById  |        200 |
    |            putConsentsById  |        200 |
    |            putParticipants  |        200 |
    |       putParticipantsError  |        200 |
    |      putPartiesByTypeAndId  |        200 |
    | putPartiesByTypeAndIdError  |        200 |
    |               postConsents  |        202 |
    |           putTransfersById  |        200 |
    |             authorizations  |        200 |