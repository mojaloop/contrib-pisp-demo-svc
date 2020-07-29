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

import { logger } from '~/shared/logger'
import { TransactionHandler } from '~/server/plugins/internal/firestore'

import { Transaction, Status } from '~/models/transaction'
import { transactionRepository } from '~/repositories/transaction'

import * as validator from './transactions.validator'

export const onCreate: TransactionHandler =
  async (_: Server, transaction: Transaction): Promise<void> => {
    if (transaction.status) {
      // Skip transaction that has been processed previously.
      // We need this because when the server starts for the first time, 
      // all existing documents in the Firebase will be treated as a new
      // document.
      return
    }

    // Assign a transactionRequestId to the document and set the initial
    // status. This operation will create an event that triggers the execution
    // of the onUpdate function.
    transactionRepository.updateById(transaction.id, {
      transactionRequestId: uuid.v4(),
      status: Status.PENDING_PARTY_LOOKUP,
    })
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
        break

      case Status.PENDING_PAYEE_CONFIRMATION:
        // Upon receiving a callback from Mojaloop that contains information about
        // the payee, the server will update all relevant transaction documents 
        // in the Firebase. However, we can just ignore all updates by the server
        // and wait for the user to confirm the payee by keying in more details 
        // about the transaction (i.e., source account ID, consent ID, and 
        // transaction amount).
        break
    }
  }
