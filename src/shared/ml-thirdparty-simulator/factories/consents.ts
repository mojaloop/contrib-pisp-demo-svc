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

import { thirdparty as tpAPI } from '@mojaloop/api-snippets'
import * as faker from 'faker'

export class ConsentFactory {
  public static createPutConsentRequestIdRequest(
    requestBody: tpAPI.Schemas.ConsentRequestsPostRequest
  ): tpAPI.Schemas.ConsentRequestsIDPutResponseWeb | tpAPI.Schemas.ConsentRequestsIDPutResponseOTP {
    return {
      consentRequestId: requestBody.consentRequestId,
      // TODO: make configurable
      authChannels: ['OTP'],
      scopes: requestBody.scopes,
      callbackUri: requestBody.callbackUri,
    }
  }

  public static createPostConsentRequest(
    consentRequestId: string,
  ): tpAPI.Schemas.ConsentsPostRequestPISP {
    const scopes: Array<tpAPI.Schemas.Scope> = [
      {
        accountId: faker.random.uuid(),
        actions: ['accounts.getBalance', 'accounts.transfer'],
      },
      {
        accountId: faker.random.uuid(),
        actions: ['accounts.getBalance'],
      },
    ]

    return {
      consentId: faker.random.uuid(),
      consentRequestId,
      scopes
    }
  }

  public static createPutConsentIdValidationRequest(
    requestBody: tpAPI.Schemas.ConsentsIDPutResponseSigned | tpAPI.Schemas.ConsentsIDPutResponseVerified
  ): tpAPI.Schemas.ConsentsIDPutResponseVerified {
    const validatedConsent: tpAPI.Schemas.ConsentsIDPutResponseVerified = {
      scopes: requestBody.scopes,
      credential: {
        ...requestBody.credential,
        status: 'VERIFIED',
      }
    }

    return validatedConsent;
  }

  public static createPatchConsentRevokeRequest(): Record<string, string> {
    return {
      status: 'REVOKED',
      revokedAt: new Date().toISOString(),
    }
  }
}
