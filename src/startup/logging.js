require('express-async-errors');
const winston = require('winston');

module.exports = async function () {


    winston.exceptions.handle(new winston.transports.Console(), new winston.transports.File({ filename: 'bdm-backend.log', level: 'error' }));

    process.on('unhandledRejection', exception => {

        throw exception;
    })


}