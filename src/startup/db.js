const db = require('../db/db-sequelize');


module.exports = async function () {

    db.authenticate()
        .then(() => {
            console.log('Baza raketa bolib uchyapti🚀🚀🚀');

        })

}