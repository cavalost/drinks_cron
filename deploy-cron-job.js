const axios = require('axios');
require('dotenv').config();

const buildPayload = () => {
    const name = 'drinks-cronjob-js';
    const obj = {
        name,
        version: '1.0.0',
        props: {
            timer: {
                default: {
                    intervalSeconds: 60
                },
                type: '$.interface.timer'
            }
        }
    };
    const component_code = `module.exports = ${JSON.stringify(obj)};`
        .replace(
            '"$.interface.timer"}}',
            '"$.interface.timer"}}, run() { console.log("Run any Node.js code here"); }'
        );
    return {
        name,
        component_code
    };
};

const deploy = async () => {
    try {
        const payload = buildPayload();
        const { data } = axios({
            method: 'POST',
            url: 'https://api.pipedream.com/v1/sources',
            headers: {
                Authorization: `Bearer ${process.env.PIPEDREAM_API_KEY}`,
            },
            data: payload,
        });
        console.log({ data });
    } catch(err) {
        console.log({ err });
    }
};

deploy();
