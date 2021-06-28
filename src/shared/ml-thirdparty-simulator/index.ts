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

import { ServerInjectResponse } from '@hapi/hapi'
import { PartyIdType } from '~/shared/ml-thirdparty-client/models/core'
import {
  ThirdPartyTransactionRequest,
} from '~/shared/ml-thirdparty-client/models/openapi'
import { thirdparty as tpAPI } from '@mojaloop/api-snippets'

import { ParticipantFactory } from './factories/participant'
import { PartyFactory } from './factories/party'
import { AuthorizationFactory } from './factories/authorization'
import { TransferFactory } from './factories/transfer'
import { Options } from './options'
import { ConsentFactory } from './factories/consents'
import { MojaloopClient } from '../ml-thirdparty-client'
import { logger } from '../logger'

/**
 * Simulator allows Mojaloop's client to mock out the communication and return
 * randomly generated replies. This is useful to aid the testing process when
 * Mojaloop is not deployed.
 */
export class Simulator implements MojaloopClient {
  /**
   * A server object to be used to inject the fake Mojaloop callbacks.
   */
  private server: StateServer

  /**
   * An object that keeps the configuration for the simulator.
   */
  private options: Options

  /**
   * Constructor for the Mojaloop simulator.
   *
   * @param server a server object to be used to inject the fake Mojaloop callbacks.
   * @param options a configuration object for the simulator.
   */
  constructor(server: StateServer, options?: Options) {
    this.server = server
    this.options = options ?? { delay: 0 }

    if (this.options.numOfParticipants) {
      ParticipantFactory.numOfParticipants = this.options.numOfParticipants
    }
  }

  public async getAccounts(idValue: string, _destParticipantId: string): Promise<unknown> {
    logger.info("simulator: getAccounts")
    const targetUrl = '/mojaloop/accounts/' + idValue
    const payload = PartyFactory.createPutAccountsRequest(idValue)

    // Delay operations to simulate network latency in real communication
    // with Mojaloop.
    await this.delay(this.options.delay)


    // Inject a request to the server as if it receives an inbound request
    // from Mojaloop.
    await this.server.inject({
      method: 'PUT',
      url: targetUrl,
      headers: {
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })

    return null;
  }

  /**
   * Simulates a party lookup operation in Mojaloop, without the need of
   * sending `GET /parties/{Type}/{ID}` request.
   *
   * @param type  type of the party identifier.
   * @param id    the party identifier.
   */
  public async getParties(
    type: PartyIdType,
    id: string,
    _idSubValue?: string
  ): Promise<unknown> {

    logger.info("simulator: getParties")

    //TODO: handle idSubValue
    const targetUrl = '/mojaloop/parties/' + type.toString() + '/' + id
    const payload = PartyFactory.createPutPartiesRequest(type, id)

    await this.delay(this.options.delay)
    

    // Inject a request to the server as if it receives an inbound request
    // from Mojaloop.
    await this.server.inject({
      method: 'PUT',
      url: targetUrl,
      headers: {
        host: this.options.host ?? '',
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })

    return null;
  }

  /**
   * Performs a request for a new consent in Mojaloop by third-party application,
   * without the need of sending `POST /consentRequest` request.
   *
   * @param requestBody         an consent request object as defined by the Mojaloop API.
   */
  public async postConsentRequests(
    requestBody: tpAPI.Schemas.ConsentRequestsPostRequest,
  ): Promise<ServerInjectResponse> {
    logger.info("simulator: postConsentRequests")

    const targetUrl = '/mojaloop/consentRequests/' + requestBody.consentRequestId
    const payload = ConsentFactory.createPutConsentRequestIdRequest(requestBody)

    return this.server.inject({
      method: 'PUT',
      url: targetUrl,
      headers: {
        host: this.options.host ?? '',
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  }


  // TODO: is this deprecated? I think it's replaced by PATCH /consentRequest/{ID}
  /**
   * Performs a put request with registered consent credential in Mojaloop by third-party application,
   * without the need of sending `POST /consents/{ID}/generateChallenge` request.
   *
   * @param consentId     identifier of consent as defined by Mojaloop API.
   * @param requestBody         an object to authenticate consent as defined by the Mojaloop API.
   */
  public async putConsentId(
    consentId: string,
    requestBody: tpAPI.Schemas.ConsentsIDPutResponseSigned | tpAPI.Schemas.ConsentsIDPutResponseVerified,
  ): Promise<ServerInjectResponse> {
    logger.info("simulator: putConsentId")

    const targetUrl = '/mojaloop/consents/' + consentId
    const payload = ConsentFactory.createPutConsentIdValidationRequest(
      requestBody
    )

    return this.server.inject({
      method: 'PUT',
      url: targetUrl,
      headers: {
        host: this.options.host ?? '',
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  }

  /**
    * Performs an authorization with `PATCH /consentRequests/{id}`
    * and generates a mock `POST /consents` callback
    *
    * @param consentRequestId
    * @param requestBody
    * @param destParticipantId
    */
  public async patchConsentRequests(
    consentRequestId: string,
    _requestBody: tpAPI.Schemas.ConsentRequestsIDPatchRequest,
    _destParticipantId: string
  ): Promise<ServerInjectResponse> {
    logger.info("simulator: patchConsentId")

    const targetUrl = '/mojaloop/consents'
    const payload = ConsentFactory.createPostConsentRequest(consentRequestId)

    return this.server.inject({
      method: 'POST',
      url: targetUrl,
      headers: {
        host: this.options.host ?? '',
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })

  }

  /**
   * Simulates a transaction initiation in Mojaloop by third-party application,
   * without the need of sending `POST /thirdpartyRequests/transactions` request.
   *
   * @param request a transaction request object as defined by the Mojaloop API.
   */
  public async postTransactions(
    request: tpAPI.Schemas.ThirdpartyRequestsTransactionsPostRequest
  ): Promise<ServerInjectResponse> {
    // TODO: there should be both a PUT /thirdpartyRequests/transactions and
    // POST /authorizations call here.
    const targetUrl = '/mojaloop/authorizations'
    const payload = AuthorizationFactory.createPostAuthorizationsRequest(
      request
    )

    logger.info("simulator: postTransactions")

    // Delay operations to simulate network latency in real communication
    // with Mojaloop.
    await this.delay(this.options.delay)

    return this.server.inject({
      method: 'POST',
      url: targetUrl,
      headers: {
        host: this.options.host ?? '',
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  }
  /**
   * Simulates a transaction authorization in Mojaloop by third-party application,
   * without the need of sending `PUT /authorizations/{ID}` request.
   *
   * @param id            the transaction request ID that is used to identify the
   *                      authorization.
   * @param request       a transaction authorization object as defined by the Mojaloop API.
   * @param transactionId the transaction ID that is associated with the request. This
   *                      value is required by the simulator as it will be contained in the
   *                      response object.
   */
  public async putAuthorizations(
    id: string,
    _requestBody: tpAPI.Schemas.ThirdpartyRequestsTransactionsIDAuthorizationsPutResponse,
    _transactionId: string
  ): Promise<ServerInjectResponse> {
    // const targetUrl = '/mojaloop/transfers/' + faker.random.uuid()
    // TODO: this id should be already known... and 
    const targetUrl = `/mojaloop/thirdpartyRequests/transactions/${id}`
    const payload = TransferFactory.createTransactionRequestPatchRequest(
      id,
    )

    return this.server.inject({
      method: 'PATCH',
      url: targetUrl,
      headers: {
        host: this.options.host ?? '',
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  }

  /**
   * Simulates looking up list of PISP/DFSP participants
   */
  public async getParticipants(): Promise<ServerInjectResponse> {
    const targetUrl = '/participants'
    const payload = ParticipantFactory.getParticipants()

    return this.server.inject({
      method: 'PUT',
      url: targetUrl,
      headers: {
        host: this.options.host ?? '',
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  }

  // TODO: remove this - it's been replaced by patchConsentRequests
  /**
   * Performs a put request with authenticated consent request in Mojaloop by third-party application,
   * without the need of sending `PUT /consentRequest/{ID}` request.
   *
   * @param consentRequestId    unique identifier of the consent request
   * @param requestBody         an object to authenticate consent as defined by the Mojaloop API.
   */
  public async putConsentRequests(
    consentRequestId: string,
    _requestBody: tpAPI.Schemas.ConsentRequestsIDPutResponseOTP |
      tpAPI.Schemas.ConsentRequestsIDPutResponseWeb,
  ): Promise<ServerInjectResponse> {
    logger.warn('deprecated putConsentRequests called! - this code will be removed shortly and break things')
    logger.info("simulator: putConsentRequests")

    // const targetUrl = '/mojaloop/consentRequests/' + consentRequestId
    const targetUrl = '/mojaloop/consents'
    const payload = ConsentFactory.createPostConsentRequest(
      consentRequestId,
    )

    return this.server.inject({
      method: 'POST',
      url: targetUrl,
      headers: {
        host: this.options.host ?? '',
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  }

  /**
   * Performs a request to revoke the Consent object and unlink in Mojaloop by third-party application,
   * without the need of sending `POST /consents/{ID}/generateChallenge` request.
   *
   * @param consentId     identifier of consent as defined by Mojaloop API.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async postRevokeConsent(
    consentId: string
  ): Promise<ServerInjectResponse> {
    // TODO: Refactor once implemented in sdk-standard components
    const targetUrl = '/consents/' + consentId
    const payload = ConsentFactory.createPatchConsentRevokeRequest()

    return this.server.inject({
      method: 'PATCH',
      url: targetUrl,
      headers: {
        host: this.options.host ?? '',
        'Content-Length': JSON.stringify(payload).length.toString(),
        'Content-Type': 'application/json',
      },
      payload,
    })
  }

  /**
   * Returns a promise that will be resolved after a certain duration.
   *
   * @param ms the length of delay in milisecond.
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
