/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import { logger } from '~/shared/logger'

import { ConsentHandler } from '~/server/plugins/internal/firestore'
import { Consent, ConsentStatus } from '~/models/consent'

import { consentRepository } from '~/repositories/consent'
import * as validator from './consents.validator'
import {
  TCredentialScope,
  TAuthChannel,
  TCredential,
} from '@mojaloop/sdk-standard-components'
import config from '~/lib/config'
import { MissingConsentFieldsError } from '~/models/errors'

async function handleNewConsent(_: StateServer, consent: Consent) {
  // Assign a consentRequestId to the document and set the initial
  // status. This operation will create an event that triggers the execution
  // of the onUpdate function.
  consentRepository.updateConsentById(consent.id, {
    consentRequestId: uuid.v4(),
    status: ConsentStatus.PENDING_PARTY_LOOKUP,
  })
}

async function handlePartyLookup(server: StateServer, consent: Consent) {
  // Check whether the consent document has all the necessary properties
  // to perform a party lookup.
  if (!validator.isValidPartyLookup(consent)) {
    throw new MissingConsentFieldsError(consent)
  }

  // Party is guaranteed to be non-null by the validator.
  try {
    server.app.mojaloopClient.getParties(
      consent.party!.partyIdInfo.partyIdType,
      consent.party!.partyIdInfo.partyIdentifier
    )
  } catch (error) {
    logger.error(error)
  }
}

async function handleAuthentication(server: StateServer, consent: Consent) {
  if (!validator.isValidAuthentication(consent)) {
    throw new MissingConsentFieldsError(consent)
  }

  try {
    server.app.mojaloopClient.putConsentRequests(
      consent.id,
      {
        initiatorId: consent.initiatorId as string,
        authChannels: consent.authChannels as TAuthChannel[],
        scopes: consent.scopes as TCredentialScope[],
        authUri: consent.authUri as string,
        callbackUri: config.get('mojaloop').callbackUri,
        authToken: consent.authToken as string,
      },
      consent.party!.partyIdInfo.fspId as string
    )
  } catch (error) {
    logger.error(error)
  }
}

async function handleConsentRequest(server: StateServer, consent: Consent) {
  if (!validator.isValidConsentRequest(consent)) {
    throw new MissingConsentFieldsError(consent)
  }
  // If the update contains all the necessary fields, process document

  try {
    // The optional values are guaranteed to exist by the validator.

    server.app.mojaloopClient.postConsentRequests(
      {
        initiatorId: consent.initiatorId as string,
        scopes: consent.scopes as TCredentialScope[],
        authChannels: consent.authChannels as TAuthChannel[],
        id: consent.id,
        callbackUri: config.get('mojaloop').callbackUri,
      },
      consent.party!.partyIdInfo.fspId as string
    )
  } catch (err) {
    logger.error(err)
  }
}

async function handleChallengeGeneration(server: StateServer, consent: Consent) {
  if (!validator.isValidChallengeGeneration(consent)) {
    throw new MissingConsentFieldsError(consent)
  }

  try {
    server.app.mojaloopClient.postGenerateChallengeForConsent(
      consent.consentId as string,
      consent.party!.partyIdInfo.fspId as string
    )
  } catch (error) {
    logger.error(error)
  }
}

async function handleSignedChallenge(server: StateServer, consent: Consent) {
  if (!validator.isValidSignedChallenge(consent)) {
    throw new MissingConsentFieldsError(consent)
  }

  try {
    server.app.mojaloopClient.putConsentId(
      consent.consentId as string,
      {
        requestId: consent.id,
        initiatorId: consent.initiatorId as string,
        participantId: consent.participantId as string,
        scopes: consent.scopes as TCredentialScope[],
        credential: consent.credential as TCredential,
      },
      consent.party!.partyIdInfo.fspId as string
    )
  } catch (error) {
    logger.error(error)
  }
}

async function handleRevokingConsent(server: StateServer, consent: Consent) {
  if (!validator.isValidRevokeConsent(consent)) {
    throw new MissingConsentFieldsError(consent)
  }

  try {
    // Make outgoing POST consents/{ID}/revoke request to Mojaloop
    server.app.mojaloopClient.postRevokeConsent(
      consent.consentId as string,
      consent.party!.partyIdInfo.fspId as string
    )
  } catch (error) {
    logger.error(error)
  }
}

export const onCreate: ConsentHandler = async (
  server: StateServer,
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
  server: StateServer,
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

    case ConsentStatus.PENDING_PARTY_CONFIRMATION:
      await handleConsentRequest(server, consent)
      break

    case ConsentStatus.AUTHENTICATION_REQUIRED:
      await handleAuthentication(server, consent)
      break

    case ConsentStatus.CONSENT_GRANTED:
      await handleChallengeGeneration(server, consent)
      break

    case ConsentStatus.ACTIVE:
      await handleSignedChallenge(server, consent)
      break

    case ConsentStatus.REVOKE_REQUESTED:
      await handleRevokingConsent(server, consent)
      break
  }
}
