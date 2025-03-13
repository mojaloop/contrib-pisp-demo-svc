/*****
License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License")

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
*****/

import index from '~/index'
import Config from '~/lib/config'

// Mock firebase to prevent server from listening to the changes.
jest.mock('~/lib/firebase')

describe('index', (): void => {
  it('should have proper layout', (): void => {
    expect(typeof index.server).toBeDefined()
    expect(typeof index.server.run).toEqual('function')
  })

  describe('api routes', (): void => {
    let server: StateServer

    beforeAll(
      async (): Promise<StateServer> => {
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
        url: '/app/health',
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
