/*global Layer:false, Neuron:false */
'use strict';
function NeuralNetwork() {
	this.layers = [];
	var i, layer;
	for (i = 1; i < arguments.length; i++) {
		layer = new Layer(arguments[i]);
		if (i < arguments.length - 1) {
			layer.setProperty('errorFunction', Neuron.error.none);
		}
		this.layers.push(layer);
	}
	this.forward = function (input) {
		var inp = input.slice();
		for (var i = 0; i < this.layers.length; i++) {
			inp = this.layers[i].forward(inp);
		}
		return inp;
	};
	this.batchForward = function (inputs) {
		var inp = inputs.slice();
		var inps = [inputs];
		for (var i = 0; i < this.layers.length; i++) {
			inp = this.layers[i].batchForward(inp);
			inp = inp.transpose();
			if (i < this.layers.length - 1) {
				inp = inp.addColumn(this.layers[i].neurons.length, 1);
			}
			inps.push(inp);
		}
		//console.log('inps',inps);
		return inps;
	};
	this.learn = function (input, target, error) {
		var out = this.forward(input);
		var err = out.sub(target);
		var grad = this.layers[this.layers.length - 1].errorFunction.d(out, target, error);
		var i, propagation;
		for (i = this.layers.length - 1; i >= 0; i--) {
			this.layers[i].learn();
			grad = this.layers[i].backward(input, target, grad);
		}
		return grad;
	};
	this.batchLearn = function (inputs, targets) {
		var inps = this.batchForward(inputs);
		//console.log(inps);
		var grad, error;
		var errs = [];
		error = this.layers[this.layers.length - 1].batchLearn(inps[this.layers.length - 1], targets);
		errs = error;
		grad = this.layers[this.layers.length - 1].batchBackward(inps[this.layers.length - 1], targets, error);
		if (this.layers.length > 1) {
			grad = grad.removeColumn(this.layers[this.layers.length - 2].neurons.length);
		}
		grad = grad.transpose();
		//console.log('grad',grad);
		for (var i = this.layers.length - 2; i >= 0; i--) {
			//console.log(i,grad);
			error = this.layers[i].batchLearn(inps[i], [], grad);
			grad = this.layers[i].batchBackward(inps[i], [], error);
			if (i > 0) {
				grad = grad.removeColumn(this.layers[i - 1].neurons.length);
			}
			grad = grad.transpose();
		}
		//errs[i] = errs[i][0].norm() / 2;
		//errs1[i] = Math.round(errs[i] * 1000) / 1000;
		return errs;
	};
	this.setProperty = function (prop, value) {
		for (var i = 0; i < this.layers.length; i++) {
			this.layers[i].setProperty(prop, value);
		}
	};
	this.setLearningRate = function (lr) {
		this.setProperty('lr', lr);
	};
	this.setMomentum = function (m) {
		this.setProperty('momentum', m);
	};
}