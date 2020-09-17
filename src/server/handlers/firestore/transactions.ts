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

import * as uuid from 'uuid'

import * as utils from '~/lib/utils'
import { logger } from '~/shared/logger'
import {
  AmountType,
  AuthenticationResponseType,
} from '~/shared/ml-thirdparty-client/models/core'

import { TransactionHandler } from '~/server/plugins/internal/firestore'
import { Transaction, Status, ResponseType } from '~/models/transaction'
import { transactionRepository } from '~/repositories/transaction'

import * as validator from './transactions.validator'
import { consentRepository } from '~/repositories/consent'

// TODO: Replace once decided how to implement
const destParticipantId = 'PLACEHOLDER'

async function handleNewTransaction(_: StateServer, transaction: Transaction) {
  // Assign a transactionRequestId to the document and set the initial
  // status. This operation will create an event that triggers the execution
  // of the onUpdate function.
  transactionRepository.updateById(transaction.id, {
    transactionRequestId: uuid.v4(),
    status: Status.PENDING_PARTY_LOOKUP,
  })
}

async function handlePartyLookup(server: StateServer, transaction: Transaction) {
  // Check whether the transaction document has all the necessary properties
  // to perform a party lookup.
  if (validator.isValidPartyLookup(transaction)) {
    // Payee is guaranteed to be non-null by the validator.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const payee = transaction.payee!

    server.app.mojaloopClient.getParties(
      payee.partyIdInfo.partyIdType,
      payee.partyIdInfo.partyIdentifier
    )
  }
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

      const consent = await consentRepository.getByConsentId(
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

function toMojaloopResponseType(
  type: ResponseType
): AuthenticationResponseType {
  switch (type) {
    case ResponseType.AUTHORIZED:
      return AuthenticationResponseType.ENTERED
    case ResponseType.REJECTED:
      return AuthenticationResponseType.REJECTED
  }
}

async function handleAuthorization(server: StateServer, transaction: Transaction) {
  if (validator.isValidAuthorization(transaction)) {
    // If the update contains all the necessary fields, process document
    // to the next step by sending an authorization to Mojaloop.

    // Convert to a response type that is understood by Mojaloop.
    const mojaloopResponseType = toMojaloopResponseType(
      transaction.responseType!
    )

    // The optional values are guaranteed to exist by the validator.
    // eslint-disable @typescript-eslint/no-non-null-assertion
    server.app.mojaloopClient.putAuthorizations(
      transaction.transactionRequestId!,
      {
        responseType: mojaloopResponseType,
        authenticationInfo: {
          authentication: transaction.authentication!.type!,
          authenticationValue: transaction.authentication!.value!,
        },
      },
      destParticipantId
    )
    // eslint-enable @typescript-eslint/no-non-null-assertion
  }
}

export const onCreate: TransactionHandler = async (
  server: StateServer,
  transaction: Transaction
): Promise<void> => {
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
