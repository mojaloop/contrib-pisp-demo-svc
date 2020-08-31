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

import SDKStandardComponents, {
  TCredential,
} from '@mojaloop/sdk-standard-components'

export class ConsentFactory {
  public static createPutConsentRequestIdRequest(
    requestBody: SDKStandardComponents.PostConsentRequestsRequest
  ): SDKStandardComponents.PutConsentRequestsRequest {
    return {
      authChannels: ['WEB'],
      initiatorId: requestBody.initiatorId,
      accountIds: [],
      scopes: requestBody.scopes,
      authUri: 'dfsp.com',
      callbackUri: requestBody.callbackUri,
      authToken: 'y19jtyyd5oofj',
    }
  }

  public static createPostConsentRequest(
    consentRequestId: string,
    requestBody: SDKStandardComponents.PutConsentRequestsRequest
  ): SDKStandardComponents.PostConsentsRequest {
    return {
      id: '111',
      requestId: consentRequestId,
      initiatorId: requestBody.initiatorId,
      participantId: 'dfsp',
      scopes: requestBody.scopes,
      credential: (null as unknown) as TCredential,
    }
  }

  public static createPutConsentIdRequest(): SDKStandardComponents.PutConsentsRequest {
    return {
      initiatorId: 'pispA',
      participantId: 'dfspB',
      requestId: '99',
      scopes: [
        {
          accountId: '78910',
          actions: ['Rand Namibia Dollar', 'virtual'],
        },
      ],
      credential: {
        id: '997',
        credentialType: 'FIDO',
        status: 'PENDING',
        challenge: {
          signature: 'fzc2tz3sntrn6',
          payload: 'hr19lev48v9ky',
        },
        payload: 'fzc2tev48v9ky',
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
      revokedAt: '2020-08-31T08:33:23.751Z',
    }
  }
}
