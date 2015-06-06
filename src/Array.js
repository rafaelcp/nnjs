//TODO: rightTriangular, eig, inv, pinv, det, chol, lu, qr, trace, diag, getCol, cond, rcond, svd
(function () {
	'use strict';
	Array.prototype.max = function (arr) {
		if (!!arr) {
			if (arr.length !== this.length) {
				throw 'Array sizes must match';
			}
			return this.map(function (el, i) { if (isNaN(el)) { return arr[i]; } if (isNaN(arr[i])) { return el; } return Math.max(el, arr[i]); });
		}
		else {
			if (this.length === 0) {
				return null;
			}
			return Math.max.apply(null, this);
		}
	};
	Array.prototype.argmax = function () {
		return this.indexOf(this.max());
	};
	Array.prototype.min = function (arr) {
		if (!!arr) {
			if (arr.length !== this.length) {
				throw 'Array sizes must match';
			}
			return this.map(function (el, i) { if (isNaN(el)) { return arr[i]; } if (isNaN(arr[i])) { return el; } return Math.min(el, arr[i]); });
		}
		else {
			if (this.length === 0) {
				return null;
			}
			return Math.min.apply(null, this);
		}
	};
	Array.prototype.argmin = function () {
		return this.indexOf(this.min());
	};
	Array.prototype.sum = function () {
		return this.reduce(function (a, b) { return a + (b || 0); }, 0);
	};
	Array.prototype.prod = function () {
		return this.reduce(function (a, b) { return a * (isNaN(b) ? 1 : b); }, 1);
	};
	Array.prototype.count = function () {
		return this.reduce(function (a, b) { return a + (isNaN(b) ? 0 : 1); }, 0);
	};
	Array.prototype.mean = function () {
		if (this.count() === 0) {
			return null;
		}
		return this.sum() / this.count();
	};
	Array.prototype.median = function () {
		if (this.length === 0) {
			return null;
		}
		var sorted = this.sort();
		if (this.length % 2 === 1) {
			return sorted[Math.floor(this.length / 2)];
		}
		else {
			return sorted.slice(Math.floor(this.length / 2) - 1, Math.floor(this.length / 2) + 1).mean();
		}
	};
	Array.prototype.variance = function () {
		if (this.count() <= 1) {
			return null;
		}
		var m = this.mean();
		var sqdiffs = this.map(function (el) { return Math.pow(el - m, 2); });
		return sqdiffs.sum() / (this.count() - 1);
	};
	Array.prototype.stddev = function () {
		if (this.count() <= 1) {
			return null;
		}
		return Math.sqrt(this.variance());
	};
	Array.prototype.dot = function (arr) {
		if (arr.length !== this.length) {
			throw 'Array sizes must match (' + this.length + ' x ' + arr.length + ')';
		}
		var result = 0;
		this.forEach(function (el, i) { if (!isNaN(el) && !isNaN(arr[i])) { result += el * arr[i]; } });
		return result;
	};
	Array.prototype.outer = function (arr) {
		if (arr.length !== this.length) {
			throw 'Array sizes must match';
		}
		var arr2 = [];
		this.forEach(function (el, i) {
			var j;
			arr2[i] = [];
			for (j = 0; j < arr.length; j++) {
				arr2[i][j] = el * arr[j];
			}
		});
		return arr2;
	};
	Array.prototype.norm = function () {
		return Math.sqrt(this.dot(this));
	};
	Array.prototype.addScalar = function (x) {
		if (x.length) {
			throw 'Argument must be a scalar';
		}
		var arr = [];
		this.forEach(function (el, i) { if (el.length) { arr[i] = el.addScalar(x); } else { arr[i] = el + x; } });
		return arr;
	};
	Array.prototype.subScalar = function (x) {
		if (x.length) {
			throw 'Argument must be a scalar';
		}
		return this.addScalar(-x);
	};
	Array.prototype.mulScalar = function (x) {
		if (x.length) {
			throw 'Argument must be a scalar';
		}
		var arr = [];
		this.forEach(function (el, i) { if (el.length) { arr[i] = el.mulScalar(x); } else { arr[i] = el * x; } });
		return arr;
	};
	Array.prototype.divScalar = function (x) {
		if (x.length) {
			throw 'Argument must be a scalar';
		}
		return this.mulScalar(1 / x);
	};
	Array.prototype.normalize = function () {
		return this.divScalar(this.norm());
	};
	Array.prototype.add = function (arr) {
		if (!arr.length) {
			return this.addScalar(arr);
		}
		if (arr.length !== this.length) {
			throw 'Array sizes must match';
		}
		var arr2 = [];
		this.forEach(function (el, i) { if (el.length) { arr2[i] = el.add(arr[i]); } else { arr2[i] = el + arr[i]; } });
		return arr2;
	};
	Array.prototype.sub = function (arr) {
		if (!arr.length) {
			return this.subScalar(arr);
		}
		if (arr.length !== this.length) {
			throw 'Array sizes must match';
		}
		return this.add(arr.mulScalar(- 1));
	};
	Array.prototype.mul = function (arr) {
		if (!arr.length) {
			return this.mulScalar(arr);
		}
		if (arr.length !== this.length) {
			throw 'Array sizes must match';
		}
		var arr2 = [];
		this.forEach(function (el, i) { if (el.length) { arr2[i] = el.mul(arr[i]); } else { arr2[i] = el * arr[i]; } });
		return arr2;
	};
	Array.prototype.div = function (arr) {
		if (!arr.length) {
			return this.divScalar(arr);
		}
		if (arr.length !== this.length) {
			throw 'Array sizes must match';
		}
		var arr2 = [];
		this.forEach(function (el, i) { if (el.length) { arr2[i] = el.div(arr[i]); } else { arr2[i] = el / arr[i]; } });
		return arr2;
	};
	Array.prototype.squareDistance = function (arr) {
		if (arr.length !== this.length) {
			throw 'Array sizes must match';
		}
		var diff = this.sub(arr);
		return diff.dot(diff);
	};
	Array.prototype.distance = function (arr) {
		if (arr.length !== this.length) {
			throw 'Array sizes must match';
		}
		return Math.sqrt(this.squareDistance(arr));
	};
	Array.prototype.dims = function () {
		if (this.length === 0) {
			return [0, 0];
		}
		return [this.length, this[0].length || 1];
	};
	Array.prototype.flatten = function () {
		var i, v2 = [];
		for (i = 0; i < this.length; i++) {
			if (this[i].length === 1) {
				v2[i] = this[i][0];
			}
			else {
				v2[i] = this[i];
			}
		}
		return v2;
	};
	Array.prototype.transpose = function () {
		if (this.length === 0) {
			return [];
		}
		var i, j, M2 = [];
		M2[0] = [];
		for (i = 0; i < this.length; i++) {
			if (!this[i].length) {
				M2[0][i] = this[i];
			}
			else {
				for (j = 0; j < this[i].length; j++) {
					if (!M2[j]) {
						M2[j] = [];
					}
					M2[j][i] = this[i][j];
				}
			}
		}
		return M2;
	};
	Array.prototype.toMatrix = function () {
		return this.transpose().transpose();
	};
	Array.prototype.matProd = Array.prototype.x = function (M2) {
		var i, j, M3 = [], M1 = this.toMatrix();
		var M2_ = M2.transpose();
		if (M1.dims()[1] !== M2.dims()[0]) {
			throw 'matProd: Dimension mismatch (' + M1.dims()[1] + ' !==' + M2.dims()[0] + ')';
		}
		for (i = 0; i < M1.length; i++) {
			M3[i] = [];
			for (j = 0; j < M2_.length; j++) {
				M3[i][j] = M1[i].dot(M2_[j]);
			}
		}
		return M3.flatten();
	};
	Array.prototype.inspect = function () {
		if (this.dims()[1] === 1) {
			return this.toString();
		}
		else if (this.dims()[0] === 1) {
			return this[0].toString();
		}
		else {
			var i, s = '';
			for (i = 0; i < this.length; i++) {
				s += this[i].inspect();
				if (i !== this.length - 1) {
					s += '\n';
				}
			}
			return s;
		}
	};
	Array.prototype.addColumn = function (which, value) {
		value = value || 0;
		var data = this.slice();
		for (var i = 0; i < data.length; i++) {
			data[i].splice(which, 0, value);
		}
		return data;
	}
	Array.prototype.removeColumn = function (which) {
		var data = this.slice();
		for (var i = 0; i < data.length; i++) {
			data[i].splice(which, 1);
		}
		return data;
	}
	//STATIC METHODS
	Array.repeat = function (x, n, m) {
		if (x === undefined) {
			throw 'Must specify element to repeat.';
		}
		if (!n) {
			throw 'Must specify number of repetitions.';
		}
		m = m || 1;
		var i, j, arr = [];
		for (i = 0; i < n; i++) {
			arr[i] = [];
			for (j = 0; j < m; j++) {
				arr[i][j] = x;
			}
		}
		return arr.flatten();
	};
	Array.random = function (n, m) {
		if (!n) {
			throw 'Must specify matrix size.';
		}
		m = m || 1;
		var i, j, arr = [];
		for (i = 0; i < n; i++) {
			arr[i] = [];
			for (j = 0; j < m; j++) {
				arr[i][j] = Math.random();
			}
		}
		return arr.flatten();
	};
	Array.zeros = function (n, m) {
		if (!n) {
			throw 'Must specify matrix size.';
		}
		m = m || 1;
		return Array.repeat(0, n, m);
	};
	Array.ones = function (n, m) {
		if (!n) {
			throw 'Must specify matrix size.';
		}
		m = m || 1;
		return Array.repeat(1, n, m);
	};
	Array.eye = function (n, m) {
		if (!n) {
			throw 'Must specify matrix size.';
		}
		m = m || n;
		var i, j;
		var arr = [];
		for (i = 0; i < n; i++) {
			arr[i] = [];
			for (j = 0; j < m; j++) {
				if (i === j) {
					arr[i][j] = 1;
				}
				else {
					arr[i][j] = 0;
				}
			}
		}
		return arr;
	};
	Object.defineProperty(Array.prototype, 'max', {enumerable: false});
	Object.defineProperty(Array.prototype, 'argmax', {enumerable: false});
	Object.defineProperty(Array.prototype, 'min', {enumerable: false});
	Object.defineProperty(Array.prototype, 'argmin', {enumerable: false});
	Object.defineProperty(Array.prototype, 'sum', {enumerable: false});
	Object.defineProperty(Array.prototype, 'mean', {enumerable: false});
	Object.defineProperty(Array.prototype, 'median', {enumerable: false});
	Object.defineProperty(Array.prototype, 'var', {enumerable: false});
	Object.defineProperty(Array.prototype, 'stddev', {enumerable: false});
	Object.defineProperty(Array.prototype, 'dot', {enumerable: false});
	Object.defineProperty(Array.prototype, 'outer', {enumerable: false});
	Object.defineProperty(Array.prototype, 'norm', {enumerable: false});
	Object.defineProperty(Array.prototype, 'addScalar', {enumerable: false});
	Object.defineProperty(Array.prototype, 'subScalar', {enumerable: false});
	Object.defineProperty(Array.prototype, 'mulScalar', {enumerable: false});
	Object.defineProperty(Array.prototype, 'divScalar', {enumerable: false});
	Object.defineProperty(Array.prototype, 'normalize', {enumerable: false});
	Object.defineProperty(Array.prototype, 'add', {enumerable: false});
	Object.defineProperty(Array.prototype, 'sub', {enumerable: false});
	Object.defineProperty(Array.prototype, 'mul', {enumerable: false});
	Object.defineProperty(Array.prototype, 'div', {enumerable: false});
	Object.defineProperty(Array.prototype, 'squareDistance', {enumerable: false});
	Object.defineProperty(Array.prototype, 'distance', {enumerable: false});
	Object.defineProperty(Array.prototype, 'dims', {enumerable: false});
	Object.defineProperty(Array.prototype, 'flatten', {enumerable: false});
	Object.defineProperty(Array.prototype, 'transpose', {enumerable: false});
	Object.defineProperty(Array.prototype, 'toMatrix', {enumerable: false});
	Object.defineProperty(Array.prototype, 'matProd', {enumerable: false});
	Object.defineProperty(Array.prototype, 'x', {enumerable: false});
	Object.defineProperty(Array.prototype, 'inspect', {enumerable: false});
}());