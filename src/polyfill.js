Math.tanh = Math.tanh || function (x) {
	if (x === Infinity) {
		return 1;
	}
	else if (x === -Infinity) {
		return -1;
	}
	else {
		var y = Math.exp(2 * x);
		return (y - 1) / (y + 1);
	}
};
Math.sign = Math.sign || function (x) {
	x = +x; // convert to a number
	if (x === 0 || isNaN(x)) {
		return x;
	}
	return x > 0 ? 1 : -1;
};
Number.EPSILON = Number.EPSILON || 2.220446049250313e-16;