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

import { Request, ResponseToolkit } from '@hapi/hapi'
import { Handler, Context } from 'openapi-backend'

import { transactionRepository } from '~/repositories/transaction'
import { Status } from '~/models/transaction'


export const put: Handler = async (_context: Context, _: Request, h: ResponseToolkit) => {
  // const body = context.request.body as AuthorizationsPostRequest

  console.log("putThirdpartyRequestTransactions inbound")
  // Not await-ing promise to resolve - code is executed asynchronously
  // transactionRepository.update(
  //   {
  //     transactionRequestId: body.transactionRequestId,
  //     status: Status.PENDING_PAYEE_CONFIRMATION,
  //   },
  //   {
  //     authentication: {
  //       type: body.authenticationType,
  //     },
  //     transactionId: body.transactionId,
  //     quote: body.quote,
  //     status: Status.AUTHORIZATION_REQUIRED,
  //   }
  // )

  return h.response().code(200)
}

// TODO: some of these ids are getting mixed up here.
export const patch: Handler = async (context: Context, _: Request, h: ResponseToolkit) => {
  const transactionRequestId = context.request.params.ID
  // const body = context.request.body as AuthorizationsPostRequest

  console.log("patchThirdpartyRequestTransactions inbound")
  // Not await-ing promise to resolve - code is executed asynchronously
  transactionRepository.update(
    {
      transactionRequestId: transactionRequestId,
      status: Status.AUTHORIZATION_REQUIRED,
    },
    {
      completedTimestamp: (new Date()).toISOString(),
      status: Status.SUCCESS,
    }
  )

  return h.response().code(200)
}

export const putError: Handler = async (context: Context, _: Request, h: ResponseToolkit) => {
  console.log("putThirdpartyRequestTransactions error", context.request.body)
  // TODO: get error details...
  return h.response().code(200)
}
