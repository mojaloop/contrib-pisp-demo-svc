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
/* istanbul ignore file */
// TODO: BDD Testing will covered in separate ticket #1702

import { Simulator } from '~/shared/ml-thirdparty-simulator'
import { PartyIdType } from './models/core'
import { Options } from './options'

import {
  ThirdPartyTransactionRequest,
} from './models/openapi'

import SDKStandardComponents, {
  Logger,
  ThirdpartyRequests,
  MojaloopRequests,
  PutThirdpartyRequestsTransactionsAuthorizationsRequest,
  BaseRequestConfigType,
} from '@mojaloop/sdk-standard-components'
import { NotImplementedError } from '../errors'

const ELB_URL = process.env.ELB_URL!

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

    const configRequest: BaseRequestConfigType = {
      dfspId: this.options.participantId,
      logger: new Logger.Logger(),
      // TODO: Fix TLS and jwsSigningKey
      jwsSign: false,
      tls: {
        mutualTLS: { enabled: false },
        creds: {
          ca: '',
          cert: ''
        }
      },
      // TODO: make these configurable
      // peerEndpoint: this.options.endpoints.default,
      alsEndpoint: `${ELB_URL}/account-lookup-service/`,
      peerEndpoint: `${ELB_URL}/`,
      quotesEndpoint: `${ELB_URL}/quoting-service/`,
      bulkQuotesEndpoint: `${ELB_URL}/quoting-service/`,
      transfersEndpoint: `${ELB_URL}/ml-api-adapter/`,
      bulkTransfersEndpoint: `${ELB_URL}/ml-api-adapter/`,
      transactionRequestsEndpoint: `${ELB_URL}/transaction-requests-service/`,
      thirdpartyRequestsEndpoint: `${ELB_URL}/thirdparty-api-adapter/`,
      resourceVersions: {
        // override parties here, since the ttk doesn't have config for 1.1
        parties: {
          contentVersion: '1.0',
          acceptVersion: '1.0'
        }
      }
      // v12, this was removed
      // responseType: 'string',
    }

    this.thirdpartyRequests = new ThirdpartyRequests(configRequest)
    this.mojaloopRequests = new MojaloopRequests(configRequest)
  }

  /**
   * Performs a lookup for a party with the given identifier.
   *
   * @param _type  the type of party identifier
   * @param _id    the party identifier
   */
  public async getParties(
    idType: PartyIdType,
    idValue: string,
    idSubValue?: string
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
    if (idSubValue) {
      return this.mojaloopRequests.getParties(idType, idValue, idSubValue)
    }
    return this.mojaloopRequests.getParties(idType, idValue)
  }

  /**
   * Performs a transaction initiation with the given transaction request object.
   *
   * @param _requestBody a transaction request object as defined by the Mojaloop API.
   */
  public async postTransactions(
    requestBody: ThirdPartyTransactionRequest,
    destParticipantId: string
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
    return this.thirdpartyRequests.postThirdpartyRequestsTransactions(
      (requestBody as unknown) as SDKStandardComponents.PostThirdPartyRequestTransactionsRequest,
      destParticipantId
    )
  }

  /**
   * Performs a transaction authorization with the given authorization object.
   *
   * @param id              a transaction request id that corresponds with the
   *                        authorization.
   * @param requestBody     an authorization object as defined by the Mojaloop API.
   * @param destParticipantId   ID of destination - to be used when sending request

   */
  public async putAuthorizations(
    id: string,
    _requestBody: PutThirdpartyRequestsTransactionsAuthorizationsRequest,
    destParticipantId: string
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {

    const requestBody = {
      authenticationInfo: {
        // LD - just a hack because we need to update the TTK
        authentication: 'OTP',
        // authenticationValue: {
        //   pinValue: _requestBody.value,
        //   counter: "1"
        // }
        authenticationValue: _requestBody.value,
      },
      responseType: 'ENTERED'
    }

    // @ts-ignore
    return this.mojaloopRequests.putAuthorizations(id, requestBody, destParticipantId)
    // TD - Hack!!! - workaround for the ttk not liking puts
    // return this.mojaloopRequests._post(`thirdPartyAuthorizations/${id}`, 'authorizations', requestBody, destParticipantId)
  }

  /**
   * Gets a list of PISP/DFSP participants
   */
  public async getParticipants(): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
    // TODO: Add once implemented in sdk-standard components
    // Placeholder below
    throw new NotImplementedError()
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
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
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
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
    return this.thirdpartyRequests.putConsentRequests(
      consentRequestId,
      requestBody,
      destParticipantId
    )
  }

  /**
   * Performs a request to generate a challenge for FIDO registration
   *
   * @param _consentId     identifier of consent as defined by Mojaloop API.
   * @param destParticipantId   ID of destination - to be used when sending request
   */
  public async postGenerateChallengeForConsent(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    consentId: string,
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
    // TODO: implement in sdk standard components
    // TODO: this should just be empty!
    const body = { type: 'FIDO'}
    // @ts-ignore
    return this.thirdpartyRequests._post(`consents/${consentId}/generateChallenge`, 'thirdparty', body, undefined)
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
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
    return this.thirdpartyRequests.putConsents(
      consentId,
      requestBody,
      destParticipantId
    )
  }

  /**
   * Performs a request to revoke the Consent object and unlink
   *
   * @param _consentId     identifier of consent as defined by Mojaloop API.
   * @param destParticipantId   ID of destination - to be used when sending request
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async postRevokeConsent(
    _consentId: string,
    _destParticipantId: string
  ): Promise<SDKStandardComponents.GenericRequestResponse | undefined> {
    // TODO: Add once implemented in sdk-standard components
    // Placeholder below
    throw new NotImplementedError()
  }
}
