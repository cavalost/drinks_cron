const getEnvVars = () => {
    const { NAME } = process.env;
    return {
        NAME
    };
};

const runJob = async function run() {
    const { NAME } = this.getEnvVars();
    console.log("Hello " + NAME);
};

module.exports = {
    runJob,
    getEnvVars
};
