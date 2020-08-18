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
 - Steven Wijaya <stevenwjy@google.com>
 - Raman Mangla <ramanmangla@google.com>
 --------------
 ******/

import Path from 'path'
import convict from 'convict'
import * as dotenv from 'dotenv'

import Package from '../../package.json'

// Setup config to read environment variables from '.env' file.
dotenv.config()

// Config definition
const config = convict({
  package: {
    name: {
      doc: 'The application name.',
      default: 'pisp-demo-server',
    },
    version: {
      doc: 'The application version.',
      default: '0.1.0',
    },
  },
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  hostname: {
    doc: 'Host name for the server.',
    format: '*',
    default: 'pisp-demo-server.local',
    env: 'HOST',
    arg: 'hostname',
  },
  ip: {
    doc: 'The IP address to bind.',
    format: '*',
    default: '127.0.0.1',
    env: 'IP_ADDRESS',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8080,
    env: 'PORT',
    arg: 'port',
  },
  db: {
    firebase: {
      keyPath: {
        doc: 'Path to service account key for Firebase',
        format: '*',
        default: Path.resolve(__dirname, '../../secret/serviceAccountKey.json'),
        env: 'FIREBASE_KEY_PATH',
      },
      url: {
        doc: 'Url for the database',
        format: '*',
        default: '',
        env: 'FIREBASE_URL',
      },
    },
  },
  experimental: {
    mode: {
      doc: 'On/off switch for the PISP demo server experimental mode',
      format: ['on', 'off'],
      default: 'off',
      env: 'EXPERIMENTAL_MODE',
    },
    delay: {
      doc: 'Delay time to be used in the experimental mode',
      format: 'int',
      default: 1000,
      env: 'EXPERIMENTAL_DELAY',
    },
  },
  mojaloop: {
    url: {
      doc: 'URL of the API gateway for Mojaloop',
      format: '*',
      default: '',
      env: 'MOJALOOP_URL',
    },
  },
  request: {
    participantId: {
      doc: 'The name of the service',
      format: String,
      default: 'pisp',
      env: 'PARTICIPANT_ID',
    },
    alsEndpoint: {
      doc: 'ALS endpoint for Mojaloop requests',
      format: String,
      default: 'account-lookup-service:4002',
      env: 'ALS_ENDPOINT',
    },
    thirdpartyRequestsEndpoint: {
      doc: 'Third party request endpoint for Mojaloop requests',
      format: String,
      default: 'thirdparty-api-adapter:3008',
      env: 'THIRDPARTY_REQUESTS_ENDPOINT',
    },
    transactionRequestsEndpoint: {
      doc: 'Transaction request endpoint for Mojaloop requests',
      format: String,
      default: 'transaction-request-service:4003',
      env: 'TRANSACTION_REQUESTS_ENDPOINT',
    },
    peerEndpoint: {
      doc: 'Default Mojaloop endpoint',
      format: String,
      default: '172.17.0.2:3001',
      env: 'PEER_ENDPOINT',
    },
  },
})

config.load({
  package: {
    name: Package.name,
    version: Package.version,
  },
})

export type ServiceConfig = typeof config
export default config
