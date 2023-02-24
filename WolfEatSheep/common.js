const [
	SHEEP,
	WOLF
] = [1, 2];

const CELL_COUNT = 6;

function addClass(element, className) {
	if (!element || !className) {
		return;
	}
	if (element.classList) {
		element.classList.add(className);
	} else {
		const classes = element.className.split(' ');
		if (classes.indexOf(className) === -1) {
		classes.push(className);
		}
		element.className = classes.join(' ');
	}
}

function removeClass(element, className) {
	if (!element || !className) {
		return;
	}
	if (element.classList) {
		element.classList.remove(className);
	} else {
		const classes = element.className.split(' ');
		const index = classes.indexOf(className);
		if (index !== -1) {
			classes.splice(index, 1);
			element.className = classes.join(' ');
		}
	}
}
