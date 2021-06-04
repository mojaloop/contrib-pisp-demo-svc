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

import SDKStandardComponents from '@mojaloop/sdk-standard-components'
import config from '~/lib/config'

export class ConsentFactory {
  public static createPutConsentRequestIdRequest(
    requestBody: SDKStandardComponents.PostConsentRequestsRequest
  ): SDKStandardComponents.PutConsentRequestsRequest {
    return {
      authChannels: ['WEB'],
      initiatorId: requestBody.initiatorId,
      scopes: requestBody.scopes,
      authUri: config.get('simulatorAuthUri'),
      callbackUri: requestBody.callbackUri,
      authToken: 'y19jtyyd5oofj',
    }
  }

  public static createPostConsentRequest(
    consentRequestId: string,
    requestBody: SDKStandardComponents.PostConsentsRequest
  ): SDKStandardComponents.PostConsentsRequest {
    return {
      id: '111',
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
      requestId: '99',
      scopes: [
        {
          accountId: '78910',
          actions: ['Rand Namibia Dollar', 'virtual'],
        },
      ],
      credential: {
        credentialType: 'FIDO',
        status: 'PENDING',
        payload: {
          id: 'ooX6LjPwYU0rFhDa8VgoWXrLvOfbyVBBs1_EcpvXZ0wqJBbXQYCNQx-rFrL2Hk2YEEY_AHnVeQ7nSv6wDr_e-A',
          rawId: Uint8Array.from([162, 133, 250, 46, 51, 240, 97, 77, 43, 22, 16, 218, 241, 88, 40, 89, 122, 203, 188, 231, 219, 201, 80, 65, 179, 95, 196, 114, 155, 215, 103, 76, 42, 36, 22, 215, 65, 128, 141, 67, 31, 171, 22, 178, 246, 30, 77, 152, 16, 70, 63, 0, 121, 213, 121, 14, 231, 74, 254, 176, 14, 191, 222, 248]),
          response: {
            attestationObject: Uint8Array.from([163, 99, 102, 109, 116, 102, 112, 97, 99, 107, 101, 100, 103, 97, 116, 116, 83, 116, 109, 116, 163, 99, 97, 108, 103, 38, 99, 115, 105, 103, 88, 71, 48, 69, 2, 33, 0, 193, 203, 134, 57, 180, 61, 102, 242, 245, 96, 27, 140, 83, 17, 241, 180, 171, 44, 138, 234, 70, 43, 192, 117, 40, 54, 165, 185, 51, 87, 30, 31, 2, 32, 114, 220, 38, 119, 123, 4, 98, 8, 48, 249, 135, 170, 189, 210, 162, 95, 62, 85, 71, 238, 126, 241, 143, 121, 82, 118, 193, 125, 72, 183, 35, 134, 99, 120, 53, 99, 129, 89, 2, 193, 48, 130, 2, 189, 48, 130, 1, 165, 160, 3, 2, 1, 2, 2, 4, 11, 5, 205, 83, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 11, 5, 0, 48, 46, 49, 44, 48, 42, 6, 3, 85, 4, 3, 19, 35, 89, 117, 98, 105, 99, 111, 32, 85, 50, 70, 32, 82, 111, 111, 116, 32, 67, 65, 32, 83, 101, 114, 105, 97, 108, 32, 52, 53, 55, 50, 48, 48, 54, 51, 49, 48, 32, 23, 13, 49, 52, 48, 56, 48, 49, 48, 48, 48, 48, 48, 48, 90, 24, 15, 50, 48, 53, 48, 48, 57, 48, 52, 48, 48, 48, 48, 48, 48, 90, 48, 110, 49, 11, 48, 9, 6, 3, 85, 4, 6, 19, 2, 83, 69, 49, 18, 48, 16, 6, 3, 85, 4, 10, 12, 9, 89, 117, 98, 105, 99, 111, 32, 65, 66, 49, 34, 48, 32, 6, 3, 85, 4, 11, 12, 25, 65, 117, 116, 104, 101, 110, 116, 105, 99, 97, 116, 111, 114, 32, 65, 116, 116, 101, 115, 116, 97, 116, 105, 111, 110, 49, 39, 48, 37, 6, 3, 85, 4, 3, 12, 30, 89, 117, 98, 105, 99, 111, 32, 85, 50, 70, 32, 69, 69, 32, 83, 101, 114, 105, 97, 108, 32, 49, 56, 52, 57, 50, 57, 54, 49, 57, 48, 89, 48, 19, 6, 7, 42, 134, 72, 206, 61, 2, 1, 6, 8, 42, 134, 72, 206, 61, 3, 1, 7, 3, 66, 0, 4, 33, 26, 111, 177, 181, 137, 37, 203, 10, 193, 24, 95, 124, 42, 227, 168, 180, 136, 16, 20, 121, 177, 30, 255, 245, 85, 224, 125, 151, 81, 189, 43, 23, 106, 37, 45, 238, 89, 236, 227, 133, 153, 32, 91, 179, 234, 40, 191, 143, 215, 252, 125, 167, 92, 5, 66, 114, 174, 72, 88, 229, 145, 252, 90, 163, 108, 48, 106, 48, 34, 6, 9, 43, 6, 1, 4, 1, 130, 196, 10, 2, 4, 21, 49, 46, 51, 46, 54, 46, 49, 46, 52, 46, 49, 46, 52, 49, 52, 56, 50, 46, 49, 46, 49, 48, 19, 6, 11, 43, 6, 1, 4, 1, 130, 229, 28, 2, 1, 1, 4, 4, 3, 2, 4, 48, 48, 33, 6, 11, 43, 6, 1, 4, 1, 130, 229, 28, 1, 1, 4, 4, 18, 4, 16, 20, 154, 32, 33, 142, 246, 65, 51, 150, 184, 129, 248, 213, 183, 241, 245, 48, 12, 6, 3, 85, 29, 19, 1, 1, 255, 4, 2, 48, 0, 48, 13, 6, 9, 42, 134, 72, 134, 247, 13, 1, 1, 11, 5, 0, 3, 130, 1, 1, 0, 62, 254, 163, 223, 61, 42, 224, 114, 87, 143, 126, 4, 208, 221, 90, 75, 104, 219, 1, 175, 232, 99, 46, 24, 180, 224, 184, 115, 67, 24, 145, 25, 108, 24, 75, 235, 193, 213, 51, 162, 61, 119, 139, 177, 4, 8, 193, 185, 170, 65, 78, 117, 118, 133, 91, 9, 54, 151, 24, 179, 72, 175, 92, 239, 108, 176, 48, 134, 114, 214, 31, 184, 189, 155, 134, 161, 10, 166, 130, 206, 140, 45, 78, 240, 144, 237, 80, 84, 24, 254, 83, 212, 206, 30, 98, 122, 40, 243, 114, 3, 9, 88, 208, 143, 250, 89, 27, 196, 24, 128, 225, 142, 138, 12, 237, 26, 133, 128, 127, 144, 150, 113, 65, 122, 11, 69, 50, 21, 179, 141, 193, 71, 42, 36, 73, 118, 64, 180, 232, 107, 254, 196, 241, 84, 99, 155, 133, 184, 232, 128, 20, 150, 54, 36, 56, 53, 89, 1, 43, 252, 135, 124, 11, 68, 236, 125, 167, 148, 210, 6, 84, 178, 154, 220, 29, 186, 92, 80, 123, 240, 202, 109, 243, 82, 188, 205, 222, 116, 13, 46, 167, 225, 8, 36, 162, 206, 57, 79, 144, 77, 29, 153, 65, 94, 58, 124, 69, 181, 254, 40, 122, 155, 203, 220, 105, 142, 139, 220, 213, 180, 121, 138, 92, 237, 53, 222, 138, 53, 9, 2, 10, 20, 183, 38, 191, 191, 57, 167, 68, 7, 156, 185, 143, 91, 157, 202, 9, 183, 195, 235, 188, 189, 162, 175, 105, 3, 104, 97, 117, 116, 104, 68, 97, 116, 97, 88, 196, 73, 150, 13, 229, 136, 14, 140, 104, 116, 52, 23, 15, 100, 118, 96, 91, 143, 228, 174, 185, 162, 134, 50, 199, 153, 92, 243, 186, 131, 29, 151, 99, 65, 0, 0, 0, 4, 20, 154, 32, 33, 142, 246, 65, 51, 150, 184, 129, 248, 213, 183, 241, 245, 0, 64, 162, 133, 250, 46, 51, 240, 97, 77, 43, 22, 16, 218, 241, 88, 40, 89, 122, 203, 188, 231, 219, 201, 80, 65, 179, 95, 196, 114, 155, 215, 103, 76, 42, 36, 22, 215, 65, 128, 141, 67, 31, 171, 22, 178, 246, 30, 77, 152, 16, 70, 63, 0, 121, 213, 121, 14, 231, 74, 254, 176, 14, 191, 222, 248, 165, 1, 2, 3, 38, 32, 1, 33, 88, 32, 36, 35, 188, 28, 126, 126, 236, 185, 97, 7, 15, 131, 125, 3, 8, 216, 52, 120, 168, 14, 38, 85, 242, 133, 251, 63, 89, 88, 108, 249, 99, 31, 34, 88, 32, 119, 199, 72, 241, 178, 48, 8, 123, 128, 222, 104, 239, 126, 242, 17, 80, 21, 182, 40, 161, 95, 22, 185, 131, 241, 34, 200, 175, 64, 55, 15, 232]),
            clientDataJSON: Uint8Array.from([123, 34, 116, 121, 112, 101, 34, 58, 34, 119, 101, 98, 97, 117, 116, 104, 110, 46, 99, 114, 101, 97, 116, 101, 34, 44, 34, 99, 104, 97, 108, 108, 101, 110, 103, 101, 34, 58, 34, 78, 65, 66, 109, 65, 71, 85, 65, 77, 65, 66, 109, 65, 68, 77, 65, 89, 81, 66, 106, 65, 68, 81, 65, 89, 81, 66, 107, 65, 68, 107, 65, 79, 65, 65, 49, 65, 68, 89, 65, 79, 81, 65, 53, 65, 71, 81, 65, 79, 65, 65, 122, 65, 71, 77, 65, 89, 119, 66, 105, 65, 68, 89, 65, 77, 103, 65, 53, 65, 68, 77, 65, 89, 119, 65, 48, 65, 68, 107, 65, 77, 65, 65, 48, 65, 71, 73, 65, 77, 119, 66, 106, 65, 68, 85, 65, 77, 103, 65, 53, 65, 68, 99, 65, 79, 65, 66, 106, 65, 68, 73, 65, 89, 103, 65, 53, 65, 71, 81, 65, 77, 119, 65, 122, 65, 68, 77, 65, 77, 65, 66, 107, 65, 71, 85, 65, 90, 81, 65, 52, 65, 71, 73, 65, 77, 81, 65, 52, 65, 71, 81, 65, 89, 119, 65, 121, 65, 68, 107, 65, 78, 65, 66, 107, 65, 68, 103, 65, 89, 81, 65, 34, 44, 34, 111, 114, 105, 103, 105, 110, 34, 58, 34, 104, 116, 116, 112, 58, 47, 47, 108, 111, 99, 97, 108, 104, 111, 115, 116, 58, 53, 48, 48, 48, 34, 44, 34, 99, 114, 111, 115, 115, 79, 114, 105, 103, 105, 110, 34, 58, 102, 97, 108, 115, 101, 125]),
          }
        }
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
