/* eslint-disable @typescript-eslint/ban-ts-comment */
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
import { Server, server } from '@hapi/hapi'

import { logger } from '~/shared/logger'
import {
  AuthenticationResponseType,
} from '~/shared/ml-thirdparty-client/models/core'

import { ConsentHandler } from '~/server/plugins/internal/firestore'
import { Consent, ConsentStatus } from '~/models/consent'

// import * as validator from './consents.validator'
import { consentRepository } from '~/repositories/consent'

async function handleNewConsent(_: Server, consent: Consent) {
  // Assign a consentRequestId to the document and set the initial
  // status. This operation will create an event that triggers the execution
  // of the onUpdate function.
  consentRepository.updateConsentById(consent.id, {
    consentRequestId: uuid.v4(),
    status: ConsentStatus.PENDING_PARTY_LOOKUP,
  })
}

async function handlePartyLookup(server: Server, consent: Consent) {
  // Check whether the consent document has all the necessary properties
  // to perform a party lookup.
  //   if (validator.isValidPartyLookup(transaction)) {
  // Payee is guaranteed to be non-null by the validator.

  server.app.mojaloopClient.getParties(
    // @ts-ignore
    consent.party.partyIdInfo.partyIdType,
    // @ts-ignore
    consent.party.partyIdInfo.partyIdentifier
  )
  //   }
}

async function handleConsentRequest(
  server: Server,
  consent: Consent
) {
  // Upon receiving a callback from Mojaloop that contains information about
  // the payee, the server will update all relevant transaction documents
  // in the Firebase. However, we can just ignore all updates by the server
  // and wait for the user to confirm the payee by keying in more details
  // about the transaction (i.e., source account ID, consent ID, and
  // transaction amount).
  // if (validator.isValidPayeeConfirmation(consent)) {
    // If the update contains all the necessary fields, process document
    // to the next step by sending a transaction request to Mojaloop.

    try {
      // The optional values are guaranteed to exist by the validator.
      // eslint-disable @typescript-eslint/no-non-null-assertion

      consent = await consentRepository.getConsentById(
        consent.consentId!
      )

      server.app.mojaloopClient.postConsentRequests({
        id: consent.id!,
        initiatorId: string,
        accountIds: string[],
        authChannels: TAuthChannel[],
        scopes: string[],
        callbackUri: string,
      })

      // eslint-enable @typescript-eslint/no-non-null-assertion
    } catch (err) {
      logger.error(err)
    }
  // }
}

export const onCreate: ConsentHandler = async (
  server: Server,
  consent: Consent
): Promise<void> => {
  if (consent.status) {
    // Skip transaction that has been processed previously.
    // We need this because when the server starts for the first time,
    // all existing documents in the Firebase will be treated as a new
    // document.
    return
  }

  await handleNewConsent(server, consent)
}

export const onUpdate: ConsentHandler = async (
  server: Server,
  consent: Consent
): Promise<void> => {
  if (!consent.status) {
    // Status is expected to be null only when the document is created for the first
    // time by the user.
    logger.error('Invalid consent, undefined status.')
    return
  }

  switch (consent.status) {
    case ConsentStatus.PENDING_PARTY_LOOKUP:
      await handlePartyLookup(server, consent)
      break

    case ConsentStatus.AUTHORIZATION_REQUIRED:
      await handleAuthorization(server, consent)
      break
  }
}
