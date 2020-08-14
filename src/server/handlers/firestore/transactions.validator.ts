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

import { Transaction } from '~/models/transaction'

/**
 * Checks whether a transaction document has all the necessary fields to perform
 * a party lookup.
 *
 * @param transaction the object representation of a transaction that is stored
 *                    on Firebase.
 */
export const isValidPartyLookup = (transaction: Transaction): boolean => {
  return (
    transaction.payee != null &&
    transaction.payee.partyIdInfo != null &&
    transaction.payee.partyIdInfo.partyIdType != null &&
    transaction.payee.partyIdInfo.partyIdentifier != null
  )
}

/**
 * Checks whether a transaction document has all the necessary fields to be
 * processed as a transaction request.
 *
 * @param transaction the object representation of a transaction that is stored
 *                    on Firebase.
 */
export const isValidPayeeConfirmation = (transaction: Transaction): boolean => {
  return (
    transaction.transactionRequestId != null &&
    transaction.consentId != null &&
    transaction.sourceAccountId != null &&
    transaction.amount != null &&
    transaction.payee != null
  )
}

/**
 * Checks whether a transaction document has all the necessary fields to be 
 * processed as a transaction authorization.
 * 
 * @param transaction the object representation of a transaction that is stored
 *                    on Firebase.
 */
export const isValidAuthorization = (transaction: Transaction): boolean => {
  return transaction.transactionRequestId != null
    && transaction.transactionId != null
    && transaction.authentication != null
    && transaction.authentication.type != null
    && transaction.authentication.value != null
    && transaction.responseType != null
}
