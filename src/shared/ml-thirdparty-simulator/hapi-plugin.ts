// /*****
License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License")
*****/

// import { Plugin, Server } from '@hapi/hapi'
// import { Simulator } from '~/shared/ml-thirdparty-simulator'
// import { Options } from './options'

// /**
//  * Re-export the config schema.
//  */
// export { Options }

// /**
//  * A plugin that enables PISP demo server to pretend to communicate with Mojaloop.
//  * In fact, the server only talks with a simulator that generates a random data
//  * and inject callbacks to the internal routes.
//  *
//  * The 'MojaloopClient' plugin must be registered before trying to
//  * register this function as it will try to intercept the requests before they reach
//  * the simulator.
//  */
// export const MojaloopSimulator: Plugin<Options> = {
//   name: 'MojaloopSimulator',
//   version: '1.0.0',
//   register: (server: Server, options: Options) => {
//     (server as StateServer).app.mojaloopClient.simulator = new Simulator(
//       server as StateServer,
//       { ...options },
//     )
//   }
// }
