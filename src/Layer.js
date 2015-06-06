/*global Neuron:false */
'use strict';
function Layer(n) {
	this.neurons = [];
	this.addNeuron = function (neuron) {
		this.neurons.push(neuron);
	};
	this.removeNeuron = function (i) {
		this.neurons.splice(i, 1);
	};
	if (!!n) {
		for (var i = 0; i < n; i++) {
			this.addNeuron(new Neuron());
		}
	}
	this.forward = function (input) {
		var activations = [];
		this.neurons.forEach(function (el, i) { activations.push(el.forward(input)); });
		return activations;
	};
	this.batchForward = function (inputs) {
		var activations = [];
		this.neurons.forEach(function (el, i) { activations.push(el.batchForward(inputs)); });
		return activations;
	};
	this.cost = function (input, target, error) {
		var costs = [];
		this.neurons.forEach(function (el, i) { costs.push(el.cost(input, target, error)); });
		return costs;
	};
	this.learn = function (input, targets, errors) {
		var errs = [];
		this.neurons.forEach(function (el, i) { errs.push(el.learn(input, !!targets ? targets[i] : null, !!errors ? errors[i] : null)); });
		return errs;
	};
	this.batchLearn = function (inputs, targets, errors) {	//Each 'targets' and 'errors' row is a neuron
		if (!!inputs[0] && this.neurons[0].W.length && inputs[0].length !== this.neurons[0].W.length) {
			throw 'Incorrect number of dimensions for the input data (is ' + inputs[0].length + ', should be ' + this.neurons[0].W.length + ')';
		}
		if (!!targets && targets.length > 0 && inputs.length !== targets[0].length) {
			console.log(targets);
			throw 'Number of inputs (' + inputs.length + ') must be the same as the number of targets (' + targets[0].length + ').';
		}
		if (!!errors && inputs.length !== errors[0].length) {
			throw 'Number of inputs (' + inputs.length + ') must be the same as the number of errors (' + errors[0].length + ').';
		}
		if (!!targets && targets.length > 0 && targets.length !== this.neurons.length) {
			throw 'Must have only ' + this.neurons.length + ' targets per input (1 per neuron in the layer), has ' + targets.length + '.';
		}
		if (!!errors && errors.length > 0 &&  errors.length !== this.neurons.length) {
			throw 'Must have only ' + this.neurons.length + ' errors per input (1 per neuron in the layer), has ' + errors.length + '.';
		}
		var errs = [];
		this.neurons.forEach(function (el, i) { errs.push(el.batchLearn(inputs, !!targets ? targets[i] : null, !!errors ? errors[i] : null)); });
		return errs;
	};
	this.backward = function (input, target, grad) {
		var propagations = [];
		this.neurons.forEach(function (el, i) { propagations.push(el.backward(input, target, grad)); });
		return propagations;
	}
	this.batchBackward = function (inputs, targets, grads) {
		if (!!inputs[0] && this.neurons[0].W.length && inputs[0].length !== this.neurons[0].W.length) {
			throw 'Incorrect number of dimensions for the input data (is ' + inputs[0].length + ', should be ' + this.neurons[0].W.length + ')';
		}
		if (!!targets && targets.length > 0 && inputs.length !== targets[0].length) {
			console.log(targets);
			throw 'Number of inputs (' + inputs.length + ') must be the same as the number of targets (' + targets[0].length + ').';
		}
		if (!!grads && inputs.length !== grads[0].length) {
			throw 'Number of inputs (' + inputs.length + ') must be the same as the number of gradients (' + grads[0].length + ').';
		}
		if (!!targets && targets.length > 0 && targets.length !== this.neurons.length) {
			throw 'Must have only ' + this.neurons.length + ' targets per input (1 per neuron in the layer), has ' + targets.length + '.';
		}
		if (!!grads && grads.length > 0 &&  grads.length !== this.neurons.length) {
			throw 'Must have only ' + this.neurons.length + ' gradients per input (1 per neuron in the layer), has ' + grads.length + '.';
		}
		var propagations = [];
		//console.log(inputs);
		//console.log(targets);
		//console.log(grads);
		//this.neurons.forEach(function (el, i) { propagations.push(el.batchBackward(inputs, targets[i], grads[i])); });
		this.neurons.forEach(function (el, i) { var grad = el.batchBackward(inputs, targets[i], grads[i]); if (propagations.length === 0) { propagations = grad; } else { propagations = propagations.add(grad) } });
		//console.log(propagations);
		
		return propagations;
	}
	this.setProperty = function (prop, value) {
		this.neurons.forEach(function (el) { el[prop] = value; });
	};
	this.setLearningRate = function (lr) {
		this.setProperty('lr', lr);
	};
	this.setMomentum = function (m) {
		this.setProperty('momentum', m);
	};
}