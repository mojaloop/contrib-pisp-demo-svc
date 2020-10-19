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

import { Party, Account } from '~/shared/ml-thirdparty-client/models/core'
import {
  TCredential,
  TCredentialScope,
  TAuthChannel,
} from '@mojaloop/sdk-standard-components'

export enum ConsentStatus {
  /**
   * Waiting for a callback from Mojaloop to give the payee information.
   */
  PENDING_PARTY_LOOKUP = 'PENDING_PARTY_LOOKUP',

  /**
   * Waiting for the user to confirm payee information and provide more
   * details about the transaction.
   */
  PENDING_PARTY_CONFIRMATION = 'PENDING_PARTY_CONFIRMATION',

  /**
   * User has confirmed party
   */
  PARTY_CONFIRMED = 'PARTY_CONFIRMED',

  /**
   * Waiting for the user to authorize the consentRequest.
   */
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',

  /**
   * User has signed in with WEB or OTP flow and PISP has the authToken
   */
  AUTHENTICATION_COMPLETE = 'AUTHENTICATION_COMPLETE',

  /**
   * The consent is granted and active.
   */
  CONSENT_GRANTED = 'CONSENT_GRANTED',

  /**
   * The consent is ACTIVE and challenge has been generated
   */
  CHALLENGE_GENERATED = 'CHALLENGE_GENERATED',

  /**
   * The consent is ACTIVE and challenge has been verified
   */
  ACTIVE = 'ACTIVE',

  /**
   * The consent is revoked and no longer valid.
   */
  REVOKED = 'REVOKED',

  /**
   * The consent is requested to be revoked for unlinking.
   */
  REVOKE_REQUESTED = 'REVOKE_REQUESTED',
}

export interface Consent {
  /**
   * Internal id that is used to identify the transaction.
   */
  id: string

  /**
   * Common ID between the PISP and FSP for the Consent object. This tells
   * DFSP and auth-service which constent allows the PISP to initiate
   * transaction.
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

  /**
   * User Id provided by app
   */
  userId?: string

  /**
   * Id required to identify a specific consent request
   */
  consentRequestId?: string

  /**
   * Array of accounts that exist for a given user
   */
  accounts?: Account[]

  /**
   * List of channels available for a user to authenticate themselves with
   */
  authChannels?: TAuthChannel[]

  /**
   * If authentication channel chosed is WEB, then this is the url which a user
   * must visit to authenticate themselves. Provided by DFSP
   */
  authUri?: string

  /**
   * Secret token generated upon authentication
   */
  authToken?: string

  /**
   * Id of initiation party e.g- PISP
   */
  initiatorId?: string

  /**
   * Id of participant PISP/DFSP/party
   */
  participantId?: string

  /**
   * Array of Scope objects - which inform what actions are allowed for a given
   * user account
   */
  scopes?: TCredentialScope[]

  /**
   * Credential object used for authentication of consent
   */
  credential?: TCredential

  /**
   * If authentication channel chosed is WEB, then this is the uri that the DFSP must
   * redirect to after completing the login
   */
  callbackUri?: string
}
