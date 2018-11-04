module.exports = (app, base_uri) => {
    app.get(base_uri, (req, resp, next) => {
        const data = require('../data/testdata');
        const mongoose = require('mongoose');
        const transactionModel = require('../models/transaction.model');

        transactionModel.insertMany(data, (err, docs) => {
            if (err) throw(err);
            return resp.status(200).send(docs);
        });
    });
}
