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
 --------------
 ******/

import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { Server, ServerInjectOptions, ServerInjectResponse } from '@hapi/hapi'
import Config from '~/lib/config'
import PispDemoServer from '~/server'
import * as MockData from '../mockData'

const featurePath = path.join(
  __dirname,
  '../features/inbound-api.scenario.feature'
)
const feature = loadFeature(featurePath)

// Mock firebase to prevent transaction repository from opening the connection.
jest.mock('~/lib/firebase')

defineFeature(feature, (test): void => {
  let server: Server
  let response: ServerInjectResponse

  afterEach((done): void => {
    server.events.on('stop', done)
    server.stop()
  })

  test('Endpoints return 200 or 202', ({ given, when, then }): void => {
    given(
      'pisp-demo-server',
      async (): Promise<Server> => {
        server = await PispDemoServer.run(Config)
        return server
      }
    )

    when(
      /^I sent a (.*)$ request/,
      async (operationId): Promise<void> => {
        let request: ServerInjectOptions
        switch (operationId) {
          case 'putConsentRequestsById': {
            request = {
              headers: MockData.headers,
              method: 'PUT',
              url: '/consentRequests/1234',
              payload: MockData.putConsentRequestsByIdBody,
            }
            break
          }
          case 'putConsentsById': {
            request = {
              headers: MockData.headers,
              method: 'PUT',
              url: '/consents/1234',
              payload: MockData.putConsentsByIdBody,
            }
            break
          }
          case 'putParticipants': {
            request = {
              headers: MockData.headers,
              method: 'PUT',
              url: '/participants',
              payload: MockData.putParticipantsBody,
            }
            break
          }
          case 'putParticipantsError': {
            request = {
              headers: MockData.headers,
              method: 'PUT',
              url: '/participants/error',
              payload: MockData.putParticipantsErrorBody,
            }
            break
          }
          case 'putPartiesByTypeAndId': {
            request = {
              headers: MockData.headers,
              method: 'PUT',
              url: '/parties/MSISDN/1234',
              payload: MockData.putPartiesByTypeAndIdBody,
            }
            break
          }
          case 'putPartiesByTypeAndIdError': {
            request = {
              headers: MockData.headers,
              method: 'PUT',
              url: '/parties/MSISDN/1234/error',
              payload: MockData.putPartiesByTypeAndIdErrorBody,
            }
            break
          }
          case 'postConsents': {
            request = {
              headers: MockData.headers,
              method: 'POST',
              url: '/consents',
              payload: MockData.postConsentBody,
            }
            break
          }
          case 'putTransfersById': {
            request = {
              headers: MockData.headers,
              method: 'POST',
              url: '/consents',
              payload: MockData.putTransfersByIdBody,
            }
            break
          }
          case 'authorizations': {
            request = {
              headers: MockData.headers,
              method: 'POST',
              url: '/consents',
              payload: MockData.authorizationsBody,
            }
            break
          }
          default:
            return
        }
        response = await server.inject(request)
      }
    )

    then(/^I should get a (\d+)$ response/, (expectedStatusCode): void => {
      expect(response.statusCode).toBe(expectedStatusCode)
    })
  })
})
