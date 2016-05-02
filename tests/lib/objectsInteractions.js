const should = require('should');
const objectsInteractions = require('../../lib/objectsInteractions');

describe('createObjectInteraction', () => {
	it('should be an exported function', () => {
		should(objectsInteractions.createObjectInteraction).be.a.Function();
	});

	const createObjectInteraction = objectsInteractions.createObjectInteraction;

	it('should throw error if no config is defined', () => {
		createObjectInteraction.should.throw();
	});

	it('should throw error if config handler is not an array of functions', () => {
		createObjectInteraction.bind(null, {
			'type': {
				handlers: function() {}
			}
		}).should.throw();

		createObjectInteraction.bind(null, {
			'type': {
				handlers: 4
			}
		}).should.throw();

		createObjectInteraction.bind(null, {
			'type': {
				handlers: ['aef']
			}
		}).should.throw();
	});

	it('should throw error if config manipulate is not an object', () => {
		createObjectInteraction.bind(null, {
			'type': {
				manipulate: function() {}
			}
		}).should.throw();

		createObjectInteraction.bind(null, {
			'type': {
				manipulate: 4
			}
		}).should.throw();

		createObjectInteraction.bind(null, {
			'type': {
				manipulate: 'sergh'
			}
		}).should.throw();
	});

	it('should throw error if config manipulate doesn\'t contain types that is an array of functions', () => {
		createObjectInteraction.bind(null, {
			'type': {
				manipulate: {
					'otherType': 4
				}
			}
		}).should.throw();

		createObjectInteraction.bind(null, {
			'type': {
				manipulate: {
					'otherType': function() {}
				}
			}
		}).should.throw();

		createObjectInteraction.bind(null, {
			'type': {
				manipulate: {
					'otherType': 'sdag'
				}
			}
		}).should.throw();
	});

	describe('returned value', () => {
		const objectInteractions = createObjectInteraction({
			'a': {
				handlers: [
					(params, next) => {
						next();
					}
				],
				manipulate: {
					'b': [
						(params, next) => {
							next();
						}
					]
				}
			}
		});

		it('should be an object', () => {
			should(objectInteractions).be.an.Object();
		});

		it('should contain manipulate function', () => {
			should(objectInteractions.manipulate).be.a.Function();
		});

		it('should contain addObject function', () => {
			should(objectInteractions.addObject).be.a.Function();
		});

		it('should contain addObjects function', () => {
			should(objectInteractions.addObjects).be.a.Function();
		});

		it('should contain removeObject function', () => {
			should(objectInteractions.removeObject).be.a.Function();
		});

		it('should contain removeObjects function', () => {
			should(objectInteractions.removeObjects).be.a.Function();
		});

		it('should contain removeAllObjects function', () => {
			should(objectInteractions.removeAllObjects).be.a.Function();
		});

		it('should contain removeAllObjectsWithType function', () => {
			should(objectInteractions.removeAllObjectsWithType).be.a.Function();
		});
	});

	describe('handlers', () => {
		it('should handle the added object', () => {
			const objectInteractions = createObjectInteraction({
				'a': {
					handlers: [
						(params, next) => {
							params.object.value = 5;
							next();
						}
					]
				}
			});
			const obj = {
				value: 1
			};

			objectInteractions.addObject('a', obj);

			objectInteractions.manipulate();
			obj.value.should.eql(5);
		});

		it('should handle the embedded handlers', () => {
			const objectInteractions = createObjectInteraction({
				'a': {
					handlers: [
						(params, next) => {
							params.object.value = 7;
							next();
						},
						[
							(params, next) => {
								params.object.value = 5;
								next();
							}
						]
					]
				}
			});
			const obj = {
				value: 1
			};

			objectInteractions.addObject('a', obj);

			objectInteractions.manipulate();
			obj.value.should.eql(5);
		});

		it('should stop handle the next handlers if curr calls next with false', () => {
			const objectInteractions = createObjectInteraction({
				'a': {
					handlers: [
						(params, next) => {
							params.object.value = 7;
							next(false);
						},
						(params, next) => {
							params.object.value = 5;
							next();
						}
					]
				}
			});
			const obj = {
				value: 1
			};

			objectInteractions.addObject('a', obj);

			objectInteractions.manipulate();
			obj.value.should.eql(7);
		});
	});
});