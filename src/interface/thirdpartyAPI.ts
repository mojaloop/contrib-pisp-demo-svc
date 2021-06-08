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

 * Crosslake Tech
 - Lewis Daly <lewisd@crosslaketech.com>

 --------------
 ******/



// Type aliasing of ./api_interfaces/openapi.d.ts for convenience
// see API-snippets for example of how to do this: https://github.com/mojaloop/api-snippets/#dto-type-aliasing


import { components, operations } from './api_interfaces/openapi'

// reexport openapi if needed
export * as openapi from './api_interfaces/openapi'

// define some aliases for schemas
export namespace ThirdpartyAPISchemas {
  export type AuthChannel = components["schemas"]["ConsentRequestChannelTypeWeb"] 
    | components["schemas"]["ConsentRequestChannelTypeOTP"]
  export type Credential = components['schemas']['UnsignedCredential'] 
    | components['schemas']['SignedCredential']
    | components['schemas']['VerifiedCredential']

  export type SignedCredential = components['schemas']['SignedCredential']

  export type Scope = components['schemas']['Scope']

  // export type PutConsentsRequest = operations['UpdateConsent']['requestBody']['content']['application/json']
  export type ConsentsIDPutResponseSigned = components["schemas"]["ConsentsIDPutResponseSigned"]
  // export type PutConsentsRequest = components["schemas"]["ConsentsIDPutResponseSigned"]
  //   | components["schemas"]["ConsentsIDPutResponseUnsigned"]
  //   | components["schemas"]["ConsentsIDPutResponseVerified"];

}
