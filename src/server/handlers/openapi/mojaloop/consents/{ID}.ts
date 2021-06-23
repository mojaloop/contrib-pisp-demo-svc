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

import { Request, ResponseToolkit } from '@hapi/hapi'
import { Handler, Context } from 'openapi-backend'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'

import { ConsentStatus } from '~/models/consent'
import { consentRepository } from '~/repositories/consent'
import { logger } from '~/shared/logger'

export const put: Handler = async (
  context: Context,
  _request: Request,
  h: ResponseToolkit
) => {
  logger.info(`handling PUT /consents/${context.request.params.ID}`)

  
  // Updates consent fields
  // Not await-ing promise to resolve - code is executed asynchronously

  // Status depends on the payload
  // if there is no signature, then it's awaiting signature
  let status = ConsentStatus.CHALLENGE_GENERATED
  switch (context.request.body.credential.status) {
    case "PENDING":
      status = ConsentStatus.CHALLENGE_GENERATED
      break;
    case "VERIFIED":
      status = ConsentStatus.ACTIVE
      break;
    default:
      throw new Error(`PUT /consents/{id} had unrecognized credential.status: ${context.request.body.credential.status}`)
  }

  consentRepository.updateConsent(
    {
      consentId: context.request.params.ID
    },
    {
      ...context.request.body,
      status
    }
  )
  return h.response().code(200)
}

async function handlePatchVerified(consentId: string, body: tpAPI.Schemas.ConsentsIDPatchResponseVerified) {
  console.log('handlePatchVerified!', consentId, body)

  //PATCH doesn't contain all the consent data, so let's look up the consent first
  const consent = await consentRepository.getConsentById(consentId)
  if (!consent.credential) {
    throw new Error('Recieved a PATCH /consents callback for a consent without an already saved credential. This should not happen')
  }

  let updatedCredential = consent.credential;
  updatedCredential.status = body.credential.status

  // Updates consent fields patched
  // Not await-ing promise to resolve - code is executed asynchronously
  consentRepository.updateConsent(
    {
      consentId
    },
    {
      credential: updatedCredential,
        // When we get the PATCH, we know this consent is active!
      status: ConsentStatus.ACTIVE
    }
  )
}

async function handlePatchRevoked(_consentId: string, _body: tpAPI.Schemas.ConsentsIDPatchResponseRevoked) {
  throw new Error('Unhandled Thirdparty API PATCH /consents/{ID} - revoke consent')
}

export const patch: Handler = async (
  context: Context,
  _request: Request,
  h: ResponseToolkit
) => {
  let consentId = context.request.params.ID 
  console.log("PATCH STUFF", consentId)
  if (Array.isArray(consentId)) {
    consentId = consentId[0]
  }
  logger.info(`handling PATCH /consents/${consentId}`)
  logger.debug(`Request body is: ${JSON.stringify(context.request.body, null, 2)}`)

  // A PATCH /consents/{ID} is either to verify the credential, or revoke the consent
  const body = context.request.body
  if (body.credential && body.credential.status === 'VERIFIED') {
    handlePatchVerified(consentId, body)
      .catch(err => {
        logger.error(`handlePatchVerified failed with Error: ${err}`)    
      })
  } else if (body.status === 'REVOKED' && body.revokedAt ){
    handlePatchRevoked(consentId, body)
      .catch(err => {
        logger.error(`handlePatchVerified failed with Error: ${err}`)
      })
  } else {
    logger.error(`Failed to handle PATCH /consents/${consentId} - invalid request body`)
    throw new Error(`Unhandled request body for request PATCH /consents/${consentId}`)
  }
 
  return h.response().code(200)
}

export const putError: Handler = async (context: Context, _: Request, h: ResponseToolkit) => {
  logger.error('putConsents error: ' + JSON.stringify(context.request.body, null, 2))
  // TODO: get error details...
  return h.response().code(200)
}

