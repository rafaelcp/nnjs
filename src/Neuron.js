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
	this.W = [];
	this.prevChange = [];
	this.inputs = [];
	this.input = 0;
	this.output = 0;
	this.randomize = function (n) {
		this.prevChange = Array.zeros(n);
		this.W = Array.random(n, 1).mul(2).sub(1).div(Math.sqrt(n));
	};
	if (!!n) {
		this.randomize(n);
	}
	this.forward = function (input) {
		if (!this.W || this.W.length === 0) {
			this.randomize(input.length);
		}
		this.inputs = input.slice();
		this.input = this.aggregate(this.W, input);
		this.output = this.transfer(this.input);
		return this.output;
	};
	this.batchForward = function (inputs) {
		var activations = [];
		for (var i = 0; i < inputs.length; i++) {
			activations.push(this.forward(inputs[i]));
		}
		return activations;
	};
	this.grad = function (input, target, error) {
		return this.aggregate.dw(this.W, input).mul(this.errorFunction.d(this.output, target, error) * this.transfer.d(this.input, this.output));
	};
	this.learn = function (input, target, error) {
		if (!this.W || this.W.length === 0) {
			this.randomize(input.length);
		}
		this.forward(input);
		var err = error || (this.output - target);
		var grad = this.grad(input, target, err);
		this.acum += this.output;
		var change = grad.mul(1 - this.momentum).add(this.W.mul(this.decay)).mul(this.lr).add(this.prevChange.mul(this.momentum));
		this.W = this.W.sub(change);
		this.prevChange = change.slice();
		return Math.abs(err);
	};
	this.cost = function (input, target, error) {
		var err = error || (this.output - target);
		return this.errorFunction(this.output, target, err);
	};
	this.check = function (input, target, error) {
		if (!this.W || this.W.length === 0) {
			this.randomize(input.length);
		}
		var i;
		var W = this.W.slice();
		this.forward(input);
		var err = error || (this.output - target);
		var grad = this.grad(input, target, err);
		var numGrad = [];
		for (i = 0; i < input.length; i++) {
			var W1 = W.slice();
			var W2 = W.slice();
			W1[i] -= this.eps;
			W2[i] += this.eps;
			var err1 = this.cost(input, target, err, W1);
			var err2 = this.cost(input, target, err, W2);
			numGrad[i] = (err2 - err1) / (2 * this.eps);
			//if (Math.abs(numGrad[i] - grad[i]) > eps) return false;
		}
		//console.log('GRAD',grad);
		//console.log('NUM_GRAD',numGrad);
		return [grad, numGrad];
	};
	this.batchCheck = function (inputs, targets, errors) {
		if (!this.W || this.W.length === 0) {
			this.randomize(inputs[0].length);
		}
		var i, grad, numGrad, r, err;
		for (i = 0; i < inputs.length; i++) {
			err = errors ? errors[i] : undefined;
			r = this.check(inputs[i], targets[i], err);
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

	this.batchLearn = function (inputs, targets, errors) {	//Each row is an input, each column is a dimension
		if (!this.W || this.W.length === 0) {
			this.randomize(inputs[0].length);
		}
		if (inputs[0].length !== this.W.length) {
			throw 'Incorrect number of dimensions for the input data (is ' + inputs[0].length + ', should be ' + this.W.length + ')';
		}
		if (!!targets && inputs.length !== targets.length) {
			throw 'Number of inputs (' + inputs.length + ') must be the same as the number of targets (' + targets.length + ').';
		}
		if (!!errors && inputs.length !== errors.length) {
			throw 'Number of inputs (' + inputs.length + ') must be the same as the number of errors (' + errors.length + ').';
		}
		if (!!errors && errors[0].length) {
			throw 'Must have only 1 error per input, has ' + errors[0].length + '.';
		}
		var i, ainput, output, grad = null, input, target, error, errs = [];
		for (i = 0; i < inputs.length; i++) {
			input = inputs[i];
			target = !!targets ? targets[i] : null;
			this.forward(input);
			error = !!errors ? errors[i] : (this.output - target);
			if (!grad) {
				grad = this.grad(input, target, error);
			}
			else {
				grad = grad.add(this.grad(input, target, error));
			}
			errs.push(target - this.output);
			this.acum += this.output;
		}
		var change = grad.mul(1 - this.momentum).add(this.W.mul(this.decay)).mul(this.lr).add(this.prevChange.mul(this.momentum));
		this.W = this.W.sub(change);
		this.prevChange = change.slice();
		return errs;
	};
	this.backward = function (input, target, grad) {
		var result = this.aggregate.dx(this.W, input).mul(grad * this.transfer.d(this.input, this.output));
		//console.log(result);
		return result;
	};
	this.batchBackward = function (inputs, targets, grads) {
		if (inputs[0].length !== this.W.length) {
			throw 'Incorrect number of dimensions for the input data (is ' + inputs[0].length + ', should be ' + this.W.length + ')';
		}
		if (!!targets && targets.length > 0 && inputs.length !== targets.length) {
			throw 'Number of inputs (' + inputs.length + ') must be the same as the number of targets (' + targets.length + ').';
		}
		if (!!grads && grads.length > 0 && inputs.length !== grads.length) {
			throw 'Number of inputs (' + inputs.length + ') must be the same as the number of gradients (' + grads.length + ').';
		}
		if (!!grads && grads[0].length) {
			throw 'Must have only 1 gradient per input, has ' + grads[0].length + '.';
		}
		var i, signals = [];
		for (i = 0; i < inputs.length; i++) {
			signals.push(this.backward(inputs[i], !!targets ? targets[i] : null, !!grads ? grads[i] : null));
		}
		//console.log(signals);
		return signals;
	}
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
Neuron.transfer.relu.d = function (x, y) { return Number(x >= 0); };

Neuron.transfer.gaussian = function (x) { return Math.exp(-(x * x)); };
Neuron.transfer.gaussian.d = function (x, y) { return -2 * x * y; };

Neuron.transfer.sine = function (x) { return Math.sin(x); };
Neuron.transfer.sine.d = function (x) { return Math.cos(x); };

Neuron.transfer.cos = function (x) { return Math.cos(x); };
Neuron.transfer.cos.d = function (x) { return -Math.sin(x); };

//Aggregation Functions
Neuron.aggregation = {};

Neuron.aggregation.dot = function (W, input) { return W.dot(input); };
Neuron.aggregation.dot.dw = function (W, input) { return input.slice(); };
Neuron.aggregation.dot.dx = function (W, input) { return W.slice(); };

/*
Neuron.aggregation.squareDistance = function (W, input) { return W.squareDistance(input); };
Neuron.aggregation.squareDistance.dw = function (W, input) { return W.sub(input).mul(2); };
Neuron.aggregation.squareDistance.dx = function (W, input) { return input.sub(W).mul(2); };
*/

Neuron.aggregation.distance = function (W, input) { return W.distance(input); };
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

Neuron.error.none = function (output, target, error) {
	return -error;
}
Neuron.error.none.d = function (output, target, error) {
	return -error;
}
Neuron.error.MSE = function (output, target, error) {
	if (error === undefined) {
		error = output - target;
	}
	return 0.5 * Math.pow(error, 2);
};
Neuron.error.MSE.d = function (output, target, error) {
	if (error === undefined) {
		error = output - target;
	}
	return error; 
};
Neuron.error.MAE = function (output, target, error) {
	if (error === undefined) {
		error = output - target;
	}
	return Math.abs(error);
};
Neuron.error.MAE.d = function (output, target, error) {
	if (error === undefined) {
		error = output - target;
	}
	return Math.sign(error);
};

Neuron.error.crossent = function (output, target, error) {
	var y = Math.max(0, Math.min(1, output));
	var t = Math.max(0, Math.min(1, target));
	return -(t * Math.log(Math.max(y, Number.EPSILON)) + (1 - t) * Math.log(Math.max(1 - y, Number.EPSILON)));
};
Neuron.error.crossent.d = function (output, target, error) {
	var y = Math.max(0, Math.min(1, output));
	var t = Math.max(0, Math.min(1, target));
	return (y - t) / Math.max(((1 - y) * y), Number.EPSILON);
};