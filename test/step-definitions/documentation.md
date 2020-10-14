# Quirks of Cucumber

## Background
Backgrounds don't seem to be working.

For example: 

```
Background:
  Given pisp-demo-server server
  
Scenario: Health Check
  When I get 'Health Check' response
  Then The status should be 'OK'
```

should be equivalent to:

```  
Scenario: Health Check
  Given pisp-demo-server server
  When I get 'Health Check' response
  Then The status should be 'OK'
```

But it is not working properly.

## Parameter Substitution for Scenario Outline Titles

For Scenario Outlines, if the title of your scenario outline begins with a parameter, when the title of the test is printed, the parameters are not subsituted in properly.

For the title,
```
<OperationId> returns a 200 response
```
The printed title will be,
"<OperationId> returns a 200 response"

However, if you don't begin your title with a parameter, then the parameter will subsitute properly.

```Endpoint for <OperationId> returns a 200 response```

will print with the correct values substituted in:

```Endpoint for putConsentsById returns a 200 response```