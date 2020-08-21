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
 --------------
 ******/

import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { Server, ServerInjectResponse } from '@hapi/hapi'
import Config from '~/lib/config'
import PispDemoServer from '~/server'

const featurePath = path.join(__dirname, '../features/template.scenario.feature')
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

  test('Health Check', ({ given, when, then }): void => {
    given('pisp-demo-server server', async (): Promise<Server> => {
      server = await PispDemoServer.run(Config)
      return server
    })

    when('I get \'Health Check\' response', async (): Promise<ServerInjectResponse> => {
      const request = {
        method: 'GET',
        url: '/health',
        headers: {
          host: 'app.pisp-demo-server.local'
        }
      }
      response = await server.inject(request)
      return response
    })

    then('The status should be \'OK\'', (): void => {
      interface HealthResponse {
        status: string;
        uptime: number;
        startTime: string;
        versionNumber: string;
      }
      const healthResponse = response.result as HealthResponse
      expect(response.statusCode).toBe(200)
      expect(healthResponse.status).toEqual('OK')
      expect(healthResponse.uptime).toBeGreaterThan(1.0)
    })
  })
})
