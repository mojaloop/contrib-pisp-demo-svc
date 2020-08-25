# Transfer

Transfer is one of the core components for the PISP server when integrating with Mojaloop. This flow is used by a PISP to initiate a transaction on behalf of its user. Some of the phases below rely on the trust that has been established using the [linking flow](./linking.md). After performing the necessary steps, the money will be moved from the payer's account to the payee's account without the need for the user to interact directly with their FSP.

The following are the different phases of operations that need to be performed to perform a transfer:

1. [Create Listener](#1-create-listener)
2. [Create Transaction](#2-create-transaction)
3. [Confirm Payee](#3-confirm-payee)
4. [Authorization Prompt](#3-authorization-prompt)
5. [Authorize Transaction](#4-authorize-transaction)
6. [Transaction Feedback](#5-transaction-feedback)

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

The diagram below shows how both the server and mobile app could start listening to the transaction
documents. For the server, it will listen to all of the transaction documents from all users.
Meanwhile, each user is only allowed to listen to their transactions. Firebase rules will also help
to prevent a user from looking at other users' transactions.

![Create Listener](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/transfer/01-create-listener.puml)

## 2. Create Transaction

In this phase, the PISP creates a new transaction document and provides some information about the payee. Currently, the identifier that should be used for the PISP demo server is a phone number. However, this may change when we would like to support more identifiers, such as a national identification number. 

The PISP server is expected to perform a party lookup to Mojaloop to get more information about the payee, such as name and FSP identifier. That information will then be displayed to the user to check whether they would like to send money to the correct party.

![Create Transaction](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/transfer/02-create-transaction.puml)

## 3. Confirm Payee

In this phase, the user is expected to confirm that the payee is correct and provide more detailed information such as the transaction amount and account that they would like to send the money from.

![Confirm Transaction](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/transfer/03-confirm-payee.puml)

## 4. Authorization Prompt

In this phase, Mojaloop has received the transaction request and asks the PISP to provide authorization from the user. It will be based on the consent that has been established from the linking process.

![Authorization Prompt](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/transfer/04-authorization-prompt.puml)

## 5. Authorize Transaction

Here the PISP tries to prove to the FSP that it initiates the transaction upon a request by the user. The app will try to call the FIDO library to have the transaction quote digitally signed using the private key generated in the linking process.

![Authorize Transaction](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/transfer/05-authorize-transaction.puml)

## 6. Transaction Feedback

Once Mojaloop verifies that the authorization provided was indeed valid based on the established trust, a transfer will be processed in the RTP network. A request containing the transfer status will be forwarded to the PISP server to notify whether the transaction is successful. In the happy path, it will contain information saying that the transaction has been committed. The PISP app is then expected to notify the user about the transaction status.

![Transaction Feedback](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/master/docs/assets/diagrams/transfer/06-transaction-feedback.puml)
