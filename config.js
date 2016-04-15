var config = {};
config.broker.host = process.env.CMDPORT_MQTT_BROKER
config.broker.username = process.env.CMDPORT_MQTT_BROKER_USERNAME
config.broker.password = process.env.CMDPORT_MQTT_BROKER_PASSWORD
module.exports = config;