# drinks_cron

## Factsheet

| **Category**              | **Value**                                 |
| ------------------------- | ---------------------------------------- |
| **Contact**               | claudina.avalos@opendeusto.es
| **Language / Framework**  | Node
| **Deployment type**       | PipeDream

## Configuration

Configuration is via the following environment variables:

| Env var      | Example      | Purpose                   |
| ------------ | ------------ | ------------------------- |
| `PIPEDREAM_API_KEY` | `-` | To create a new component using their API |
| `DRINKS_API` | `https://mock-api.drinks.test.siliconrhino.io` | RHINO MOCK API endpoint |
| `GMAPS_KEY` | `-` | To obtain the address of an event based on the coords
| `MONGO_URI` | `mongodb+srv://<username>:<password>@uri` | To fetch and insert data to the DB
| `MONGO_DB_NAME` | `drinks` | MongoDB database name


## Requirements
Node >= 8
An account in PipeDream in order to get the API key
An account in Google to enable GMAPS API services
Create a MongoDB endpoint with Atlas/other service

## How to run the cron job
Locally:
```
npm run start:local
```
Creating a PipeDream component:
```
npm run start
```

### Project description
Project based on: [https://github.com/PipedreamHQ/pipedream/tree/master/interfaces/timer/examples/create-component](https://github.com/PipedreamHQ/pipedream/tree/master/interfaces/timer/examples/create-component)
This project uploads a new PipeDream's component that will run a cron job defined
in the payload each 24 hours.

The cronjob will fetch all the events from the Rhino drinks' mock API and then will check
if the event exists in the database and otherwise it will insert it, obtaining the 
address through the coords using Gmaps Services.

Instead of upload each entire object, I have splitted up the logic into several collections,
as some data is repeated several times, in order to save space. The logic to join all the data
will be implemented in the backend.
