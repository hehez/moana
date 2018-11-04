// var express = require('express');
// var router = express.Router();

// const transactionController = require('../controllers/transaction.controller');

// // get recurring transactions
// router.get('/', transactionController.getRecurringTransactions);

// // upsert transactions
// router.post('/', transactionController.upsertTransactions);

// module.exports = router;
// const mw = require('../middleware/transaction.middle')
require('../models/transaction.model');

module.exports = (app, base_uri) => {
    const transactionController = require('../controllers/transaction.controller');

    // app.use(mw(1));


    // root GET path
    app.get(base_uri, transactionController.getRecurringTransactions);
    // root POST path
    app.post(base_uri, transactionController.upsertTransactions);
}