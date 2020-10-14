# PI 12 Demo

A guide to setting up and running the PI 12 Demo.

## Prerequisites

- firebase config file in `secret/serviceAccountKey.json`



## 1. Local Transfer with TTK

### Setup


```bash
# in mojaloop/pisp, run the ttk with docker-contract setup
cd ../pisp/docker-contract
docker-compose up -d

# in a new window, start the demo server
npm run dev

# in another window, run the scratch integration tests
./node_modules/.bin/jest --collectCoverage=false test/integration/_scratch_01_party_lookup.test.ts
export TRANSACTION_ID=RBjVlxyvbiJJRbExTErS
./node_modules/.bin/jest --collectCoverage=false test/integration/_scratch_01_party_lookup.test.ts
./node_modules/.bin/jest --collectCoverage=false test/integration/_scratch_03_signed_auth.test.ts
```


## 2. Local transfer with docker-local


## 3. Live transfer with docker-live


## 4. Local account linking with TTK

- waiting for Sridhar