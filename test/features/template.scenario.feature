Feature: pisp-demo-server server

Scenario: Health Check
  Given pisp-demo-server server
  When I get 'Health Check' response
  Then The status should be 'OK'
