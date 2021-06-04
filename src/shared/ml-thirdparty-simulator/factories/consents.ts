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
 - Abhimanyu Kapur <abhi.kapur09@gmail.com>
 --------------
 ******/
/* istanbul ignore file */

import * as faker from 'faker'

import SDKStandardComponents, { TAuthChannel } from '@mojaloop/sdk-standard-components'
import config from '~/lib/config'

export class ConsentFactory {
  public static createPutConsentRequestIdRequest(
    requestBody: SDKStandardComponents.PostConsentRequestsRequest
  ): SDKStandardComponents.PutConsentRequestsRequest {
    return {
      authChannels: [config.get('simulatorDefaultAuthChannel') as TAuthChannel],
      initiatorId: requestBody.initiatorId,
      scopes: requestBody.scopes,
      authUri: 'https://dfspAuth.com',
      callbackUri: requestBody.callbackUri,
      authToken: faker.random.alphaNumeric(13),
    }
  }

  public static createPostConsentRequest(
    consentRequestId: string,
    requestBody: SDKStandardComponents.PutConsentRequestsRequest
  ): SDKStandardComponents.PostConsentsRequest {
    return {
      id: faker.random.uuid(),
      requestId: consentRequestId,
      initiatorId: requestBody.initiatorId,
      participantId: 'dfsp',
      scopes: requestBody.scopes,
    }
  }

  public static createPutConsentIdRequest(): SDKStandardComponents.PutConsentsRequest {
    return {
      initiatorId: 'pispA',
      participantId: 'dfspB',
      requestId: faker.random.uuid(),
      scopes: [
        {
          accountId: faker.random.uuid(),
          actions: [faker.random.word(), faker.random.word()],
        },
      ],
      credential: {
        id: faker.random.uuid(),
        credentialType: 'FIDO',
        status: 'PENDING',
        challenge: {
          signature: faker.random.alphaNumeric(13),
          payload: faker.random.alphaNumeric(13),
        },
        payload: faker.random.alphaNumeric(13),
      },
    }
  }

  public static createPutConsentIdValidationRequest(
    requestBody: SDKStandardComponents.PutConsentsRequest
  ): SDKStandardComponents.PutConsentsRequest {
    requestBody.credential.status = 'VERIFIED'
    return requestBody
  }

  public static createPatchConsentRevokeRequest(): Record<string, string> {
    return {
      status: 'REVOKED',
      revokedAt: new Date().toISOString(),
    }
  }
}
