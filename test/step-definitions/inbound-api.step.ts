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
 - Kenneth Zeng <kkzeng@google.com>
 --------------
 ******/

import path from 'path'
import { loadFeature, defineFeature } from 'jest-cucumber'
import { Server, ServerInjectOptions, ServerInjectResponse } from '@hapi/hapi'
import Config from '~/lib/config'
import PispDemoServer from '~/server'
import * as MockData from '../mockData'
import { Consent } from '~/models/consent'
import { consentRepository } from '~/repositories/consent'
import { participantRepository } from '~/repositories/participants'
import { transactionRepository } from '~/repositories/transaction'

// Mock firebase to prevent opening the connection
jest.mock('~/lib/firebase')

// Mock out repo functions
const mockUpdateConsentById = jest.spyOn(consentRepository, 'updateConsentById')
mockUpdateConsentById.mockResolvedValue()
const mockUpdateConsent = jest.spyOn(consentRepository, 'updateConsent')
mockUpdateConsent.mockResolvedValue()
const mockGetConsentById = jest.spyOn(consentRepository, 'getConsentById')
const mockConsent: Consent = { id: '1234' }
mockGetConsentById.mockResolvedValue(mockConsent)

const mockReplace = jest.spyOn(participantRepository, 'replace')
mockReplace.mockResolvedValue()

const mockUpdateById = jest.spyOn(transactionRepository, 'updateById')
mockUpdateById.mockResolvedValue()

const mockUpdate = jest.spyOn(transactionRepository, 'update')
mockUpdate.mockResolvedValue()

const featurePath = path.join(__dirname, '../features/inbound-api.feature')
const feature = loadFeature(featurePath)

defineFeature(feature, (test): void => {
  let server: Server
  let response: ServerInjectResponse

  afterEach(
    async (): Promise<void> => {
      await server.stop()
    }
  )

  test('Endpoint for <OperationId> returns 200 or 202', ({
    given,
    when,
    then,
  }): void => {
    given(
      'pisp-demo-server',
      async (): Promise<void> => {
        server = await PispDemoServer.run(Config)
      }
    )

    when(
      /^I sent a (.*) request$/,
      async (operationId: string): Promise<void> => {
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
              method: 'PUT',
              url: '/transfers/b51ec534-ee48-4575-b6a9-ead2955b8069',
              payload: MockData.putTransfersByIdBody,
            }
            break
          }
          case 'authorizations': {
            request = {
              headers: MockData.headers,
              method: 'POST',
              url: '/authorizations',
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

    then(/^I should get a (\d+) response$/, (statusCode: string): void => {
      const expectedStatusCode = parseInt(statusCode)
      expect(response.statusCode).toBe(expectedStatusCode)
    })
  })
})
