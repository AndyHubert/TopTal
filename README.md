## Dependencies

* Node >= 6.4.0
* npm >= 3.10.3
* MongoDB >= 3.2.9

## Installation

```sh
cd frontend && npm install
cd ../backend && npm install
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
cd backend
npm test
```

Note that the username:password "Peter:pw" is an Admin level user from the seeds file, opening full app functionality. 