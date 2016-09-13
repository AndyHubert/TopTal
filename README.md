## Dependencies

* Node >= 6.4.0
* npm >= 3.10.3
* MongoDB >= 3.2.9

## Installation

```sh
frontend$ npm install
backend$ npm install
```

## Running

Run the following concurrently:

```sh
mongod  # use sudo if necessary
backend$ npm start
frontend$ npm start
```

## Seeds and Tests

```sh
backend$ npm test
```

Note: that the username:password "Peter:pw" is an Admin level user from the seeds file, opening full app functionality.

Note: To avoid an error when running tests, change line 10 of /backend/node_modules/json2mongo/node_modules/bson/ext/index.js to the following:

```js
bson = require('bson');
```
 