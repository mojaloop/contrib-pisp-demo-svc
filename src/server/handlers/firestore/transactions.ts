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
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Google
 - Steven Wijaya <stevenwjy@google.com>
 --------------
 ******/

import * as uuid from 'uuid'
import { Server } from '@hapi/hapi'

import * as utils from '~/lib/utils'
import { logger } from '~/shared/logger'
import { AmountType } from '~/shared/ml-thirdparty-client/models/core'

import { TransactionHandler } from '~/server/plugins/internal/firestore'
import { Transaction, Status } from '~/models/transaction'
import { transactionRepository } from '~/repositories/transaction'

import * as validator from './transactions.validator'
import { consentRepository } from '~/repositories/consent'

async function handleNewTransaction(_: Server, transaction: Transaction) {
  // Assign a transactionRequestId to the document and set the initial
  // status. This operation will create an event that triggers the execution
  // of the onUpdate function.
  transactionRepository.updateById(transaction.id, {
    transactionRequestId: uuid.v4(),
    status: Status.PENDING_PARTY_LOOKUP,
  })
}

async function handlePartyLookup(server: Server, transaction: Transaction) {
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

async function handlePartyConfirmation(server: Server, transaction: Transaction) {
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

      let consent = await consentRepository.getByConsentId(transaction.consentId!)

      server.app.mojaloopClient.postTransactions({
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
          intiiatorType: 'CONSUMER',
        },
        expiration: utils.getTomorrowsDate().toISOString()
      })

      // eslint-enable @typescript-eslint/no-non-null-assertion
    } catch (err) {
      logger.error(err)
    }
  }
}

export const onCreate: TransactionHandler =
  async (server: Server, transaction: Transaction): Promise<void> => {
    if (transaction.status) {
      // Skip transaction that has been processed previously.
      // We need this because when the server starts for the first time, 
      // all existing documents in the Firebase will be treated as a new
      // document.
      return
    }

    await handleNewTransaction(server, transaction)
  }

export const onUpdate: TransactionHandler =
  async (server: Server, transaction: Transaction): Promise<void> => {
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
        if (validator.isValidAuthorization(transaction)) {
          // If the update contains all the necessary fields, process document
          // to the next step by sending an authorization to Mojaloop.

          // The optional values are guaranteed to exist by the validator.
          // eslint-disable @typescript-eslint/no-non-null-assertion
          server.app.mojaloopClient.putAuthorizations(
            transaction.transactionRequestId!,
            {
              responseType: transaction.responseType!,
              authenticationInfo: {
                authentication: transaction.authentication!.type!,
                authenticationValue: transaction.authentication!.value!,
              }
            },
            transaction.transactionId,
          )
          // eslint-enable @typescript-eslint/no-non-null-assertion
        }
    }
  }
