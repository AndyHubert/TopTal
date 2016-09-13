## Installation

```sh
cd frontend && npm install
cd ../backend && npm install
```

To avoid an error when running tests, change line 10 of /backend/node_modules/json2mongo/node_modules/bson/ext/index.js to the following:

```js
var mongoose = require('mongoose');
```

## Running

```sh
cd backend && mongod
npm start
cd frontend && npm start
```

## Tests

```sh
cd backend
npm test
```