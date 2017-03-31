var MouseModeEnum = {
	FREE: 'free',
	FOLLOW: 'follow',
	REPEL: 'repel'
}

// Make into constant if supported by browser
if (Object.freeze()) {
	Object.freeze(MouseModeEnum);
}