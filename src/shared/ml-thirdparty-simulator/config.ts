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

/**
 * An interface definition for options that need to be specfied to use this plugin.
 */
export interface Config {
  /**
   * An optional field to set the host value in the request header. 
   * This is useful for a service that handles Mojaloop callback using
   * a virtual host, because it will require the host field in the request
   * header to determine the routing.
   */
  host?: string

  /**
   * A fixed delay time before injecting a response to the server.
   * This is useful to simulate network latency that may happen when 
   * communicating with the real Mojaloop services.
   */
  delay?: number

  /**
   * Number of DFSP participants that the simulator will generate.
   */
  numOfParticipants?: number
}
