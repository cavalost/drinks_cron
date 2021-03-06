const axios = require('axios');
const { runJob, getEnvVars } = require('./cron-method');
require('dotenv').config();

const buildPayload = () => {
    const name = 'drinks-cronjob-js';
    const obj = {
        name,
        version: '1.0.0',
        methods: {
            getEnvVars: ""
        },
        props: {
            timer: {
                default: {
                    intervalSeconds: 60 * 60 * 24,
                },
                type: '$.interface.timer'
            }
        }
    };
    const component_code = `module.exports = ${JSON.stringify(obj)};`
        .replace('"getEnvVars":""', `"getEnvVars": function() { return ${JSON.stringify(getEnvVars())}}`)
        .replace(
            '"$.interface.timer"}}',
            `"$.interface.timer"}}, ${('' + runJob).replace('function run', 'run')}`
        );
    return {
        name,
        component_code
    };
};

const deploy = async () => {
    try {
        const payload = buildPayload();
        console.log({ payload });
        const { data } = await axios({
            method: 'POST',
            url: 'https://api.pipedream.com/v1/sources',
            headers: {
                Authorization: `Bearer ${process.env.PIPEDREAM_API_KEY}`,
            },
            data: payload,
        });
        console.log({ data });
    } catch (err) {
        console.log({ err });
    }
};

deploy();
