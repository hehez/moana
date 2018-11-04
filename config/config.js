const env = process.env.NODE_ENV || 'dev';

const dev = {
    server: {
        port: 1984
    },
    mongodb: {
        type: 'mongodb',
        host: 'localhost',
        port: 27017,
        name: 'interview_challenge'
    }
};
const config = {
    dev
};

module.exports = config[env];