const mongoose = require('mongoose');
// const transactionModel = require('../models/transaction.model');
// require('../models/transaction.model');
const transactionModel = mongoose.model('transaction');
var async = require('async');
const N = 2;
const M_OFF = {1: 1, 2: 20, 3: 300, 4: 4000};
const DAY_OFF = 5;

exports.getRecurringTransactions = (req, resp, next) => {
    transactionModel
        .where({'is_recurring': {$eq: true}})
        .select('-is_recurring')
        .sort({name: 1, date : -1})
        .exec(
            function(err, docs) {
                console.log(Object.keys(docs).length);
                resp.json(docs);
            }
        );
}

function isRegularDayIntevals(arr) {
    for (var i = 0; i < arr.length - 1; i++) {
        if (Math.abs(arr[i] - arr[i + 1]) > DAY_OFF) return false;
    }
    return true;
}

function getDigitsNums(num) {
    var num = Math.abs(num | 0);
    var i = 0;
    while (num > 0) {
        num = (num / 10) | 0;
        i++;
    }
    return i;
}

exports.upsertTransactions = async (req, resp) => {
    var data = req.body;
    var values = [];
    var resValues = [];
    var res = [];
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        var name = d.name;
        var userId = d.user_id;
        console.log(i, name, userId);
        var globelInterval;
        var globelDiffDay;

        var promiseByNameId = transactionModel.findByNameId({'name': name, 'user_id': userId}).exec();
        await promiseByNameId.then(async (docs) => {
            // console.log(i, '<exact name+id> return', docs.length);
            if (docs.length == 0) {
                var promiseByLikeNameId = transactionModel.findByLikeNameId({'name': name, 'user_id': userId})
                .sort({'date': -1})
                .exec();
                await promiseByLikeNameId.then(async (docs) => {
                    // console.log(i, '<similar name+id> return', docs.length);
                    if (docs.length == 0) {
                        // insert new record
                        // console.log(i, 'adding...', d);
                        await transactionModel.create(d, async (err, result) => {
                            await values.push(result);
                        });
                    } else {
                        /**
                         * defind threshold N. If greater than N matches, check amount/time
                         */
                        if (docs.length >= N) {
                            // check amount/time
                            // console.log(i, 'more than', N, 'records, check amount/time and update all', name, userId, docs.length, d.date)
                            var intervals = []
                            var amounts = []
                            var ids = []
                            var tmpDate = new Date(d.date);
                            var tmpAmount = d.amount;
                            var isSimilarAmount = true;
                            var localDiff;
                            docs.forEach((doc) => {
                                ids.push(doc._id);
                                // console.log(doc)
                                var date = doc.date;
                                var diff = tmpDate - date;
                                localDiff = diff;
                                var diffDay = Math.floor(diff / 86400000);
                                intervals.push(diffDay);
                                tmpDate = date;


                                var amount = doc.amount;
                                var tam = getDigitsNums(tmpAmount);
                                var am = getDigitsNums(amount);
                                if (Math.abs(tam - am) <= 1) {
                                    var diffAmount = Math.abs(tmpAmount - amount) | 0;
                                    // if (diffAmount > )
                                }
                                var diffAmount = Math.abs(tmpAmount - amount) | 0;
                                if (diffAmount > M_OFF[(tam >= am ? tam : am)]) {
                                    isSimilarAmount = false;
                                }
                                tmpAmount = amount;

                            });
                            // intervals
                            var isRegularIntevals = isRegularDayIntevals(intervals);
                            // console.log(isRegularIntevals, isSimilarAmount)
                            if (isRegularIntevals && isSimilarAmount) {
                                // update all docs
                                // insert new record
                                // console.log('update all', docs.name);
                                await transactionModel.updateMany({'_id': {$in: ids}}, {'is_recurring': true}, async (err, result) => {
                                    await values.push(result);
                                });
                            } else {
                                // insert new record
                            }
                            // console.log('adding...');
                            globelDiffDay = localDiff;
                            d.is_recurring = true;
                            await transactionModel.create(d, async (err, result) => {
                                await values.push(result);
                            });
                        } else {
                            // insert new record
                            // console.log(i, 'adding...', d);
                            await transactionModel.create(d, async (err, result) => {
                                await values.push(result);
                            });
                        }
                    }
                });
            } else {
                if (docs.length >= N) {
                    // check amount/time
                    // console.log(i, 'more than', N, 'records, check amount/time and update all', name, userId, docs.length, d.date)
                    var intervals = []
                    var amounts = []
                    var ids = []
                    var tmpDate = new Date(d.date);
                    var tmpAmount = d.amount;
                    var isSimilarAmount = true;
                    var localDiff;
                    docs.forEach((doc) => {
                        ids.push(doc._id);
                        var date = doc.date;
                        var diff = tmpDate - date;
                        globelDiffDay = diff;
                        localDiff = diff;
                        var diffDay = Math.floor(diff / 86400000);
                        intervals.push(diffDay);
                        tmpDate = date;


                        var amount = doc.amount;
                        var tam = getDigitsNums(tmpAmount);
                        var am = getDigitsNums(amount);
                        if (Math.abs(tam - am) <= 1) {
                            var diffAmount = Math.abs(tmpAmount - amount) | 0;
                            // if (diffAmount > )
                        }
                        var diffAmount = Math.abs(tmpAmount - amount) | 0;
                        if (diffAmount > M_OFF[(tam >= am ? tam : am)]) {
                            isSimilarAmount = false;
                        }
                        tmpAmount = amount;

                    });
                    // intervals
                    var isRegularIntevals = isRegularDayIntevals(intervals);
                    if (isRegularIntevals && isSimilarAmount) {
                        // update all docs
                        // insert new record
                        await transactionModel.updateMany({'_id': {$in: ids}}, {'is_recurring': true}, async (err, result) => {
                            await values.push(result);
                        });
                    }
                    globelDiffDay = localDiff;
                    d.is_recurring = true;
                    await transactionModel.create(d, async (err, result) => {
                        await values.push(result);
                    });
                } else {
                    // insert new record
                    await transactionModel.create(d, async (err, result) => {
                        await values.push(result);
                    });
                }
            }
        });

        var resModel = {
            name: d.name,
            user_id: d.user_id,
            next_amt: d.amount,
            next_date: new Date(new Date(d.date).getTime()+globelDiffDay)
        };
        console.log('resModel', resModel);
        // var records = transactionModel
        //         .where({'is_recurring': {$eq: true}, 'name': d.name, 'user_id': d.user_id})
        //         .select('-is_recurring')
        //         .sort({name: 1, date : -1})
        //         .exec();
        // await records.then(async, (docs) => {
        //     console.log('records', docs);
        // });
            // console.log('records', records);
            // await resModel.update({'transaction': records});
        res.push(resModel);
            // console.log('res', res);
        }
    console.log('all done');
    resp.status(200).send(res);
}