/*****
License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License")

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
 - Raman Mangla <ramanmangla@google.com>
*****/

/**
 * An interface definition for the configuration needed to setup the
 * Mojaloop client.
 */
export interface Options {
  /**
   * A unique participant ID that is registered in Mojaloop. This value 
   * will also be used to verify the JWS that is attached in the request
   * header when enabling the mutual TLS.
   */
  participantId: string

  /**
   * Configuration for the host endpoints that will be used to communicate
   * with the Mojaloop services.
   */
  endpoints: EndpointOptions
}

export interface EndpointOptions {
  /**
   * Host endpoint for the mojaloop. By default, this value will be used
   * to perform all API calls to Mojaloop unless there are other endpoints
   * specified for some particular paths.
   * 
   * The value of this host endpoint does not need to include the transport 
   * scheme since it will be automatically configured based on the config of 
   * using mutual TLS or not. Example value: `api.mojaloop.io`.
   */
  fspiop: string,
  thirdparty: string,
  tempTransactionRequestService?: string
}
