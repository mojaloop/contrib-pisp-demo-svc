# pisp-demo-server/src/server
[@hapi](https://hapi.dev/) server setup


- [handlers](handlers/README.md) the module with resource handlers
- [plugins](plugins/README.md) the module with plugins
- `create.ts` the server instance creation
- `extensions.ts` the server extensions
- `run.ts` creates and registers plugins and extensions and finally starts the server
- `start.ts` to start the server to listening 

simplified usage:

```typescript
import { Server } from '@hapi/hapi'
import Config from 'src/shared/config'
import AuthService from 'src/server'

const runningServer = await AuthService.run(Config) 
```
