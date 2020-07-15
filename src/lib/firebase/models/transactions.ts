/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
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
  AuthenticationType, AuthenticationInfo, AuthenticationResponseType, Party, Money, Quote,
} from '~/shared/ml-thirdparty-client/models/core';

export enum Status {
  PENDING_PAYEE_CONFIRMATION = "PENDING_PAYEE_CONFIRMATION",
  AUTHORIZATION_REQUIRED = "AUTHORIZATION_REQUIRED",
  SUCCESS = "SUCCESS",
}

export interface Transaction {
  /**
   * Information about the payee in the proposed financial transaction.
   */
  payee?: Party

  /**
   * A temporary field that is used to handle party query result.
   */
  partyQuery?: string

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
   * The type of authentication that is required to authorize the proposed 
   * financial transaction.
   */
  authenticationType?: AuthenticationType

  /**
   * The authentication info that may be entered by the payer to authorize a
   * proposed financial transaction.
   */
  authenticationInfo?: AuthenticationInfo

  /**
   * Payer's response after being prompted to authorize a proposed financial transaction.
   */
  responseType?: AuthenticationResponseType

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
