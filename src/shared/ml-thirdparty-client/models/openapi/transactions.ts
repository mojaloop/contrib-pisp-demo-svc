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
 --------------
 ******/

import { thirdparty as tpAPI } from '@mojaloop/api-snippets'

import {
  TransactionType,
} from '../core'

export interface ThirdPartyTransactionRequest {
  /**
   * Common ID between the FSPs for the transaction request object. 
   * The ID should be reused for resends of the same transaction request.
   * A new ID should be generated for each new transaction request.
   */
  transactionRequestId: string

  /**
   * Information about the Payee in the proposed financial transaction.
   */
  payee: tpAPI.Schemas.Party,

  /**
   * Information about the Payer in the proposed financial transaction.
   */
  payer: tpAPI.Schemas.PartyIdInfoTPLink

  /**
   * SEND for sendAmount, RECEIVE for receiveAmount.
   */
  amountType: tpAPI.Schemas.Money,

  /**
   * Requested amount to be transferred from the Payer to Payee.
   */
  amount: tpAPI.Schemas.Money

  /**
   * Type of transaction.
   */
  transactionType: TransactionType

  /**
   * Date and time until when the transaction request is valid. It can be set 
   * to get a quick failure in case the peer FSP takes too long to respond.
   */
  expiration: string


  // TODO: remove these in latest draft:
  /**
   * DFSP specific account identifier to identify the source account used by 
   * the payer for the proposed financial transaction.
   */
  sourceAccountId: string

  /**
   * Common ID between the PISP and FSP for the Consent object. This tells 
   * DFSP and auth-service which constent allows the PISP to initiate transaction.
   */
  consentId: string

}
