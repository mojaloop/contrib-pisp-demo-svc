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
 - Raman Mangla <ramanmangla@google.com>
 - Abhimanyu Kapur <abhi.kapur09@gmail.com>
 --------------
 ******/

import { Simulator } from '~/shared/ml-thirdparty-simulator'
import { PartyIdType } from './models/core'
import { Options } from './options'

import {
  AuthorizationsPutIdRequest,
  ThirdPartyTransactionRequest,
} from './models/openapi'

import Logger from '@mojaloop/central-services-logger'

import SDKStandardComponents, {
  // TODO: Once implemented in sdk-standard-components, use this logger
  // Logger,
  ThirdpartyRequests,
  MojaloopRequests,
} from '@mojaloop/sdk-standard-components'
import { ServerInjectResponse } from '@hapi/hapi'

/**
 * A client object that abstracts out operations that could be performed in
 * Mojaloop. With this, a service does not need to directly specify the request
 * endpoint, body, params, and headers that are required to talk with the
 * Mojaloop APIs. Instead, the service implementation could just pass the necessary
 * config upon initialization and relevant information in the function parameters
 * when it wants to perform a certain operation.
 */

export class Client {
  /**
   * An optional simulator that is expected to be passed when using the
   * simulator plugin.
   */
  simulator?: Simulator

  /**
   * An object that is provided by the Mojaloop SDK to handle all
   * of the necessary setup to make API calls to the admin API of Mojaloop.
   */
  mojaloopRequests: MojaloopRequests

  /**
   * An object that is provided by the Mojaloop SDK to handle all
   * of the necessary setup to make API calls to the third-party API of Mojaloop.
   */
  thirdpartyRequests: ThirdpartyRequests

  /**
   * An object that keeps the configuration for the client.
   */
  private options: Options

  /**
   * Constructor for the Mojaloop client.
   *
   * @param options a configuration object for the client.
   */
  public constructor(options: Options) {
    this.options = options

    const configRequest = {
      dfspId: this.options.participantId,
      logger: Logger,
      // TODO: Fix TLS and jwsSigningKey
      jwsSign: false,
      tls: {
        outbound: {
          mutualTLS: {
            enabled: false,
          },
        },
      },
      peerEndpoint: this.options.endpoints.default,
    }

    this.thirdpartyRequests = new ThirdpartyRequests(configRequest)
    this.mojaloopRequests = new MojaloopRequests(configRequest)
  }

  /**
   * Performs a lookup for a party with the given identifier.
   *
   * @param type  the type of party identifier
   * @param id    the party identifier
   */
  public async getParties(
    type: PartyIdType,
    id: string
  ): Promise<
    | SDKStandardComponents.GenericRequestResponse
    | undefined
    | ServerInjectResponse
    > {
    if (this.simulator) {
      // If the client is configured with a simulator, then it will not
      // communicate with Mojaloop directly. Instead, it will only generate
      // a random response that is injected to the internal routes.
      return this.simulator.getParties(type, id)
    }

    // TODO: Implement communication with Mojaloop.
  }

  /**
   * Performs a transaction initiation with the given transaction request object.
   *
   * @param requestBody a transaction request object as defined by the Mojaloop API.
   */
  public async postTransactions(requestBody: ThirdPartyTransactionRequest) {
    if (this.simulator) {
      // If the client is configured with a simulator, then it will not
      // communicate with Mojaloop directly. Instead, it will only generate
      // a random response that is injected to the internal routes.
      return this.simulator.postTransactions(requestBody)
    }

    // TODO: Implement communication with Mojaloop.
  }

  /**
   * Performs a transaction authorization with the given authorization object.
   *
   * @param id              a transaction request id that corresponds with the
   *                        authorization.
   * @param requestBody     an authorization object as defined by the Mojaloop API.
   * @param transactionId   an optional field that needs to be passed in order for
   *                        the mojaloop simulator to generate a callback. If the
   *                        value is not provided, the Mojaloop client will not be
   *                        able to use a simulator.
   */
  public async putAuthorizations(
    id: string,
    requestBody: AuthorizationsPutIdRequest,
    transactionId?: string
  ) {
    if (transactionId && this.simulator) {
      // If a transaction id is provided and the client is configured with a
      // simulator, then it will not communicate with Mojaloop directly. Instead,
      // it will only generate a random response that is injected to the internal routes.
      return this.simulator.putAuthorizations(id, requestBody, transactionId)
    }

    // TODO: Implement communication with Mojaloop.
  }

  /**
   * Gets a list of PISP/DFSP participants
   */
  public async getParticipants(): Promise<
  | SDKStandardComponents.GenericRequestResponse
  | undefined
  | ServerInjectResponse
  > {
    if (this.simulator) {
      // If the client is configured with a simulator, then it will not
      // communicate with Mojaloop directly. Instead, it will only generate
      // a random response that is injected to the internal routes.
      return this.simulator.getParticipants()
    }
    // TODO: Add once implemented in sdk-standard components
  }

  /**
   * Performs a request for a new consent
   *
   * @param requestBody         an consent request object as defined by the Mojaloop API.
   * @param destParticipantId   ID of destination - to be used when sending request
   */
  public async postConsentRequests(
    requestBody: SDKStandardComponents.PostConsentRequestsRequest,
    destParticipantId: string
  ): Promise<
    | SDKStandardComponents.GenericRequestResponse
    | undefined
    | ServerInjectResponse
    > {
    if (this.simulator) {
      // If the client is configured with a simulator, then it will not
      // communicate with Mojaloop directly. Instead, it will only generate
      // a random response that is injected to the internal routes.
      return this.simulator.postConsentRequests(requestBody)
    }
    return this.thirdpartyRequests.postConsentRequests(
      requestBody,
      destParticipantId
    )
  }

  /**
   * Performs a put request with authenticated consent request
   *
   * @param consentRequestId    unique identifier of the consent request
   * @param requestBody         an object to authenticate consent as defined by the Mojaloop API.
   * @param destParticipantId   ID of destination - to be used when sending request
   */
  public async putConsentRequests(
    consentRequestId: string,
    requestBody: SDKStandardComponents.PutConsentRequestsRequest,
    destParticipantId: string
  ): Promise<
    | SDKStandardComponents.GenericRequestResponse
    | undefined
    | ServerInjectResponse
    > {
    if (this.simulator) {
      // If the client is configured with a simulator, then it will not
      // communicate with Mojaloop directly. Instead, it will only generate
      // a random response that is injected to the internal routes.
      return this.simulator.putConsentRequests(consentRequestId, requestBody)
    }
    return this.thirdpartyRequests.putConsentRequests(
      consentRequestId,
      requestBody,
      destParticipantId
    )
  }

  /**
   * Performs a request to generate a challenge for FIDO registration
   *
   * @param consentId     identifier of consent as defined by Mojaloop API.
   */
  public async postGenerateChallengeForConsent(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    consentId: string
  ): Promise<
    | SDKStandardComponents.GenericRequestResponse
    | undefined
    | ServerInjectResponse
    > {
    if (this.simulator) {
      // If the client is configured with a simulator, then it will not
      // communicate with Mojaloop directly. Instead, it will only generate
      // a random response that is injected to the internal routes.
      return this.simulator.postGenerateChallengeForConsent(consentId)
    }
    // TODO: Add once implemented in sdk-standard components
  }

  /**
   * Performs a put request with registered consent credential
   *
   * @param consentId     identifier of consent as defined by Mojaloop API.
   * @param requestBody         an object to authenticate consent as defined by the Mojaloop API.
   * @param destParticipantId   ID of destination - to be used when sending request
   */
  public async putConsentId(
    consentId: string,
    requestBody: SDKStandardComponents.PutConsentsRequest,
    destParticipantId: string
  ): Promise<
    | SDKStandardComponents.GenericRequestResponse
    | undefined
    | ServerInjectResponse
    > {
    if (this.simulator) {
      // If the client is configured with a simulator, then it will not
      // communicate with Mojaloop directly. Instead, it will only generate
      // a random response that is injected to the internal routes.
      return this.simulator.putConsentId(consentId, requestBody)
    }
    return this.thirdpartyRequests.putConsents(
      consentId,
      requestBody,
      destParticipantId
    )
  }

  /**
   * Performs a request to revoke the Consent object and unlink
   *
   * @param consentId     identifier of consent as defined by Mojaloop API.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async postRevokeConsent(
    consentId: string
  ): Promise<
    | SDKStandardComponents.GenericRequestResponse
    | undefined
    | ServerInjectResponse
  > {
    if (this.simulator) {
      // If the client is configured with a simulator, then it will not
      // communicate with Mojaloop directly. Instead, it will only generate
      // a random response that is injected to the internal routes.
      return this.simulator.postRevokeConsent(consentId)
    }
    // TODO: Add once implemented in sdk-standard components
  }
}
