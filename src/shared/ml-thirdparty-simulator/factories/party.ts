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

import * as faker from 'faker'
import { PartyIdType, Party, Account, Currency } from '~/shared/ml-thirdparty-client/models/core'
import { PartiesTypeIDPutRequest } from '~/shared/ml-thirdparty-client/models/openapi'
import { ParticipantFactory } from './participant'

/**
 * A class that helps to generate random parties for the simulator.
 */
export class PartyFactory {
  /**
   * Creates a `PUT /parties/{Type}/{ID}` request body that is normally sent
   * by Mojaloop as a callback for party lookup operation.
   * 
   * @param type  type of the party identifier.
   * @param id    the party identifier.
   */
  public static createPutPartiesRequest(type: PartyIdType, id: string): PartiesTypeIDPutRequest {
    const party = PartyFactory.createParty(type, id)
    const accounts: Account[] = [ // hardcode two currencies
      PartyFactory.createAccount(party, Currency.USD),
      PartyFactory.createAccount(party, Currency.SGD),
    ]

    return {
      party,
      accounts
    }
  }

  /**
   * Creates a Party object as defined in the Mojaloop schema.
   * 
   * @param type  type of the party identifier.
   * @param id    the party identifier.
   */
  private static createParty(type: PartyIdType, id: string): Party {
    const participants = ParticipantFactory.getParticipants()

    const randomFsp = participants[Math.floor(Math.random() * participants.length)]
    const randomFirstName = faker.name.firstName()
    const randomLastName = faker.name.lastName()

    return {
      partyIdInfo: {
        partyIdType: type,
        partyIdentifier: id,
        fspId: randomFsp.fspId
      },
      name: randomFirstName + ' ' + randomLastName,
      personalInfo: {
        complexName: {
          firstName: randomFirstName,
          lastName: randomLastName,
        }
      }
    }
  }

  /**
   * Creates an Account object as defined in the Mojaloop schema.
   * 
   * @param party     information about the party.
   * @param currency  currency of the bank account.
   */
  private static createAccount(party: Party, currency: Currency): Account {
    const nameId = party.personalInfo?.complexName?.firstName?.toLowerCase()
    const randomAlphanumeric = faker.random.alphaNumeric(5)

    return {
      id: [nameId, randomAlphanumeric, party.partyIdInfo.fspId].join('.'),
      currency
    }
  }
}
