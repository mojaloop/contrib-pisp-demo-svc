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
import { loadFeature, defineFeature, DefineStepFunction } from 'jest-cucumber'
import Config from '~/lib/config'
import PispDemoServer from '~/server'
import { onCreate, onUpdate } from '~/server/handlers/firestore/transactions'
import { Transaction, Status } from '~/models/transaction'

// Mock firebase to prevent opening the connection
jest.mock('~/lib/firebase')

// Mock out handler helper functions

const featurePath = path.join(
  __dirname,
  '../features/firestore-transaction-handlers.feature'
)
const feature = loadFeature(featurePath)

defineFeature(feature, (test): void => {
  let server: StateServer

  // Define reused steps
  const givenThePispDemoServer = (given: DefineStepFunction) => {
    given(
      'pisp-demo-server',
      async (): Promise<Server> => {
        server = await PispDemoServer.run(Config)
        return server
      }
    )
  }

  const whenTheTransactionUpdatedHasXStatus = (when: DefineStepFunction) => {
    when(
      /^the Transaction that has been updated has (.*) status$/,
      async (status: string): Promise<void> => {
        let transaction: Transaction
        if (status === 'undefined') {
          transaction = {
            id: '1234',
          }
        } else {
          transaction = {
            id: '1234',
            status: status as Status,
          }
        }
        onUpdate(server, transaction)
      }
    )
  }

  const thenTheCorrectHandlerShouldBeUsed = (then: DefineStepFunction) => {
    then(/^the server should (.*) on Mojaloop$/, (_: string): void => {
      // Expect that the correct function is called
    })
  }

  test('Update Transaction With <Status> Status', ({
    given,
    when,
    then,
  }): void => {
    givenThePispDemoServer(given)

    whenTheTransactionUpdatedHasXStatus(when)

    thenTheCorrectHandlerShouldBeUsed(then)
  })
})
