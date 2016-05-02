const DELETE_FUNCTION_NAME = require('../objectsInteractions').DELETE_FUNCTION_NAME;

module.exports = function(params, next) {
	params.object[DELETE_FUNCTION_NAME]();
	next(false);
}