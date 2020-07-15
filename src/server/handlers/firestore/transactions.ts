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

import firebase from '~/lib/firebase'
import { Transaction, Status } from '~/lib/firebase/models/transactions'
import { TransactionHandler } from '~/server/plugins/internal/firestore'

import { logger } from '~/shared/logger'
import { AmountType } from '~/shared/ml-thirdparty-client/models/core'


function isValidPartyQuery(transaction: Transaction): boolean {
  if (transaction.payee) {
    return true
  }
  return false
}

function isValidPayeeConfirmation(transaction: Transaction): boolean {
  if (transaction.transactionRequestId
    && transaction.consentId && transaction.sourceAccountId
    && transaction.amount && transaction.payer && transaction.payee) {
    return true
  }
  return false
}

function isValidAuthorization(transaction: Transaction): boolean {
  if (transaction.authenticationInfo && transaction.responseType) {
    return true
  }
  return false
}

function getTomorrowsDate(): Date {
  let currentDate = new Date()
  return new Date(currentDate.getDate() + 1)
}

async function setupNewTransaction(id: string) {
  await firebase.firestore()
    .collection('transactions')
    .doc(id)
    .set({
      transactionRequestId: uuid.v4(),
      status: Status.PENDING_PARTY_LOOKUP
    }, { merge: true })
}

export const onCreate: TransactionHandler = async (server: Server, id: string, transaction: Transaction) => {
  if (transaction.status) {
    // Skip transaction that has been processed previously.
    // We need this because when the server starts for the first time, 
    // all existing documents in the Firebase will be treated as a new
    // document.
    return
  }

  await setupNewTransaction(id)

  if (isValidPartyQuery(transaction)) {
    server.app.mojaloopClient.getParties(
      transaction.payee!.partyIdInfo.partyIdType,
      transaction.payee!.partyIdInfo.partyIdentifier,
    )
  } else {
    logger.error('invalid party query')
  }
}

export const onUpdate: TransactionHandler = async (server: Server, _: string, transaction: Transaction) => {
  if (!transaction.status) {
    logger.error('Invalid transaction update. No status provided.')
    return
  }

  if (transaction.status === Status.PENDING_PAYEE_CONFIRMATION.toString()) {
    if (isValidPayeeConfirmation(transaction)) {
      server.app.mojaloopClient.postTransactions({
        transactionRequestId: transaction.transactionRequestId!,
        sourceAccountId: transaction.sourceAccountId!,
        consentId: transaction.consentId!,
        payee: transaction.payee!,
        payer: transaction.payer!,
        amountType: AmountType.RECEIVE,
        amount: transaction.amount!,
        transactionType: {
          scenario: "TRANSFER",
          initiator: "PAYER",
          intiiatorType: "CONSUMER",
        },
        expiration: getTomorrowsDate().toISOString()
      })
    }

  } else if (transaction.status === Status.AUTHORIZATION_REQUIRED.toString()) {
    if (isValidAuthorization(transaction)) {
      server.app.mojaloopClient.putAuthorizations(
        id,
        {
          responseType: transaction.responseType!,
          authenticationInfo: transaction.authenticationInfo!
        },
        transaction.transactionId,
      )
    }
  }
}

