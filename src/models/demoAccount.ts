/*****
License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License")
*****/

// DemoAccount is a representation of a linked
// account, internal to the PISP-Demo-Server
// A demo account is created for _each_ linked
// selection in a consent
export interface DemoAccount {
  /**
   * The user friendly name of the account
   */
  alias: string

  fspInfo: {
    id: string
    name: string
  }

  /**
   * The id of the account
   */
  sourceAccountId: string

  /**
   * The id of the user who created the link
   */
  userId: string

  /**
   * The id of the credential associated with this account
   */
  keyHandleId: Array<number>

  /**
   * internal Id of the DemoAccount
   */
  id?: string

  /**
   * the id of the consent object
   */
  consentId: string
}