var config = {};
config.broker = {
    host: process.env.CMDPORT_BROKER,
    username: process.env.CMDPORT_BROKER_USERNAME,
    password: process.env.CMDPORT_BROKER_PASSWORD,
};

module.exports = config;