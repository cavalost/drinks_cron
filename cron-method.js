const getEnvVars = () => {
    const { DRINKS_API, GMAPS_KEY, MONGO_URI, MONGO_DB_NAME } = process.env;
    return {
        DRINKS_API,
        GMAPS_KEY,
        MONGO_URI,
        MONGO_DB_NAME
    };
};

const runJob = async function run() {
    const axios = require('axios');
    const _get = require('lodash/get');
    const { MongoClient } = require('mongodb');
    const { Client } = require('@googlemaps/google-maps-services-js');

    const { DRINKS_API, GMAPS_KEY, MONGO_URI, MONGO_DB_NAME } = this.getEnvVars();
    let mongoDbClient, db;

    const fetchEvents = async (pageNumber = 1, pageSize = 10) =>
        (await axios.get(`${DRINKS_API}/events?page=${pageNumber}&pageSize=${pageSize}`)).data;

    const fetchAllEvents = async () => {
        const pageSize = 10;
        let pageNumber = 0;
        let events = [];
        do {
            const newEvents = await fetchEvents(++pageNumber);
            events = [ ...events, ...newEvents];
        } while (events.length === (pageSize * pageNumber));
        return events;
    };

    const getAddress = async ({ latitude: lat, longitude: lng, name}) => {
        const client = new Client({});
        let address;
        const respCode = await client
            .reverseGeocode({
                params: {
                    latlng: { lat, lng },
                    key: GMAPS_KEY
                }
            });
        const { compound_code } = _get(respCode, 'data.plus_code', {});
        if (compound_code) {
            const respAddress = await client.geocode({
                params: {
                    address: compound_code + ' ' + name,
                    key: GMAPS_KEY
                },
            });
            address = _get(respAddress, 'data.results.0.formatted_address');
        }
        return address;
    };

    const fetchLocation = async location => {
        let locationDocument = await db.collection('locations')
            .findOne({ latitude: location.latitude, longitude: location.longitude });
        if (!locationDocument) {
            const address = await getAddress(location);
            if (address) {
                location.address = address;
            }
            ({ ops: [locationDocument] } = await db.collection('locations').insertOne(location));
        }
        return locationDocument;
    };

    const fetchUser = async user => {
        let userDocument = await db.collection('users')
            .findOne({ name: user.name });
        if (!userDocument) {
            ({ ops: [userDocument] } = await db.collection('users').insertOne(user));
        }
        return userDocument;
    };

    const fetchComment = async comment => {
        comment.user = (await fetchUser(comment.user))._id;
        let commentDocument = await db.collection('comments')
            .findOne({ timestamp: comment.timestamp, user: comment.user });
        if (!commentDocument) {
            ({ ops: [commentDocument] } = await db.collection('comments').insertOne(comment));
        }
        return commentDocument;
    };

    try {
        console.log('Job starts');
        mongoDbClient = await MongoClient.connect(MONGO_URI, { useNewUrlParser: true });
        db = mongoDbClient.db(MONGO_DB_NAME);
        const events = await fetchAllEvents();
        for (const { location = {}, comments = [], guests = [], ...restEvent } of events) {
            const eventDocument = await db.collection('events').findOne({ id: restEvent.id });
            if (!eventDocument) {
                restEvent.locationId = (await fetchLocation(location))._id;
                restEvent.creator = (await fetchUser(restEvent.creator))._id;
                restEvent.guests = [];
                for (const guest of guests) {
                    restEvent.guests.push((await fetchUser(guest))._id);
                }
                restEvent.comments = [];
                for (const comment of comments) {
                    restEvent.comments.push((await fetchComment(comment))._id);
                }
                await db.collection('events').insertOne(restEvent);
            }
        }
    } catch (error) {
        console.log({error});
    } finally {
        await mongoDbClient.close();
        console.log('Job ends');
    }
};

module.exports = {
    runJob,
    getEnvVars
};
