function Neuron(numberOfInputs){
  this.weights = [];
  this.bias = Math.random() * -0.5;

  for (var i = 0; i < numberOfInputs; i++) {
    this.weights.push(Math.random() * 0.4 - 0.2);
  }
}

Neuron.prototype.getOutput = function(inputVector){
  return this.applyActivationFunction(inputVector) + this.bias > 0 ? 1 : 0;
}

Neuron.prototype.applyActivationFunction = function(inputVector){
  var input = 0;

  for (var i = 0; i < inputVector.length; i++) {
    input+= inputVector[i] * this.weights[i];
  }
  return sigmoid(input)
}

function sigmoid(t) {
    return (2/(1 + Math.exp(-t)))-1;
}

// options expects an object with the properties:
// inputs => an integer declaring the number of expected inputs to the net
// hiddenLayers => an array declaring how many neurons should make up each hidden layer
// outputs => an integer declaring how many outputs the net should have
function NeuralNetwork(options){
   this.inputLayer = [];
   this.hiddenLayers = [];
   this.outputs = [];

   for (var i = 0; i < options.inputs; i++) {
      this.inputLayer.push(new Neuron(options.inputs));
   }

   for (var i = 0; i < options.hiddenLayers.length; i++){
      this.hiddenLayers.push(new Array());
      var numberOfInputs = i == 0 ? options.inputs : options.hiddenLayers[i-1];

      for (var j = 0; j < options.hiddenLayers[i]; j++) {
         this.hiddenLayers[i].push(new Neuron(numberOfInputs));
      }
  }

  var lastLayer = this.hiddenLayers[this.hiddenLayers.length -1].length;

  for (var i = 0; i < options.outputs; i++) {
      this.outputs.push(new Neuron(lastLayer));
  }
};

// expects an array, representing the input vector
NeuralNetwork.prototype.run = function(inputs){
  var activationOutputs = [];

  activationOutputs.push(new Array());

  for (var i = 0; i < inputs.length; i++) {
    activationOutputs[0].push(this.inputLayer[i].getOutput(inputs));
  }

  for (var i = 0; i < this.hiddenLayers.length; i++) {
    activationOutputs.push(new Array());

    for (var j = 0; j < this.hiddenLayers[i].length; j++) {
        activationOutputs[i+1].push(this.hiddenLayers[i][j].getOutput(activationOutputs[i]))
    }
  }

  var finalOutput = [];

  for (var i=0; i < this.outputs.length ; i++){
    finalOutput.push(this.outputs[i].applyActivationFunction(activationOutputs[activationOutputs.length-1]));
  }

  console.log(finalOutput);
}
