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
/* istanbul ignore file */
// TODO: BDD Testing will covered in separate ticket #1702

import * as uuid from 'uuid'
import { logger } from '~/shared/logger'

import { ConsentHandler } from '~/server/plugins/internal/firestore'
import { Consent, ConsentStatus } from '~/models/consent'

import { consentRepository } from '~/repositories/consent'
import * as validator from './consents.validator'
import config from '~/lib/config'
import { MissingConsentFieldsError, InvalidConsentStatusError } from '~/models/errors'

async function handleNewConsent(_: StateServer, consent: Consent) {
  // Assign a consentRequestId to the document and set the initial
  // status. This operation will create an event that triggers the execution
  // of the onUpdate function.

  // Not await-ing promise to resolve - code is executed asynchronously
  consentRepository.updateConsentById(consent.id, {
    consentRequestId: uuid.v4(),
    status: ConsentStatus.PENDING_PARTY_LOOKUP,
  })
}

async function initiatePartyLookup(server: StateServer, consent: Consent) {
  // Check whether the consent document has all the necessary properties
  // to perform a party lookup.
  if (!validator.isValidPartyLookup(consent)) {
    throw new MissingConsentFieldsError(consent)
  }

  // Fields are guaranteed to be non-null by the validator.
  try {
    server.app.mojaloopClient.getAccounts(
      consent.party!.partyIdInfo.partyIdentifier,
      consent.participantId!
    )
  } catch (error) {
    logger.error(error)
  }
}

async function initiateAuthentication(server: StateServer, consent: Consent) {
  if (!validator.isValidAuthentication(consent)) {
    throw new MissingConsentFieldsError(consent)
  }

  // Fields are guaranteed to be non-null by the validator.
  try {
    //@ts-ignore - TODO Implement
    server.app.mojaloopClient.putConsentRequests(
      consent.consentRequestId!,
      {
        initiatorId: consent.initiatorId!,
        authChannels: consent.authChannels!,
        scopes: consent.scopes!,
        authToken: consent.authToken!,
        // TODO: sdk standard components could be more strict here
        // these fields aren't needed here
        authUri: consent.authUri!,
        callbackUri: config.get('mojaloop').pispCallbackUri,
      },
      consent.party!.partyIdInfo.fspId!
    )
  } catch (error) {
    logger.error(error)
  }
}

async function initiateConsentRequest(server: StateServer, consent: Consent) {
  // TODO: mssing some fields... maybe we need to add them to the initial thingy
  console.log('initiateConsentRequest')
  if (!validator.isValidConsentRequest(consent)) {
    console.log('initiateConsentRequest - invalid fields')
    throw new MissingConsentFieldsError(consent)
  }
  // If the update contains all the necessary fields, process document

  try {
    // Fields are guaranteed to be non-null by the validator.
    server.app.mojaloopClient.postConsentRequests(
      {
        initiatorId: consent.initiatorId!,
        scopes: consent.scopes!,
        authChannels: consent.authChannels!,
        id: consent.consentRequestId!,
        callbackUri: config.get('mojaloop').pispCallbackUri,
      },
      consent.party!.partyIdInfo.fspId!
    )
  } catch (err) {
    logger.error(err)
  }
}

async function initiateChallengeGeneration(server: StateServer, consent: Consent) {
  if (!validator.isValidGenerateChallengeOrRevokeConsent(consent)) {
    throw new MissingConsentFieldsError(consent)
  }

  try {
    // Fields are guaranteed to be non-null by the validator.
    //@ts-ignore - TODO Implement
    server.app.mojaloopClient.postGenerateChallengeForConsent(
      consent.consentId!
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
    // Fields are guaranteed to be non-null by the validator.
    //@ts-ignore - TODO Implement
    server.app.mojaloopClient.putConsentId(
      consent.consentId!,
      {
        requestId: consent.consentRequestId!,
        initiatorId: consent.initiatorId!,
        participantId: consent.participantId!,
        scopes: consent.scopes!,
        credential: consent.credential!,
      },
      consent.party!.partyIdInfo.fspId!
    )
  } catch (error) {
    logger.error(error)
  }
}

async function initiateRevokingConsent(server: StateServer, consent: Consent) {
  if (!validator.isValidGenerateChallengeOrRevokeConsent(consent)) {
    throw new MissingConsentFieldsError(consent)
  }

  try {
    // Fields are guaranteed to be non-null by the validator.
    //@ts-ignore - TODO Implement
    server.app.mojaloopClient.postRevokeConsent(
      consent.consentId!,
      consent.party!.partyIdInfo.fspId!
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
      await initiatePartyLookup(server, consent)
      break

    case ConsentStatus.PENDING_PARTY_CONFIRMATION:
      console.log("no need to handle PENDING_PARTY_CONFIRMATION state - waiting for user input")
      break

    case ConsentStatus.PARTY_CONFIRMED:
      await initiateConsentRequest(server, consent)
      break

    case ConsentStatus.AUTHENTICATION_REQUIRED:
      console.log("no need to handle AUTHENTICATION_REQUIRED state - waiting for user input")
      break

    case ConsentStatus.AUTHENTICATION_COMPLETE:
      await initiateAuthentication(server, consent)
      break

    case ConsentStatus.CONSENT_GRANTED:
      await initiateChallengeGeneration(server, consent)
      break

    case ConsentStatus.CHALLENGE_GENERATED:
      console.log("no need to handle CHALLENGE_GENERATED state - waiting for user input")
      break

    case ConsentStatus.CHALLENGE_SIGNED:
      await handleSignedChallenge(server, consent)
      break

    // TODO: I don't think this is right...
    case ConsentStatus.ACTIVE:
      await handleSignedChallenge(server, consent)
      break

    case ConsentStatus.REVOKE_REQUESTED:
      await initiateRevokingConsent(server, consent)
      break

    default:
      throw new InvalidConsentStatusError(consent.status, consent.id)
  }
}
