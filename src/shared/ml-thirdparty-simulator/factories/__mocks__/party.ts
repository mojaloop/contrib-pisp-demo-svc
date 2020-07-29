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

import { PartyIdType, Currency } from '~/shared/ml-thirdparty-client/models/core'
import { PartiesTypeIDPutRequest } from '~/shared/ml-thirdparty-client/models/openapi'

const data: PartiesTypeIDPutRequest[] = [
  {
    party: {
      partyIdInfo: {
        partyIdType: PartyIdType.MSISDN,
        partyIdentifier: "+1-111-111-1111",
        fspId: 'fspa',
      },
      name: 'Alice Alpaca',
      personalInfo: {
        complexName: {
          firstName: 'Alice',
          lastName: 'Alpaca',
        },
      },
    },
    accounts: [
      { id: 'alice.aaaaa.fspa', currency: Currency.SGD },
      { id: 'alice.bbbbb.fspa', currency: Currency.USD },
    ],
  },
  {
    party: {
      partyIdInfo: {
        partyIdType: PartyIdType.MSISDN,
        partyIdentifier: "+1-222-222-2222",
        fspId: 'fspb',
      },
      name: 'Bob Beaver',
      personalInfo: {
        complexName: {
          firstName: 'Bob',
          lastName: 'Beaver',
        },
      },
    },
    accounts: [
      { id: 'bob.aaaaa.fspb', currency: Currency.SGD },
      { id: 'bob.bbbbb.fspb', currency: Currency.USD },
    ],
  },
]

export class PartyFactory {
  public static createPutPartiesRequest(type: PartyIdType, id: string): PartiesTypeIDPutRequest {
    let result = null;
    data.forEach((value) => {
      if (value.party.partyIdInfo.partyIdType == type && value.party.partyIdInfo.partyIdentifier == id) {
        result = value
      }
    })
    // TODO: error handling if there is no matching data.
    return result ?? data[0]
  }
}
