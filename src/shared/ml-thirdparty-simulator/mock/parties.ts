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

import * as faker from 'faker'
import { PartyIdType, Party, Account, Currency } from '~/shared/ml-thirdparty-client/models/core'
import { PartiesTypeIDPutRequest } from '~/shared/ml-thirdparty-client/models/openapi'
import { participants } from './participants'

const createParty = (type: PartyIdType, id: string): Party => {
  const randomFsp = participants[Math.floor(Math.random() * participants.length)]
  const randomFirstName = faker.name.firstName()
  const randomLastName = faker.name.lastName()
  return {
    partyIdInfo: {
      partyIdType: type,
      partyIdentifier: id,
      fspId: randomFsp.fspId
    },
    name: randomFirstName + randomLastName,
    personalInfo: {
      complexName: {
        firstName: randomFirstName,
        lastName: randomLastName,
      }
    }
  }
}

const createAccount = (party: Party, currency: Currency): Account => {
  const nameId = party.personalInfo?.complexName?.firstName?.toLowerCase()
  const randomAlphanumeric = faker.random.alphaNumeric(5)
  return {
    id: [nameId, randomAlphanumeric, party.partyIdInfo.fspId].join('.'),
    currency
  }
}

export const mockPutPartiesRequest = (type: PartyIdType, id: string): PartiesTypeIDPutRequest => {
  const party = createParty(type, id)
  const accounts: Account[] = [ // hardcode two currencies
    createAccount(party, Currency.USD),
    createAccount(party, Currency.SGD),
  ]

  return {
    party,
    accounts
  }
}
