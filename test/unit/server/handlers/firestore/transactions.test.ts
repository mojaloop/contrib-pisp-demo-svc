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

import { Server } from '@hapi/hapi'
import * as uuid from 'uuid'

import * as transactionsHandler from '~/server/handlers/firestore/transactions'

import config from '~/lib/config'
import firebase from '~/lib/firebase'
import createServer from '~/server/create'
import { PartyIdType } from '~/shared/ml-thirdparty-client/models/core'
import { Status } from '~/lib/firebase/models/transactions'

jest.mock('~/lib/firebase')

jest.mock('uuid', () => ({
  v4: jest.fn().mockImplementation(() => '12345')
}))

describe('Handlers for transaction documents in Firebase', () => {
  let server: Server
  let mockFirebase: any

  beforeAll(async () => {
    server = await createServer(config)

    // Typecast to an `any` type. This is important to avoid strict checking 
    // from Typescript since a single mock object is used to test the execution 
    // on the chained functions.
    mockFirebase = firebase
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('Should set status and transactionRequestId for new transaction', () => {
    const documentId = '111'

    transactionsHandler.onCreate(server, documentId, {
      userId: 'bob123',
      payee: {
        partyIdInfo: {
          partyIdType: PartyIdType.MSISDN,
          partyIdentifier: "+1-111-111-1111",
        }
      }
    })

    expect(mockFirebase.firestore).toBeCalled()
    expect(mockFirebase.collection).toBeCalledWith('transactions')
    expect(mockFirebase.doc).toBeCalledWith(documentId)
    expect(uuid.v4).toBeCalledTimes(1)
    expect(mockFirebase.update).toBeCalledWith({
      transactionRequestId: '12345',
      status: Status.PENDING_PARTY_LOOKUP,
    })
  })

  it('Should perform party lookup when all necessary fields are set', () => {
    const documentId = '111'
    let mojaloopClientSpy = jest.spyOn(server.app.mojaloopClient, 'getParties').mockImplementation()

    transactionsHandler.onUpdate(server, documentId, {
      userId: 'bob123',
      payee: {
        partyIdInfo: {
          partyIdType: PartyIdType.MSISDN,
          partyIdentifier: "+1-111-111-1111",
        }
      },
      transactionRequestId: '12345',
      status: Status.PENDING_PARTY_LOOKUP,
    })

    expect(mojaloopClientSpy).toBeCalledWith(PartyIdType.MSISDN, "+1-111-111-1111")
  })
})
