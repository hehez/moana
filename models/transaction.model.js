const mongoose = require('mongoose');
const plugin = require('./plugins/search');

const TransactionSchema = mongoose.Schema({
    name: String,
    date: Date,
    amount: Number,
    trans_id: String,
    user_id: String,
    is_recurring: {type: Boolean, default: false}
    }, {
    versionKey: false
});


// pre hook
// TransactionSchema.pre('save', function (next) {
//     var self = this;
//     TransactionModel.find({trans_id : self.trans_id}, (err, docs) => {
//         if (!docs.length){
//             next();
//         } else {
//             console.log('transaction exists: ',self.trans_id, self._id);
//             next(new Error('transaction exists'));
//         }
//     });
// });

// plugin registration
TransactionSchema.plugin(plugin.searchPlugin);
var TransactionModel = mongoose.model('transaction', TransactionSchema, 'transactions');
// Export the model
module.exports = TransactionSchema;