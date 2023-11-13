import pino from 'pino';

const logger = pino({}, pino.destination());

export default logger;
