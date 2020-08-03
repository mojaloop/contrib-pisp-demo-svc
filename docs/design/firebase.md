# Firebase

PISP demo server relies on Firebase to perform several functionalities.
The following are some products that are used:
1. [Firebase Authentication](#1-firebase-authentication)
2. [Cloud Firestore](#2-cloud-firestore)

## Firebase Authentication

Authentication in the PISP demo server is handled by Firebase to ensure user integrity. 

Various scenarios handled by PISP demo server also requires authentication to be performed beforehand. For example, users won't be able to ask PISP app to initiate a transaction on their behalf before signing in to their registered account.

## Cloud Firestore

Cloud Firestore is used to manage realtime data syncing between server and clients. 

### Usages

Cloud Firestore is used by the PISP demo server in the following scenarios:
- [Transfer](./transfer.md)

### Security Rules

Access to Firestore from web and mobile clients need to adhere to the security rules in order to limit users' ability when performing operations on data with restricted permission. Note that the rules in this section only apply to web and mobile clients since all accesses coming from PISP demo server, which uses Firebase Admin SDK, will bypass security rules entirely.

Below is the basic structure that will be used. More details for each path in the database will be explained in the respective subsection.

```
rules_version = "2";

service cloud.firestore {
  match /databases/{database}/documents {
    // Add helper functions
    function isAuthenticated() {
      return request.auth != null && request.auth.uid != null;
    }

    // Security rules for all paths in the database.
    // By default, user does not have any read write
    // permission in the production database.
  }
}
```

The combined security rules applied for Cloud Firestore is written in the [firestore.rules](../../firestore.rules) file in the root directory of this repository.

#### Transactions

```
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && request.auth.uid == resource.data.userId;

      allow create: if isAuthenticated() && request.writeFields.hasAll(['userId'])
                    && request.auth.uid == request.resource.data.userId 
                    && !request.writeFields.hasAny(['status']);
      
      allow update: if isAuthenticated() && request.auth.uid == resource.data.userId
                    && !request.writeFields.hasAny(['status', 'userId']);

      allow delete: if false;
    }
```
