// (function() {
// 	"use strict";

	var MouseModeEnum = {
		IGNORE: 'ignore',
		ATTRACT: 'attract',
		REPEL: 'repel'
	};

	// Make into constant
	Object.freeze(MouseModeEnum);
	// console.log('MouseModeEnum isFrozen: ' + Object.isFrozen(MouseModeEnum));

	Object.seal(MouseModeEnum);
	// console.log('MouseModeEnum isSealed: ' + Object.isSealed(MouseModeEnum));

// })();