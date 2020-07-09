# Transfer

1. [Create Listener](#1-lookup-party)
2. [Initiate Transaction](#2-initiate-transaction)
3. [Authorization Prompt](#3-authorization-prompt)
4. [Authorize Transaction](#4-authorize-transaction)
5. [Transaction Feedback](#5-transaction-feedback)

## 1. Create Listener

![Create Listener](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/transfer-sequence-diagram/docs/assets/diagrams/transfer/01-create-listener.puml)

## 2. Initiate Transaction

> **_Note:_** The mobile app is expected to perform a [party lookup](./lookup.md) before initiating a transaction to get the payee information. Payer information could also be retrieved using party lookup or cached in the device after linking a bank account.

![Initiate Transaction](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/transfer-sequence-diagram/docs/assets/diagrams/transfer/02-initiate-transaction.puml)

## 3. Authorization Prompt

![Authorization Prompt](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/transfer-sequence-diagram/docs/assets/diagrams/transfer/03-authorization-prompt.puml)

## 4. Authorize Transaction

![Authorize Transaction](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/transfer-sequence-diagram/docs/assets/diagrams/transfer/04-authorize-transaction.puml)

## 5. Transaction Feedback

![Transaction Feedback](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mojaloop/pisp-demo-server/transfer-sequence-diagram/docs/assets/diagrams/transfer/05-transaction-feedback.puml)
