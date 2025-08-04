const winston = require('winston');

function errorMiddleware(error, req, res, next) {
    let { status = 500, message, data } = error;

    console.log(`[Xatolik] ${error}`);
    winston.error(error.message, error);
    console.log(error.message);

    // Excel fayli uchun maxsus holat
    if (message === 'excel_file') {
        message = req.mf('Faqat Excel fayllariga ruxsat beriladi.');
    }

    // Sequelize yoki express-validator xatolari
    else if (message === 'Validation error') {
        const errors = [];
        error.errors.forEach(element => {
            element.message = req.mf(element.message); // har bir validation xabarini tarjima qilish
            errors.push({
                msg: element.message,
                param: element.path,
                location: "body",
            });
        });
        status = 400;
        data = { errors: errors };
        message = req.mf("Ma'lumotlarni tekshirishda xatolik yuz berdi.");
    }

    // Boshqa umumiy xabarlar
    else {
        try {
            message = req.mf(error.message);
        } catch (e) {
            message = error.message;
        }
    }

    // Server (500) xatolari uchun qo‘shimcha kontekst
    if (status === 500) {
        message = `${req.originalUrl} - ${message}`;
    }

    const response = {
        type: 'error',
        status,
        message,
        ...(data && { data })
    };

    res.status(status).send(response);
}

module.exports = errorMiddleware;
