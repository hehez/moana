module.exports = {
    searchPlugin(schema, options) {
        // statics
        schema.statics.findByType = findByType;
        schema.statics.findByNameId = findByNameId;
        schema.statics.findByLikeNameId = findByLikeNameId;
        schema.statics.printJson = printJson;

        // methods
        schema.methods.toString = toString;
        // schema.methods.findByName = findByName;
    }
}

/* statics */
function findByType(type, callback) {
  this.find({ type: new RegExp(type, 'i') }, callback);
}

function findByNameId(param, callback) {
    return this.find(param, callback);
}

function findByLikeNameId(param, callback) {
    var companyNm;
    var name = param.name;
    var index = name.lastIndexOf(' ');
    if (index == -1) {
        companyNm = name;
    } else {
        // further fine-gain
        companyNm = name.slice(0, index);
    }
    // {name: new RegExp('^' + companyNm, 'i')}
    // {name: '/^' + companyNm +'/'})
    param.name = {'$regex': companyNm}
    console.log(param)
    return this.find(param, callback);
}

function printJson(data, callback) {
    console.log(data, callback);
}

/* mothods*/
function toString(type) {
    console.log(this, '->');
}


