# PISP Demo Server (Work in Progress)

A server used to communicate with the Mojaloop network to facilitate account linking and transactions for the PISP demo app (see: https://github.com/mojaloop/pisp-demo-app-flutter).

# Quick Setup Guide

1. Firebase SDK Admin Key

Follow the instructions outlined here: https://firebase.google.com/docs/admin/setup to obtain a .json file containing your secret key.
Rename it to be `serviceAccountKey.json` and put it in `{project-directory}/secret/` so that the path to the file is: `{project-directory}/secret/serviceAccountKey`.

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
EXPERIMENTAL_DELAY=5000
```
These will enable the Mojaloop simulator until the relevant features on the real Mojaloop network are implemented.


3. Mock Consent Objects

You need to create a collection in your Firestore named "consents" and then create an object in that collection like so: 

```
consentId: "555"
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
```

Note: The nested structure can be replicated by using the Map data type in Firestore.

You can use any info for the partyIdentifier and names but the consentId must be 555 for now - this is hardcoded in the serverside code.

(You can copy the example exactly and it will work)

This represents the consent that the user has given to PISP app to be able to access their account information. When account linking is fully functional, this step will no longer need to be performed since we will get actual consent objects in the collection.
