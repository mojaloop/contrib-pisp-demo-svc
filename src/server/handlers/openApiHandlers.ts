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

import { Handler } from 'openapi-backend'

import * as Health from './health'

import * as AppAuthorizationsById from './app/authorizations/{ID}'
import * as AppConsentRequests from './app/consentRequests'
import * as AppConsentRequestsById from './app/consentRequests/{ID}'
import * as AppConsentsById from './app/consents/{ID}'
import * as AppConsentsByIdGenerateChallenge from './app/consents/{ID}/generateChallenge'
import * as AppParticipants from './app/participants'
import * as AppPartiesByTypeAndId from './app/parties/{Type}/{ID}'
import * as AppThirdpartyRequestsTransactions from './app/thirdpartyRequests/transactions'

import * as MojaloopAuthorizations from './mojaloop/authorizations'
import * as MojaloopConsents from './mojaloop/consents'
import * as MojaloopConsentsById from './mojaloop/consents/{ID}'
import * as MojaloopConsentRequestsById from './mojaloop/consentRequests/{ID}'
import * as MojaloopParticipants from './mojaloop/participants'
import * as MojaloopParticipantsError from './mojaloop/participants/error'
import * as MojaloopPartiesByTypeAndId from './mojaloop/parties/{Type}/{ID}'
import * as MojaloopPartiesByTypeAndIdError from './mojaloop/parties/{Type}/{ID}/error'
import * as MojaloopThirdpartyRequestsTransactionsById from './mojaloop/thirdpartyRequests/transactions/{ID}'

export interface OpenApiHandlers {
  getHealth: Handler

  putAppAuthorizationsById: Handler
  postAppConsentRequests: Handler
  putAppConsentRequestsById: Handler
  putAppConsentsById: Handler
  deleteAppConsentsById: Handler
  postAppConsentsByIdGenerateChallenge: Handler
  getAppParticipants: Handler
  getAppPartiesByTypeAndId: Handler
  postAppThirdpartyRequestsTransactions: Handler

  postMojaloopAuthorizations: Handler
  postMojaloopConsents: Handler
  putMojaloopConsentsById: Handler
  deleteMojaloopConsentsById: Handler
  putMojaloopConsentRequestsById: Handler
  putMojaloopParticipants: Handler
  putMojaloopParticipantsError: Handler
  putMojaloopPartiesByTypeAndId: Handler
  putMojaloopPartiesByTypeAndIdError: Handler
  putMojaloopThirdpartyRequestsTransactionsById: Handler
}

export const openApiHandlers: OpenApiHandlers = {
  getHealth: Health.get,

  putAppAuthorizationsById: AppAuthorizationsById.put,
  postAppConsentRequests: AppConsentRequests.post,
  putAppConsentRequestsById: AppConsentRequestsById.put,
  putAppConsentsById: AppConsentsById.put,
  deleteAppConsentsById: AppConsentsById.remove,
  postAppConsentsByIdGenerateChallenge: AppConsentsByIdGenerateChallenge.post,
  getAppParticipants: AppParticipants.get,
  getAppPartiesByTypeAndId: AppPartiesByTypeAndId.get,
  postAppThirdpartyRequestsTransactions: AppThirdpartyRequestsTransactions.post,

  postMojaloopAuthorizations: MojaloopAuthorizations.post,
  postMojaloopConsents: MojaloopConsents.post,
  putMojaloopConsentsById: MojaloopConsentsById.put,
  deleteMojaloopConsentsById: MojaloopConsentsById.remove,
  putMojaloopConsentRequestsById: MojaloopConsentRequestsById.put,
  putMojaloopParticipants: MojaloopParticipants.put,
  putMojaloopParticipantsError: MojaloopParticipantsError.put,
  putMojaloopPartiesByTypeAndId: MojaloopPartiesByTypeAndId.put,
  putMojaloopPartiesByTypeAndIdError: MojaloopPartiesByTypeAndIdError.put,
  putMojaloopThirdpartyRequestsTransactionsById: MojaloopThirdpartyRequestsTransactionsById.put,
}
