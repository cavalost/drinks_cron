let { runJob, getEnvVars } = require('./cron-method');
require('dotenv').config();

this.getEnvVars = getEnvVars;
runJob = runJob.bind(this);
runJob();
