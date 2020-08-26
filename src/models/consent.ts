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

import { Party } from '~/shared/ml-thirdparty-client/models/core'

export enum ConsentStatus {
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
   * Waiting for the user to authorize the consent.
   */
  AUTHORIZATION_REQUIRED = 'AUTHORIZATION_REQUIRED',

  /**
   * The consent is authorized and active.
   */
  ACTIVE = 'ACTIVE',

  /**
   * The consent is revoked and no longer valid.
   */
  REVOKED = 'REVOKED',
}

export interface Consent {
  /**
   * Internal id that is used to identify the transaction.
   */
  id: string

  /**
   * Common ID between the PISP and FSP for the Consent object. This tells
   * DFSP and auth-service which constent allows the PISP to initiate transaction.
   */
  consentId?: string

  /**
   * Information about the party that is associated with the consent.
   */
  party?: Party

  /**
   * Information about the current status of the consent.
   */
  status?: ConsentStatus
}
