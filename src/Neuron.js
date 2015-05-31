'use strict';
function Neuron(n) {
	this.lr = 0.1;
	this.momentum = 0.0;
	this.decay = 0.0;
	this.eps = 1e-4;
	this.acum = 0;
	this.transfer = Neuron.transfer.identity;
	this.aggregate = Neuron.aggregation.dot;
	this.errorFunction = Neuron.error.MSE;
	this.randomize = function (n) {
		this.prevChange = Array.zeros(n);
		this.W = Array.random(n, 1).mul(2).sub(1).div(Math.sqrt(n));
	};
	if (!!n) {
		this.randomize(n);
	}
	this.activate = function (input) {
		if (!this.W) {
			this.randomize(input.length);
		}
		return this.transfer(this.aggregate(this.W, input));
	};
	this.batchActivate = function (inputs) {
		var activations = [];
		for (var i = 0; i < inputs.length; i++) {
			activations.push(this.activate(inputs[i]));
		}
		return activations;
	};
	this.grad = function (input, ainput, output, target, W) {
		return this.aggregate.dw(W, input).mul(this.errorFunction.d(output, target) * this.transfer.d(ainput, output));
	};
	this.learn = function (input, target) {
		if (!this.W) {
			this.randomize(input.length);
		}
		var ainput = this.aggregate(this.W, input);
		var output = this.transfer(ainput);
		var grad = this.grad(input, ainput, output, target, this.W);
		var err = target - output;
		//console.log('ainput', ainput,'output', output,'target', target,'grad',grad,'err',err);
		this.acum += output;
		var change = grad.mul(1 - this.momentum).add(this.W.mul(this.decay)).mul(this.lr).add(this.prevChange.mul(this.momentum));
		this.W = this.W.sub(change);
		this.prevChange = change.slice();
		return err;
	};
	this.cost = function (input, target, W) {
		var ainput0 = this.aggregate(W, input);
		var output0 = this.transfer(ainput0);
		return this.errorFunction(output0, target);
	};
	this.check = function (input, target) {
		if (!this.W) {
			this.randomize(input.length);
		}
		var i;
		var W = this.W.slice();
		var ainput0 = this.aggregate(W, input);
		var output0 = this.transfer(ainput0);
		var grad = this.grad(input, ainput0, output0, target, W);
		var numGrad = [];
		for (i = 0; i < input.length; i++) {
			var W1 = W.slice();
			var W2 = W.slice();
			W1[i] -= this.eps;
			W2[i] += this.eps;
			var err1 = this.cost(input, target, W1);
			var err2 = this.cost(input, target, W2);
			numGrad[i] = (err2 - err1) / (2 * this.eps);
			//if (Math.abs(numGrad[i] - grad[i]) > eps) return false;
		}
		//console.log('GRAD',grad);
		//console.log('NUM_GRAD',numGrad);
		return [grad, numGrad];
	};
	this.batchCheck = function (inputs, targets) {
		if (!this.W) {
			this.randomize(inputs[0].length);
		}
		var i, grad, numGrad, r;
		for (i = 0; i < inputs.length; i++) {
			r = this.check(inputs[i], targets[i]);
			if (!grad) {
				grad = r[0];
			}
			else {
				grad = grad.add(r[0]);
			}
			if (!numGrad) {
				numGrad = r[1];
			}
			else {
				numGrad = numGrad.add(r[1]);
			}
		}
		return [grad, numGrad];
	};

	this.batchLearn = function (inputs, targets) {
		if (!this.W) {
			this.randomize(inputs[0].length);
		}
		var i, ainput, output, err, grad = null, input, target, errs = [];
		for (i = 0; i < inputs.length; i++) {
			input = inputs[i];
			target = targets[i];
			ainput = this.aggregate(this.W, input);
			output = this.transfer(ainput);
			if (!grad) {
				grad = this.grad(input, ainput, output, target, this.W);
			}
			else {
				grad = grad.add(this.grad(input, ainput, output, target, this.W));
			}
			errs.push(target - output);
			this.acum += output;
		}
		var change = grad.mul(1 - this.momentum).add(this.W.mul(this.decay)).mul(this.lr).add(this.prevChange.mul(this.momentum));
		this.W = this.W.sub(change);
		this.prevChange = change.slice();
		return errs;
		/*	var i, errs = [];
		for (i = 0; i < inputs.length; i++) {
			errs.push(this.learn(inputs[i], targets[i]));
		}
		return errs;
		*/
	}
	this.propagate = function (input, ainput, output, target) {
		return this.aggregate.dx(this.W, input).mul(this.errorFunction.d(output, target) * this.transfer.d(ainput, output));
	};
}
//Transfer Functions
Neuron.transfer = {};

Neuron.transfer.identity = function (x) { return x; };
Neuron.transfer.identity.d = function (x, y) { return 1; };

Neuron.transfer.tanh = function (x) { return Math.tanh(x); };
Neuron.transfer.tanh.d = function (x, y) { return  1 - y * y; };

Neuron.transfer.logistic = function (x) { return 1 / (1 + Math.exp(-x)); };
Neuron.transfer.logistic.d = function (x, y) { return  y * (1 - y); };

Neuron.transfer.relu = function (x) { return Math.max(0, x); };
Neuron.transfer.relu.d = function (x, y) { return Number(x > 0); };

Neuron.transfer.gaussian = function (x) { return Math.exp(-(x * x)); };
Neuron.transfer.gaussian.d = function (x, y) { return -2 * x * y; };

Neuron.transfer.sine = function (x) { return Math.sin(x); };
Neuron.transfer.sine.d = function (x) { return Math.cos(x); };

Neuron.transfer.cos = function (x) { return Math.cos(x); };
Neuron.transfer.cos.d = function (x) { return -Math.sin(x); };

//Aggregation Functions
Neuron.aggregation = {};

Neuron.aggregation.dot = function (W, input) { return W.dot(input) };
Neuron.aggregation.dot.dw = function (W, input) { return input.slice(); };
Neuron.aggregation.dot.dx = function (W, input) { return W.slice(); };

Neuron.aggregation.squareDistance = function (W, input) { return W.squareDistance(input); };
Neuron.aggregation.squareDistance.dw = function (W, input) { return W.sub(input).mul(2); };
Neuron.aggregation.squareDistance.dx = function (W, input) { return input.sub(W).mul(2); };

Neuron.aggregation.distance = function (W, input) { return W.distance(input) };
Neuron.aggregation.distance.dw = function (W, input) { return W.sub(input).div(W.distance(input)); };
Neuron.aggregation.distance.dx = function (W, input) { return input.sub(W).div(W.distance(input)); };

/*
Neuron.aggregation.add = function (W, input) { return W.add(input).max() };
Neuron.aggregation.add.dw = function (W, input) { var arr = Array.zeros(input.length); arr[W.add(input).argmax()] = 1; return arr };
Neuron.aggregation.add.dx = function (W, input) { var arr = Array.zeros(input.length); arr[W.add(input).argmax()] = 1; return arr };

Neuron.aggregation.maxmin = function (W, input) { return W.max(input).min() };
Neuron.aggregation.maxmin.dw = function (W, input) { return input.slice() };
Neuron.aggregation.maxmin.dx = function (W, input) { var arr = Array.zeros(input.length); arr[W.add(input).argmax()] = 1; return arr };
*/

//Error Functions
Neuron.error = {};

Neuron.error.MSE = function (output, target) { return 0.5 * Math.pow(output - target, 2); };
Neuron.error.MSE.d = function (output, target) { return (output - target); };

Neuron.error.MAE = function (output, target) { return Math.abs(output - target); };
Neuron.error.MAE.d = function (output, target) { return Math.sign(output - target); };

Neuron.error.crossent = function (output, target) {
	var y = Math.max(0, Math.min(1, output));
	var t = Math.max(0, Math.min(1, target));
	return -(t * Math.log(Math.max(y,Number.EPSILON)) + (1 - t) * Math.log(Math.max(1 - y,Number.EPSILON)));
};
Neuron.error.crossent.d = function (output, target) {
	var y = Math.max(0, Math.min(1, output));
	var t = Math.max(0, Math.min(1, target));
	return (y - t) / Math.max(((1 - y) * y),Number.EPSILON);
};