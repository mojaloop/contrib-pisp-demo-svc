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

import {
  AuthenticationType,
  AuthenticationValue,
  Money,
  Party,
  Quote,
} from '~/shared/ml-thirdparty-client/models/core'

export enum Status {
  /**
   * Waiting for a callback from Mojaloop to give the payee information.
   */
  PENDING_PARTY_LOOKUP = 'PENDING_PARTY_LOOKUP',

  /**
   * Waiting for the user to confirm payee information and provide more
   * details about the transaction.
   */
  PENDING_PAYEE_CONFIRMATION = 'PENDING_PAYEE_CONFIRMATION',

  /**
   * Waiting for the user to authorize the transaction.
   */
  AUTHORIZATION_REQUIRED = 'AUTHORIZATION_REQUIRED',

  /**
   * The transaction is successful.
   */
  SUCCESS = 'SUCCESS',
}

export enum ResponseType {
  /**
   * The user authorized the transaction.
   */
  AUTHORIZED = 'AUTHORIZED',

  /**
   * The user rejected the transaction.
   */
  REJECTED = 'REJECTED',
}

export interface Transaction {
  /**
   * Internal id that is used to identify the transaction.
   */
  id: string

  /**
   * User ID in Firebase that differentiate transaction documents for
   * different users.
   */
  userId?: string

  /**
   * Information about the payee in the proposed financial transaction.
   */
  payee?: Party

  /**
   * Information about the payer in the proposed financial transaction.
   */
  payer?: Party

  /**
   * DFSP specific account identifier to identify the source account used by
   * the payer for the proposed financial transaction.
   */
  sourceAccountId?: string

  /**
   * Common ID between the PISP and FSP for the Consent object. This tells
   * DFSP and auth-service which constent allows the PISP to initiate transaction.
   */
  consentId?: string

  /**
   * Requested amount to be transferred from the Payer to Payee.
   */
  amount?: Money

  /**
   * The authentication info that may be entered by the payer to authorize a
   * proposed financial transaction.
   */
  authentication?: {
    /**
     * The type of authentication that is required to authorize the proposed
     * financial transaction.
     */
    type?: AuthenticationType

    /**
     * The value of authentication that is provided by payer to authorize the
     * proposed financial transaction.
     */
    value?: AuthenticationValue
  }

  /**
   * Payer's response after being prompted to authorize a proposed financial transaction.
   */
  responseType?: ResponseType

  /**
   * Common ID (decided by the PISP) to identify a transaction request.
   */
  transactionRequestId?: string

  /**
   * Common ID (decided by the Payer FSP) between the FSPs for the future transaction
   * object. The actual transaction will be created as part of a successful transfer
   * process.
   */
  transactionId?: string

  /**
   * A quote object that contains more detailed information about the transaction.
   */
  quote?: Quote

  /**
   * Status of the proposed financial transaction.
   */
  status?: Status
}
