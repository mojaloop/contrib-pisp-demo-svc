/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the
 Apache License, Version 2.0 (the 'License') and you may not use these files
 except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop
 files are distributed onan 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 ANY KIND, either express or implied. See the License for the specific language
 governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Google
 - Raman Mangla <ramanmangla@google.com>
 --------------
 ******/

import clientConfig from './config'
import Logger, {
  ThirdpartyRequests,
  MojaloopRequests,
} from '@mojaloop/sdk-standard-components'

// Config file to instantiate ThirdPartyRequest object
const configRequest = {
  dfspId: clientConfig.get('REQUEST.PARTICIPANT_ID'),
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
  peerEndpoint: clientConfig.get('REQUEST.PEER_ENDPOINT'),
  alsEndpoint: clientConfig.get('REQUEST.ALS_ENDPOINT'),
  thirdpartyRequestsEndpoint: clientConfig.get(
    'REQUEST.THIRDPARTY_REQUEST_ENDPOINT'
  ),
  transactionRequestsEndpoint: clientConfig.get(
    'REQUEST. TRANSACTION_REQUEST_ENDPOINT'
  ),
}

export const thirdpartyRequests: ThirdpartyRequests = new ThirdpartyRequests(
  configRequest
)

export const mojaloopRequests: MojaloopRequests = new MojaloopRequests(
  configRequest
)
