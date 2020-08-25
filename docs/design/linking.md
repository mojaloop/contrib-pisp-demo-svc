# Linking

Linking is one of the core components for the PISP server to be able to integrate with Mojaloop.
Before a PISP could initiate a transaction on behalf of its user, a trust must be established
between the user, FSP, and PISP itself. This is where the linking process plays an important role.
After performing the necessary steps, the FSP should recognize that the user has given their
consent to the PISP.

The following are the different phases of operations that need to be performed to establish the
trust and revoke it if the user does not want a PISP to initiate transfers on behalf of them anymore:

* [1. Create Listener](#1-create-listener)
* [2. Linking](#2-linking)
  * [2.1. Pre-linking](#2-1-pre-linking)
  * [2.2. Discovery](#2-2-discovery)
  * [2.3. Consent Request](#2-3-consent-request)
  * [2.4. Authentication Prompt](#2-4-authentication-prompt)
    * [2.4.1. Web](#2-4-1-web)
    * [2.3.2. OTP](#2-4-2-otp)
  * [2.5. Authentication](#2-5-authentication)
    * [2.5.1. Web](#2-5-1-web)
    * [2.5.2. OTP](#2-5-2-otp)
  * [2.7. Grant Consent](#2-6-grant-consent)
  * [2.7. Request Challenge](#2-7-request-challenge)
  * [2.8. Sign Challenge](#2-8-sign-challenge)
* [3. Unlinking](#3-unlinking)

There are 5 main participants that will be involved throughout the linking flow:
- User that interacts with the PISP app
- PISP app that displays beautiful UI to the user and abstracts out all of the processes going on behind the scene.
- Firebase that bridges the communication and data synchronization between the app and server.
- PISP server that implements the communication with Mojaloop using its SDK.
- Mojaloop switch which will route the requests from PISP server to the correct services in Mojaloop.

## 1. Create Listener

Before everything else starts, both the PISP demo server and the app need to open a
communication with Firebase, which is responsible for handling the data synchronization.
Whenever the mobile app performs an update in Firebase, the server that is listening to all of 
the events will be notified and could proceed to do necessary operations, such as making HTTP
requests to Mojaloop. Likewise, when Mojaloop makes a callback to the server, it can update the
data in Firebase, which will notify the mobile app for the relevant user.

The diagram below shows how both the server and mobile app could start listening to the consent
documents. For the server, it will listen to all of the consent documents from all users.
Meanwhile, each user is only allowed to listen to their consents. Firebase rules will also help
to prevent a user from looking at other users' consents.

![Create Listener](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/linking/1-create-listener.puml)

## 2. Linking

Throughout all of the linking phases, the PISP aims to be able to get the consent from the
user to initiate transfers on behalf of them.

### 2.1. Pre-linking

In this phase, the PISP tries to get the list of FSPs that their user could link using Mojaloop.
The PISP server will regularly try to fetch the list of FSPs and update the data in Firebase.
In the following sequence diagram, the server will do the operations daily. It is because we expect
the list of FSPs not to change very often, and hence we could cache it in Firebase to reduce the
number of requests that we may need to make to Mojaloop.

![Pre-linking](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/linking/2-1-pre-linking.puml)

### 2.2. Discovery

In this phase, the user will be prompted to enter an opaque identifier to the mobile app.
The purpose is to look up the information about the accounts available in Mojaloop for the user
to connect. However, the opaque identifier is special in Mojaloop and cannot be used to initiate transactions.
Hence, the result of the party lookup will contain a valid party identifier to make future transactions.
More details about this could be found in the discussion thread [here](https://github.com/mojaloop/pisp/issues/45).

![Discovery](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/linking/2-2-discovery.puml)

### 2.3. Consent Request

In this phase, the user has decided to connect some selected accounts with their PISP account.
Hence, the app will try to inform the server of the selected accounts, which could then be
processed further by initiating a consent request to Mojaloop.

![Consent Request](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/linking/2-3-consent-request.puml)

### 2.4. Authentication Prompt

Upon receiving the consent request, the FSP will try to ask the PISP to prove their relation with
the user. In this phase, there are currently two possible ways of doing this: Web and OTP.

#### 2.4.1. Web

In this case, the PISP will receive an authentication URI from the FSP. It is also supposed to redirect user to that URI.

![Authentication Prompt (Web)](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/linking/2-4-1-authentication-prompt-web.puml)

#### 2.4.2. OTP

In this case, the PISP will not receive an authentication URI from the FSP. The user will be prompted to enter the OTP.

![Authentication Prompt (OTP)](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/linking/2-4-2-authentication-prompt-otp.puml)

### 2.5. Authentication

In this phase, the PISP app should prove that the user trusts it. The way to do that is for the
user to pass in the authentication token. It could be in the form of any secret token or OTP to
the PISP app. The application will then pass the information to the server. The server will request
Mojaloop to give the authentication value. If the value is valid, then the FSP will trust the PISP
as they only gave the secret to the user previously and the fact that the PISP has it means that
the user trusts the PISP by giving their authentication value.

#### 2.5.1. Web

The web authentication page of the FSP will redirect to the PISP app using a deep link. The secret
authentication value is also expected to be passed on upon redirection. The secret will then be passed
to the server and afterward to Mojaloop.

![Authentication (Web)](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/linking/2-5-1-authentication-web.puml)

#### 2.5.2. OTP

The user is expected to key in their OTP code which should be sent by the FSP.

![Authentication (OTP)](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/linking/2-5-2-authentication-otp.puml)

### 2.6. Grant Consent

In this phase, Mojaloop will send a callback to the server notifying that the consent has been granted.
The server could decide to pass on the information to the app if it wants to display or update the UI.
However, note that the server is also expected to request a challenge for FIDO registration in Mojaloop
immediately.

![Grant Consent](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/linking/2-6-grant-consent.puml)

### 2.7. Request Challenge

The server requests a challenge from Mojaloop for FIDO registration. Mojaloop will send a callback that
contains a challenge that needs to be digitally signed for the registration.

![Request Challenge](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/linking/2-7-request-challenge.puml)

### 2.8. Sign Challenge

The app is expected to use the FIDO library to digitally sign the challenge using the private key that
it generates. The signature and public key will then be sent to the Server and afterward Mojaloop.
If the process is successful, the server will receive a callback from Mojaloop saying that the consent
is active by that point.

![Sign Challenge](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/linking/2-8-sign-challenge.puml)

## 3. Unlinking

This phase is intended to handle the case when the user wants to revoke the consent that they had given to the PISP. 

![Unlinking](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/linking/3-unlinking.puml)
