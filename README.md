# PISP Demo Server (Work in Progress)

A server used to communicate with the Mojaloop network to facilitate account linking and transactions for the [PISP demo app](https://github.com/mojaloop/pisp-demo-app-flutter).

# Quick Setup Guide

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
EXPERIMENTAL_MODE=on
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

# Starting the server

After all of the steps are done. Type `npm run start` in the command line in the project directory.

Go to the PISP demo app and try to send money to a payee. You should see that the Firestore collection "transactions" has a new document and that the document status is changing as the server performs each step in the transaction sequence.

# Configurations

Take a look at [src/lib/config](https://github.com/mojaloop/pisp-demo-server/blob/master/src/lib/config.ts) to see all the different aspects of the server that you can configure.

<<<<<<< HEAD

# API Examples:

```
curl localhost:8080/health -H "Host: mojaloop.pisp-demo-server.local"
```


## Transaction callback

## LD Testing notes:

- consentId must be valid uuid, otherwise mojaloop will reject, eg `e94b9110-f6c9-44cf-bdc0-895430f1ca9c`
   - had to hack around in the app to get this to work

- for `transactionRepository.update(conditions, body)`, I'm pretty sure we're going to need some firestore indicies


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
=======
# Mock Data for Account Linking

## Mocking Available Financial Service Providers 

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

## Mocking Accounts for Associated Accounts

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

>>>>>>> 9445f54f648660fe588e0152f1146f09348118cb
