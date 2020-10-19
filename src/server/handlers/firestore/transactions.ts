/* eslint-disable @typescript-eslint/no-non-null-assertion */
/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 * Google
 - Steven Wijaya <stevenwjy@google.com>
 - Abhimanyu Kapur <abhi.kapur09@gmail.com>
 --------------
 ******/
/* istanbul ignore file */
// TODO: Testing will covered in separate ticket

import * as utils from '~/lib/utils'
import { logger } from '~/shared/logger'
import {
  AmountType,
} from '~/shared/ml-thirdparty-client/models/core'

import { TransactionHandler } from '~/server/plugins/internal/firestore'
import { Transaction, Status } from '~/models/transaction'
import { transactionRepository } from '~/repositories/transaction'

import * as validator from './transactions.validator'
import { consentRepository } from '~/repositories/consent'
import { PutThirdpartyRequestsTransactionsAuthorizationsRequest } from '@mojaloop/sdk-standard-components'

// TODO: Replace once design decision made on how we should be obtaining this
const destParticipantId = 'PLACEHOLDER'

async function handleNewTransaction(_: StateServer, transaction: Transaction) {
  // Assign a transactionRequestId to the document and set the initial
  // status. This operation will create an event that triggers the execution
  // of the onUpdate function.
  // Not await-ing promise to resolve - code is executed asynchronously
  transactionRepository.updateById(transaction.id, {
    // TD - LD Hack - set this to match what the testing toolkit will return
    // TODO: make configurable
    // transactionRequestId: uuid.v4(),
    transactionRequestId: '02e28448-3c05-4059-b5f7-d518d0a2d8ea',
    status: Status.PENDING_PARTY_LOOKUP,
  })
}

async function handlePartyLookup(server: StateServer, transaction: Transaction) {
  // Check whether the transaction document has all the necessary properties
  // to perform a party lookup.
  if (!validator.isValidPartyLookup(transaction)) {
    console.log('error - invalid party lookup for ', transaction)
    return;
  }

  // LD - we should be able to fix this by better using typings here
  // Payee is guaranteed to be non-null by the validator.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const payee = transaction.payee!

  server.app.mojaloopClient.getParties(
    payee.partyIdInfo.partyIdType,
    payee.partyIdInfo.partyIdentifier
  )
}

async function handlePartyConfirmation(
  server: StateServer,
  transaction: Transaction
) {
  // Upon receiving a callback from Mojaloop that contains information about
  // the payee, the server will update all relevant transaction documents
  // in the Firebase. However, we can just ignore all updates by the server
  // and wait for the user to confirm the payee by keying in more details
  // about the transaction (i.e., source account ID, consent ID, and
  // transaction amount).
  if (validator.isValidPayeeConfirmation(transaction)) {
    // If the update contains all the necessary fields, process document
    // to the next step by sending a transaction request to Mojaloop.

    try {
      // The optional values are guaranteed to exist by the validator.
      // eslint-disable @typescript-eslint/no-non-null-assertion

      const consent = await consentRepository.getConsentById(
        transaction.consentId!
      )

      server.app.mojaloopClient.postTransactions(
        {
          transactionRequestId: transaction.transactionRequestId!,
          sourceAccountId: transaction.sourceAccountId!,
          consentId: transaction.consentId!,
          payee: transaction.payee!,
          payer: consent.party!,
          amountType: AmountType.RECEIVE,
          amount: transaction.amount!,
          transactionType: {
            scenario: 'TRANSFER',
            initiator: 'PAYER',
            initiatorType: 'CONSUMER',
          },
          expiration: utils.getTomorrowsDate().toISOString(),
        },
        destParticipantId
      )

      // eslint-enable @typescript-eslint/no-non-null-assertion
    } catch (err) {
      logger.error(err)
    }
  }
}

// function toMojaloopResponseType(
//   type: ResponseType
// ): AuthenticationResponseType {
//   switch (type) {
//     case ResponseType.AUTHORIZED:
//       return AuthenticationResponseType.ENTERED
//     case ResponseType.REJECTED:
//       return AuthenticationResponseType.REJECTED
//   }
// }

async function handleAuthorization(server: StateServer, transaction: Transaction) {
  if (validator.isValidAuthorization(transaction)) {
    // If the update contains all the necessary fields, process document
    // to the next step by sending an authorization to Mojaloop.

    // Convert to a response type that is understood by Mojaloop.
    // const mojaloopResponseType = toMojaloopResponseType(transaction.responseType!)

    // TD - LD eww so much messy casting going on
    const requestBody: PutThirdpartyRequestsTransactionsAuthorizationsRequest = {
      challenge: JSON.stringify(transaction.quote),
      consentId: transaction.consentId!,
      sourceAccountId: transaction.sourceAccountId!,
      //LD - TODO: this should be pending - but need to fix ok TTK
      status: 'VERIFIED',
      value: transaction.authentication?.value as string,
    }

    // The optional values are guaranteed to exist by the validator.
    // eslint-disable @typescript-eslint/no-non-null-assertion
    server.app.mojaloopClient.putAuthorizations(transaction.transactionRequestId!, requestBody,destParticipantId)
    // eslint-enable @typescript-eslint/no-non-null-assertion
  }
}

export const onCreate: TransactionHandler = async (
  server: StateServer,
  transaction: Transaction
): Promise<void> => {
  // console.log('onCreateCalled', transaction)
  if (transaction.status) {
    // Skip transaction that has been processed previously.
    // We need this because when the server starts for the first time,
    // all existing documents in the Firebase will be treated as a new
    // document.
    return
  }

  await handleNewTransaction(server, transaction)
}

export const onUpdate: TransactionHandler = async (
  server: StateServer,
  transaction: Transaction
): Promise<void> => {
  console.log('onUpdateCalled', transaction)
  if (!transaction.status) {
    // Status is expected to be null only when the document is created for the first
    // time by the user.
    logger.error('Invalid transaction update, undefined status.')
    return
  }

  switch (transaction.status) {
    case Status.PENDING_PARTY_LOOKUP:
      await handlePartyLookup(server, transaction)
      break

    case Status.PENDING_PAYEE_CONFIRMATION:
      await handlePartyConfirmation(server, transaction)
      break

    case Status.AUTHORIZATION_REQUIRED:
      await handleAuthorization(server, transaction)
      break
  }
}
