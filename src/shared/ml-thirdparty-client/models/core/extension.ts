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
*****/

/**
 * Data model for the complex type ExtensionList. 
 * An optional list of extensions, specific to deployment.
 */
export interface ExtensionList {
  /**
   * Extension elements.
   */
  extension: [Extension]
}

/**
 * Data model for the complex type Extension.
 */
export interface Extension {
  /**
   * Extension key.
   */
  key: string

  /**
   * Extension value.
   */
  value: string
}
