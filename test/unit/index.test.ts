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

import index from '../../src/index'
import Config from '../../src/shared/config'
import { Server } from '@hapi/hapi'

describe('index', (): void => {
  it('should have proper layout', (): void => {
    expect(typeof index.server).toBeDefined()
    expect(typeof index.server.run).toEqual('function')
  })

  describe('api routes', (): void => {
    let server: Server

    beforeAll(
      async (): Promise<Server> => {
        server = await index.server.run(Config)
        return server
      }
    )

    afterAll((done): void => {
      server.events.on('stop', done)
      server.stop()
    })

    it('/health', async (): Promise<void> => {
      interface HealthResponse {
        status: string
        uptime: number
        startTime: string
        versionNumber: string
      }

      const request = {
        method: 'GET',
        url: '/health',
      }

      const response = await server.inject(request)
      expect(response.statusCode).toBe(200)
      expect(response.result).toBeDefined()

      const result = response.result as HealthResponse
      expect(result.status).toEqual('OK')
      expect(result.uptime).toBeGreaterThan(1.0)
    })
  })
})
