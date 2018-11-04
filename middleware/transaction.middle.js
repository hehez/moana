module.exports = function(options) {
    return function(req, resp, next) {
        console.log('middleware is loaded!');
        next();
    }
}