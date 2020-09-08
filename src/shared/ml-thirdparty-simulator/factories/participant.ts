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
/* istanbul ignore file */
// TODO: Confirm if testing necessary for factory methods

import * as faker from 'faker'

import { Participant } from '~/shared/ml-thirdparty-client/models/core'

/**
 * A class that helps to generate random participants for the simulator.
 */
export class ParticipantFactory {
  /**
   * Number of participants that will be generated by the simulator. The value
   * must be a positive integer. If not set, the default value is 10.
   *
   * Note that this variable must be set before `getParticipants()` is called,
   * otherwise, changing the value will not have any effect since the list of
   * participants is stored within the `participants` field.
   */
  public static numOfParticipants = 10

  /**
   * List of participants that is stored internally within the `ParticipantFactory`.
   */
  private static participants: Participant[] = []

  /**
   * Returns the list of participants for the simulator.
   * The participants will only be generated once when this function is called
   * for the first time. Afterward, the list will be stored internally for
   * subsequent usage.
   */
  public static getParticipants() {
    if (ParticipantFactory.participants.length < 1) {
      ParticipantFactory.createParticipants()
    }
    return ParticipantFactory.participants
  }

  private static createParticipants() {
    for (let i = 0; i < ParticipantFactory.numOfParticipants; i++) {
      // Generate a random participant
      const participant: Participant = {
        fspId: faker.finance.bic(),
        name: faker.company.companyName(),
      }

      ParticipantFactory.participants.push(participant)
    }
  }
}
