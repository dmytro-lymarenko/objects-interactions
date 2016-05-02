'use strict';

const DELETE_FUNCTION_NAME = '__deleteFromObjectInteraction';
const HANDLER_NAME = 'handler';
const MANIPULATE_NAME = 'manipulate';

function createObjectInteraction(config) {
	// Setting up config
	if (typeof config !== 'object') {
		throw new Error('Config must be an object.');
	}

	const mConfig = {};

	for (let objectType in config) {
		const configObjectType = config[objectType];
		if (typeof configObjectType !== 'object') {
			throw new Error('Object type in config must be an object');
		}

		mConfig[objectType] = {};
		checkHandlers(configObjectType.handlers || []);

		mConfig[objectType].handler = combineHandlers(configObjectType.handlers || []);
		mConfig[objectType].manipulate = {};

		if (configObjectType.manipulate) {
			if (typeof configObjectType.manipulate !== 'object') {
				throw new Error('Manipulate must be an object.');
			}
			for (let otherObjectType in configObjectType.manipulate) {
				const manipulateOtherObjectType = configObjectType.manipulate[otherObjectType];
				checkHandlers(manipulateOtherObjectType || []);
				mConfig[objectType].manipulate[otherObjectType] = 
					combineHandlers(manipulateOtherObjectType || []);
			}
		}
	}

	let index = 0;
	const indexToType = {};
	const typeToObject = {};

	
	/*const indexToType = {
		0: 'type'
	};
	const typeToObject = {
		'type': {
			0: object
		}
	};*/

	function checkHandlers(handlers) {
		if (Array.isArray(handlers)) {
			return handlers.forEach(handler => {
				if (typeof handler !== 'function') {
					return checkHandlers(handler);
				}
			});
		}
		throw new Error('Config handlers must be an array of functions');
	}

	function combineHandlers(handlers) {
		const hs = handlers.map(handler => {
			if (typeof handler === 'function') {
				return handler;
			}
			return combineHandlers(handler);
		});
		return (params, callback) => {
			let i = -1;
			let n = hs.length;
			const mCallback = typeof callback === 'function' ? callback : () => {};
			const next = value => {
				if (value === false) {
					return mCallback(false);
				}
				if (++i < n) {
					hs[i](params, next);
				} else {
					mCallback();
				}
			};
			next();
		};
	}

	function forEachInType(objectType, callback) {
		const indexes = typeToObject[objectType];
		for (let index in indexes) {
			callback(indexes[index], objectType, index);
		}
	}

	function forEach(callback) {
		for (let objectType in typeToObject) {
			forEachInType(objectType, callback);
		}
	}

	function manipulate() {
		for (let objectType in typeToObject) {
			const configObjectType = mConfig[objectType];
			if (configObjectType) {
				const indexes = typeToObject[objectType];
				const handler = configObjectType.handler;
				const manipulate = configObjectType.manipulate;

				if (handler) {
					for (let index in indexes) {
						handler({
							object: indexes[index]
						});
					}
				}

				if (manipulate) {
					for (let index in indexes) {
						for (let otherObjectType in manipulate) {
							const m = manipulate[otherObjectType];
							if (m) {
								m({
									object: indexes[index],
									otherObject
								});
							}
						}
					}
				}
			}
		}
	}

	function addObject(type, object) {
		if (type && object) {
			if (typeof object[DELETE_FUNCTION_NAME] === 'function') {
				object[DELETE_FUNCTION_NAME]();
			}
			const id = index++;

			indexToType[id] = type;
			if (!typeToObject[type]) {
				typeToObject[type] = {};
			}
			typeToObject[type][id] = object;

			object[DELETE_FUNCTION_NAME] = () => {
				delete typeToObject[type][id];
				delete indexToType[id];
				delete object[DELETE_FUNCTION_NAME];
			};
		}
	}

	function addObjects(type, objects) {
		if (type && Array.isArray(objects)) {
			objects.forEach(object => {
				addObject(type, object);
			});
		}
	}

	// object must have [DELETE_FUNCTION_NAME] function otherwise it can't delete
	function removeObject(object) {
		if (typeof object !== 'object') {
			throw new Error(`Try to remove not object (${typeof object})`);
		}
		if (typeof object[DELETE_FUNCTION_NAME] !== 'function') {
			throw new Error('Invalid object. Be sure object was added to object interactions.');
		}
		object[DELETE_FUNCTION_NAME]();
	}

	function removeObjects(objects) {
		if (!Array.isArray(objects)) {
			// maybe objects is object
			removeObject(objects);
		} else {
			objects.forEach(object => {
				removeObject(object);
			});
		}
	}

	function removeAllObjects() {
		forEach(object => {
			object[DELETE_FUNCTION_NAME]();
		});
	}

	function removeAllObjectsWithType(objectType) {
		if (typeToObject[objectType]) {
			forEachInType(objectType, object => {
				object[DELETE_FUNCTION_NAME]();
			});
		}
	}

	return {
		manipulate,
		addObject,
		addObjects,

		removeObject,
		removeObjects,
		removeAllObjects,
		removeAllObjectsWithType
	};
}

module.exports = {
	DELETE_FUNCTION_NAME,
	createObjectInteraction
};