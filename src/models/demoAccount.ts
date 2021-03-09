

// DemoAccount is a representation of a linked 
// account, internal to the PISP-Demo-Server
// A demo account is created for _each_ linked
// selection in a consent
export interface DemoAccount {
  /**
   * The user friendly name of the account
   */
  alias: string,

  fspInfo: {
    id: string,
    name: string,
  }
  
  /**
   * The id of the account
   */
  sourceAccountId: string,

  /**
   * The id of the user who created the link
   */
  userId: string,

  /**
   * internal Id of the DemoAccount
   */
  id?: string,
}