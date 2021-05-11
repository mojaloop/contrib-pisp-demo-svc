# contrib-pisp-demo-svc

### NodeJS/Firebase backend for the [pisp-demo-ui](https://github.com/mojaloop/contrib-pisp-demo-ui)

## Introduction

This project is the backend for [pisp-demo-ui](https://github.com/mojaloop/contrib-pisp-demo-ui). It uses Firebase Cloud Firestore to store state and communicate with the UI.

**For more information about Mojaloop and PISP with Mojaloop, see:**
- [mojaloop/pisp](https://github.com/mojaloop/pisp)
- [mojaloop/mojaloop](https://github.com/mojaloop/mojaloop)
- [mojaloop.io](https://mojaloop.io/)


## Setup

The following steps should allow you to perform a mocked out end-to-end transfer (between pisp-demo-server and pisp-demo-app).

1. Firebase SDK Admin Key

Follow the instructions outlined [here](https://firebase.google.com/docs/admin/setup) to obtain a JSON file containing your secret key.
Rename it to be `serviceAccountKey.json` and put it in `{project-directory}/secret/` so that the path to the file is: `{project-directory}/secret/serviceAccountKey.json`.

Note that this path is just the default path but can be configured (see [Configurations section](#configurations)).

The contents of the JSON file should look like
```
{
  "type": "service_account",
  "project_id": "firebase-project-name",
  "private_key_id": "fjj65be89cb3c6b04bacx9637503373fb8.......",
  "private_key": "{public key in PEM format}",
  "client_email": "firebase-adminsdk.....iam.gserviceaccount.com",
  "client_id": "1234567890",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk.....iam.gserviceaccount.com"
}
```

2. Environment Variables

Create a `.env` file in your local environment.
Put these lines into that file:
```
LOCAL_SIMULATOR=true
EXPERIMENTAL_DELAY=2000
```
These will enable the Mojaloop simulator until the relevant features on the real Mojaloop network are implemented.
To see other environment variables that you can use to customize the server configuration (see [Configurations section](#configurations)).


3. Mock Consent Objects

You need to create a collection in your Firestore named "consents" and then create an object in that collection like so: 

```
{
   "consentId":"555",
   "party":{
      "partyIdInfo":{
         "partyIdType":"MSISDN",
         "partyIdentifier":"+1-111-111-1111",
         "fspId":"fspb"
      },
      "name":"Bob Beaver",
      "personalInfo":{
         "complexName":{
            "firstName":"Bob",
            "lastName":"Beaver"
         }
      }
   }
}
```

Note: The nested structure can be replicated by using the Map data type in Firestore.

You can use any info for the partyIdentifier and names but the consentId must be 555 or 985 for now - this is hardcoded in the mobile app so the consentId must match.

(You can copy the example exactly and it will work)

This represents the consent that the user has given to PISP app to be able to access their account information. 

When account linking is fully functional, this step will no longer need to be performed since we will get actual consent objects in the collection from the account linking process.

## Running Locally


```bash
# start the server
npm run start

# alternatively, run in dev mode to restart on file changes 
npm run dev
```

Go to the PISP demo app and try to send money to a payee. You should see that the Firestore collection "transactions" has a new document and that the document status is changing as the server performs each step in the transaction sequence.

## Config

Take a look at [src/lib/config](https://github.com/mojaloop/pisp-demo-server/blob/master/src/lib/config.ts) to see all the different aspects of the server that you can configure.

## TTK Steps:

```bash
# start a lookup
./node_modules/.bin/jest --collectCoverage=false test/integration/_scratch_01_party_lookup.test.ts

# Then look for the line:
#     make sure to set this: export TRANSACTION_ID=<some id>

export TRANSACTION_ID=yIf88LByjKGtNraZADOq

# Confirm payee, and set amount
./node_modules/.bin/jest --collectCoverage=false test/integration/_scratch_02_payment_confirmation.test.ts
```
## Mock Data for Account Linking

### Mocking Available Financial Service Providers 

Follow these steps to display a list of available Financial Service Providers on the account linking tab.

1. Create a new collection called `participants`
2. Inside the collection `participants`, add as many different FSP documents as you want.

An FSP document consists of a Map that looks like so:

```
{
  fspId: "hsbc",
  name: "HSBC Bank"
}
```

When the server is fully functional, the server will periodically update this list and populate the 'participants' collection so this won't be needed anymore.

### Mocking Accounts for Associated Accounts

1. In the Consent object, that you are working with, add an `accounts` field of type 'array'.
2. In that array, add as many Account documents as you want.

An Account document consists of a Map that looks like so:

```
{
  id: "account.bob.fsp",
  currency: "SGD"
}
```

The overall Consent object should look like this:

```
{
   "consentId":"555",
   ...
   "accounts": [
     { "id": "account.bob.fsp", "currency": "USD" },
     { "id": "anotheraccount.bob.fsp", "currency": "SGD" },
     ...
   ]
}
```



## API Example Snippets:
These curl snippets may be useful when debugging this service.

```bash
curl localhost:8080/health -H "Host: mojaloop.pisp-demo-server.local"


curl -X PUT localhost:8080/thirdpartyRequests/transactions/02e28448-3c05-4059-b5f7-d518d0a2d8ea \
   -H "Host: mojaloop.pisp-demo-server.local" \
   -H "accept: application/json"  \
   -H "content-type: application/json" \
   -H "date: 2020-10-14" \
   -H "FSPIOP-Source: dfspa" \
   -H "FSPIOP-Destination: pispa" \
   --data '{
      "transactionRequestState":"RECEIVED"
   }'


# OPAQUE party lookup to ttk

curl -X GET localhost:15000/parties/OPAQUE/02e28448-3c05-4059-b5f7-d518d0a2d8ea \
   -H "accept: application/vnd.interoperability.parties+json;version=1.1"  \
   -H "content-type: application/vnd.interoperability.parties+json;version=1.1" \
   -H "date: 2020-10-14" \
   -H "FSPIOP-Source: pispa" \
   -H "FSPIOP-Destination: dfspa"


# opaque party lookup response example
curl -v -X PUT localhost:8080/parties/OPAQUE/02e28448-3c05-4059-b5f7-d518d0a2d8ea \
   -H "Host: mojaloop.pisp-demo-server.local" \
   -H "accept: application/json"  \
   -H "Content-Type: application/vnd.interoperability.parties+json;version=1.0" \
   -H "date: 2020-10-14" \
   --data '{
    "party": {
      "partyIdInfo": {
        "partyIdType": "MSISDN",
        "partyIdentifier": "+1-111-111-1111",
        "fspId": "dfspA"
      },
      "merchantClassificationCode": "4321",
      "name": "Alice K",
      "personalInfo": {
        "complexName": {
          "firstName": "Alice",
          "lastName": "K"
        },
        "dateOfBirth": "1963-06-16"
      },
      "accounts": {
        "account": [
          {
            "address": "dfspa.alice.1234",
            "currency": "USD",
            "description": "savings"
          },
          {
            "address": "dfspa.alice.5678",
            "currency": "USD",
            "description": "checking"
          }
        ]
      }
    }
  }'


## POST /thirdpartyRequests/transactions
curl -X POST http://a83b02650de2c498f9a8fad00bc3fa12-106691503.eu-west-2.elb.amazonaws.com/thirdparty-api-adapter/thirdpartyRequests/transactions \
  -H "accept: application/vnd.interoperability.thirdparty+json;version=1" \
  -H "content-type: application/vnd.interoperability.thirdparty+json;version=1.0" \
  -H "date: Tue, 20 Oct 2020 04:14:50 GMT" \
  -H "FSPIOP-Source: pispa" \
  -H "FSPIOP-Destination: dfspa" \
  --data '{
    "transactionRequestId":"02e28448-3c05-4059-b5f7-d518d0a2d8ea",
    "sourceAccountId":"bob.fspA",
    "consentId":"9d553d59-610f-44aa-b7ec-b483af24e98a",
    "payee": {
      "name": "Alice Alpaca",
      "accounts": {
        "account":[
          {
            "currency":"USD",
            "description":"savings",
            "address":"moja.amber.53451233-b82a5456a-4fa9-838b-123456789"
          },
          {
            "description":"checkings",
            "address":"moja.amber.8f027046-b8236345a-4fa9-838b-123456789",
            "currency":"USD"
          }
        ]
      },
      "partyIdInfo": {
        "partyIdType":"MSISDN",
        "partyIdentifier":"123456789",
        "fspId":"dfspa"
      },
      "personalInfo": {
        "dateOfBirth":"1970-01-01",
        "complexName": {"middleName":"K","firstName":"Alice","lastName":"Alpaca"}
        }
      },
      "payer": {
        "merchantClassificationCode":"4321",
        "personalInfo":{"dateOfBirth":"1963-06-16","complexName":{"firstName":"Alice","lastName":"K"}},
        "accounts":{
          "account":[
            {
              "currency":"USD",
              "description":"savings",
              "address":"dfspa.alice.1234"
            },
            {
              "currency":"USD",
              "address":"dfspa.alice.5678",
              "description":"checking"
            }
          ]
        },
        "partyIdInfo": {
          "partyIdentifier":"+1-111-111-1111",
          "partyIdType":"MSISDN",
          "fspId":"dfspA"
        },
        "name":"Alice K"
      },
      "amountType":"RECEIVE",
      "amount":{
        "currency":"USD",
        "amount":"123"
      },
      "transactionType": {
        "scenario":"TRANSFER",
        "initiator":"PAYER",
        "initiatorType":"CONSUMER"
      },
      "expiration":"1970-01-01T00:00:00.021Z"
  }'


# TODO: remove the accounts section to make the quoting service happy
# Also made changes to payer/payer fspid etc.
curl -X POST $ELB_URL/thirdparty-api-adapter/thirdpartyRequests/transactions \
  -H "accept: application/vnd.interoperability.thirdparty+json;version=1" \
  -H "content-type: application/vnd.interoperability.thirdparty+json;version=1.0" \
  -H "date: Tue, 20 Oct 2020 04:14:50 GMT" \
  -H "FSPIOP-Source: pispa" \
  -H "FSPIOP-Destination: dfspa" \
  --data '{
    "transactionRequestId":"02e28448-3c05-4059-b5f7-d518d0a2d8ea",
    "sourceAccountId":"bob.fspA",
    "consentId":"9d553d59-610f-44aa-b7ec-b483af24e98a",
    "payee": {
      "name": "Alice Alpaca",
      "partyIdInfo": {
        "partyIdType":"MSISDN",
        "partyIdentifier":"123456789",
        "fspId":"dfspb"
      },
      "personalInfo": {
        "dateOfBirth":"1970-01-01",
        "complexName": {"middleName":"K","firstName":"Alice","lastName":"Alpaca"}
      }
    },
    "payer": {
      "merchantClassificationCode":"4321",
      "personalInfo":{"dateOfBirth":"1963-06-16","complexName":{"firstName":"Alice","lastName":"K"}},
      "partyIdInfo": {
        "partyIdentifier":"+1-111-111-1111",
        "partyIdType":"MSISDN",
        "fspId":"dfspa"
      },
      "name":"Alice K"
    },
    "amountType":"RECEIVE",
    "amount":{
      "currency":"USD",
      "amount":"123"
    },
    "transactionType": {
      "scenario":"TRANSFER",
      "initiator":"PAYER",
      "initiatorType":"CONSUMER"
    },
    "expiration":"1970-01-01T00:00:00.021Z"
  }'



# check registered endpoints:
curl -s $ELB_URL/central-ledger/participants/pisp/endpoints | jq


curl -X POST $ELB_URL/central-ledger/participants/pisp/endpoints \
  -H "accept: application/json" \
  -H "content-type: application/json" \
  --data '{
    "type": "FSPIOP_CALLBACK_URL_TRANSFER_ERROR",
    "value": "http://simulator.moja-box.vessels.tech/payerfsp/transfers/{{transferId}}/error"
  }'


TRANSFER_ID=$(od -x /dev/urandom | head -1 | awk '{OFS="-"; print $2$3,$4,$5,$6,$7$8$9}')
DATE=$(echo 'nowDate = new Date(); console.log(nowDate.toGMTString());' > /tmp/date && node /tmp/date)
EXPIRATION_DATE=$(echo 'nowDate = new Date(); nowDate.setDate(nowDate.getDate() + 1); console.log(nowDate.toISOString());' > /tmp/date && node /tmp/date)
COMPLETED_TIMESTAMP=$(echo 'nowDate = new Date(); nowDate.setDate(nowDate.getDate()); console.log(nowDate.toISOString());' > /tmp/date && node /tmp/date)

curl -X POST $ELB_URL/ml-api-adapter/transfers \
  -H "accept: application/vnd.interoperability.transfers+json;version=1" \
  -H "content-type: application/vnd.interoperability.transfers+json;version=1.0" \
  -H "date: Tue, 20 Oct 2020 04:14:50 GMT" \
  -H "FSPIOP-Source: dfspa" \
  -H "FSPIOP-Destination: dfspb" \
  -- data '{
  "transferId": "02e28448-3c05-4059-b5f7-d518d0a2d8eb",
  "transactionRequestId": "02e28448-3c05-4059-b5f7-d518d0a2d8ea",
  "payeeFsp": "dfspb",
  "payerFsp": "dfspa",
  "amount": {
    "amount": "100",
    "currency": "USD"
  },
  "ilpPacket": "AQAAAAAAAADIEHByaXZhdGUucGF5ZWVmc3CCAiB7InRyYW5zYWN0aW9uSWQiOiIyZGY3NzRlMi1mMWRiLTRmZjctYTQ5NS0yZGRkMzdhZjdjMmMiLCJxdW90ZUlkIjoiMDNhNjA1NTAtNmYyZi00NTU2LThlMDQtMDcwM2UzOWI4N2ZmIiwicGF5ZWUiOnsicGFydHlJZEluZm8iOnsicGFydHlJZFR5cGUiOiJNU0lTRE4iLCJwYXJ0eUlkZW50aWZpZXIiOiIyNzcxMzgwMzkxMyIsImZzcElkIjoicGF5ZWVmc3AifSwicGVyc29uYWxJbmZvIjp7ImNvbXBsZXhOYW1lIjp7fX19LCJwYXllciI6eyJwYXJ0eUlkSW5mbyI6eyJwYXJ0eUlkVHlwZSI6Ik1TSVNETiIsInBhcnR5SWRlbnRpZmllciI6IjI3NzEzODAzOTExIiwiZnNwSWQiOiJwYXllcmZzcCJ9LCJwZXJzb25hbEluZm8iOnsiY29tcGxleE5hbWUiOnt9fX0sImFtb3VudCI6eyJjdXJyZW5jeSI6IlVTRCIsImFtb3VudCI6IjIwMCJ9LCJ0cmFuc2FjdGlvblR5cGUiOnsic2NlbmFyaW8iOiJERVBPU0lUIiwic3ViU2NlbmFyaW8iOiJERVBPU0lUIiwiaW5pdGlhdG9yIjoiUEFZRVIiLCJpbml0aWF0b3JUeXBlIjoiQ09OU1VNRVIiLCJyZWZ1bmRJbmZvIjp7fX19",
  "condition": "HOr22-H3AfTDHrSkPjJtVPRdKouuMkDXTR4ejlQa8Ks",
  "expiration": "2020-10-22T13:19:03.097Z"
  }'

```