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
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Google
 - Raman Mangla <ramanmangla@google.com>
 --------------
 ******/

// namespace Client {
/**
 * An interface definition for the configuration needed to setup the
 * Mojaloop client.
 */

import Convict from 'convict'

export interface clientConfigModel {
  MOJALOOP_URL: string
  REQUEST: {
    PARTICIPANT_ID: string
    ALS_ENDPOINT: string
    THIRDPARTY_REQUEST_ENDPOINT: string
    TRANSACTION_REQUEST_ENDPOINT: string
    PEER_ENDPOINT: string
  }
}

// Declare configuration schema, default values and
// bindings to environment variables
const clientConfig = Convict<clientConfigModel>({
  MOJALOOP_URL: {
    doc: 'Mojaloop URL for the client to communicate with',
    format: '*',
    default: '',
  },
  REQUEST: {
    PARTICIPANT_ID: {
      doc: 'The name of the service',
      format: String,
      default: 'pisp',
    },
    ALS_ENDPOINT: {
      doc: 'ALS endpoint for Mojaloop requests',
      format: String,
      default: 'account-lookup-service:4002',
    },
    THIRDPARTY_REQUEST_ENDPOINT: {
      doc: 'Third party request endpoint for Mojaloop requests',
      format: String,
      default: 'thirdparty-api-adapter:3008',
    },
    TRANSACTION_REQUEST_ENDPOINT: {
      doc: 'Transaction request endpoint for Mojaloop requests',
      format: String,
      default: 'transaction-request-service:4003',
    },
    PEER_ENDPOINT: {
      doc: 'Default Mojaloop endpoint',
      format: String,
      default: '172.17.0.2:3001',
    },
  },
})

// Default config properties for now
// Load correct JSON config based on env: test/prod
clientConfig.load({})

export default clientConfig
