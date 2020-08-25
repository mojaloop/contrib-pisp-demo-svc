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

import * as uuid from 'uuid'
import { Server } from '@hapi/hapi'

import * as utils from '~/lib/utils'
import { logger } from '~/shared/logger'
import {
  AmountType,
  AuthenticationResponseType,
} from '~/shared/ml-thirdparty-client/models/core'

import { ConsentHandler } from '~/server/plugins/internal/firestore'
import { Consent } from '~/models/consent'
import { Status } from '~/models/transaction'

// import * as validator from './consents.validator'
import { consentRepository } from '~/repositories/consent'

async function handleNewConsent(_: Server, consent: Consent) {
  // Assign a transactionRequestId to the document and set the initial
  // status. This operation will create an event that triggers the execution
  // of the onUpdate function.
  consentRepository.updateConsentById(consent.id, {
    consentRequestId: uuid.v4(),
    status: Status.PENDING_PARTY_LOOKUP,
  })
}

export const onCreate: ConsentHandler = async (
  server: Server,
  consent: Consent
): Promise<void> => {
//   if (transaction.status) {
//     // Skip transaction that has been processed previously.
//     // We need this because when the server starts for the first time,
//     // all existing documents in the Firebase will be treated as a new
//     // document.
//     return
//   }

  await handleNewConsent(server, consent)
}
