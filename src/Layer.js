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
	this.activate = function (input) {
		var activations = [];
		this.neurons.forEach(function (el, i) { activations.push(el.activate(input)); });
		return activations;
	};
	this.batchActivate = function (inputs) {
		var activations = [];
		this.neurons.forEach(function (el, i) { activations.push(el.batchActivate(inputs)); });
		return activations;
	};
	this.learn = function (input, targets) {
		var errs = [];
		this.neurons.forEach(function (el, i) { errs.push(el.learn(input, targets[i])); });
		return errs;
	};
	this.batchLearn = function (inputs, targets) {
		var errs = [];
		this.neurons.forEach(function (el, i) { errs.push(el.batchLearn(inputs, targets[i])); });
		return errs;
	};
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