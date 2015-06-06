/*global Layer:false */
'use strict';
function NeuralNetwork() {
	this.layers = [];
	var i, layer;
	for (i = 1; i < arguments.length; i++) {
		layer = new Layer(arguments[i - 1]);
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
		var inp = input.slice();
		for (var i = 0; i < this.layers.length; i++) {
			inp = this.layers[i].batchForward(inp);
		}
		return inp;
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
	};
	this.setProperty = function (prop, value) {
		for (var i = 0; i < this.layers.length; i++) {
			this.layers[i].setProperty(prop,value);
		}
	};
	this.setLearningRate = function (lr) {
		this.setProperty('lr', lr);
	};
	this.setMomentum = function (m) {
		this.setProperty('momentum', m);		
	};	
}