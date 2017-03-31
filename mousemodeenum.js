var MouseModeEnum = {
	FREE: 'free',
	FOLLOW: 'follow',
	REPEL: 'repel'
}

// Make into constant
Object.freeze(MouseModeEnum);
// console.log('MouseModeEnum isFrozen: ' + Object.isFrozen(MouseModeEnum));

Object.seal(MouseModeEnum);
// console.log('MouseModeEnum isSealed: ' + Object.isSealed(MouseModeEnum));



