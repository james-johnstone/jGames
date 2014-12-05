function Neuron(numberOfInputs){
  this.weights = [];
  this.bias = (Math.random()*2)-1;

  for (var i = 0; i < numberOfInputs; i++) {
    this.weights.push((Math.random()*2)-1);
  }
}

Neuron.prototype.getOutput = function(inputVector){
  return this.applyActivationFunction(inputVector) ;
}

Neuron.prototype.applyActivationFunction = function(inputVector){
  var input = 0;

  for (var i = 0; i < inputVector.length; i++) {
    input+= inputVector[i] * this.weights[i];
  }
  return sigmoid(input + this.bias);
}

Neuron.prototype.adjustWeights = function(inputs, activation, errorSignal, learningRate){
  for (var i = 0; i < inputs.length; i++) {
    for (var j = 0; j < this.weights.length; j++) {
       this.weights[j] += ((errorSignal * activation * (1- activation)) * learningRate) * inputs[i];
    }
  }

  this.bias += (errorSignal * activation * (1- activation)) * learningRate;
}

function sigmoid(t) {
    return (1/(1 + Math.exp(-t)));
}

function mse(errors) {
  // mean squared error
  var sum = 0;
  for (var i = 0; i < errors.length; i++) {
    sum += Math.pow(errors[i], 2);
  }
  return sum / errors.length;
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
  this.activationOutputs = [];
  //var outputs = [];

  this.activationOutputs.push(new Array());
  //outputs.push(new Array());

  for (var i = 0; i < inputs.length; i++) {
    //this.activationOutputs[0].push(this.inputLayer[i].getOutput(inputs));
    //outputs[0].push(this.inputLayer[i].getOutput(inputs));
  }

  this.activationOutputs[0] = inputs;

  for (var i = 0; i < this.hiddenLayers.length; i++) {
    this.activationOutputs.push(new Array());
    //outputs.push(new Array());

    for (var j = 0; j < this.hiddenLayers[i].length; j++) {
        this.activationOutputs[i+1].push(this.hiddenLayers[i][j].getOutput(this.activationOutputs[i]));
        //outputs[i+1].push(this.hiddenLayers[i][j].getOutput(outputs[i]))
    }
  }

  finalOutput = [];

  for (var i=0; i < this.outputs.length ; i++){
    finalOutput.push(this.outputs[i].getOutput(this.activationOutputs[this.activationOutputs.length-1]));
  }

  //console.log(finalOutput);
  this.activationOutputs.push(finalOutput);

  return finalOutput;
}

NeuralNetwork.prototype.serialize = function(){
  var layers = new Array().concat(this.inputLayer);
  var neurons = [];

  for (var i = 0; i < this.hiddenLayers.length; i++) {
    layers = layers.concat(this.hiddenLayers[i]);
  }

  layers = layers.concat(this.outputs);

  for (var i = 0; i < layers.length; i++) {
      var neuron = layers[i];
      neurons.push(neuron.weights.concat(neuron.bias))
  }

  return neurons;
}

NeuralNetwork.prototype.train = function(data){
  if (!data)
    throw new Error("train function must provide training data paramater");

  if (!data.hasOwnProperty("length"))
    throw new Error("train function must provide an array of training data");

  var errorThreshold = 0.005;
  var iterations = 20000;
  var learningRate = 0.3;

  var error =1;

  for (var i = 0; i <iterations && error > errorThreshold; i++) {
    var sum = 0;
    for (var j = 0; j < data.length; j++) {
        var input = data[j].input;
        var output = data[j].output;
        var err = this.trainPattern(input, output, learningRate);
        sum+= err;
    }
    error = sum / data.length;
  }

  console.log('done');
}

NeuralNetwork.prototype.trainPattern = function(input, target, learningRate){
  var networkOutput = this.run(input);
  var errors = [];
  var netError = 0;

  for (var i = 0; i < target.length; i++) {
     var delta  = target[i] - networkOutput[i];
     netError+= (delta * delta)/2;
     errors.push(delta);
  }

  this.adjustWeights(errors, learningRate);

  return mse(errors);;
}

NeuralNetwork.prototype.adjustWeights = function(errors, learningRate){

  for (var i=0; i < this.outputs.length ; i++){
    var outputError = errors[i];
    var inputLayer = this.activationOutputs[this.activationOutputs.length-(2)]

    this.outputs[i].adjustWeights(inputLayer,this.activationOutputs[this.activationOutputs.length-1][i], outputError, learningRate)

    for (var j = 0; j < this.hiddenLayers.length; j++) {

      var outputLayer = this.activationOutputs[this.activationOutputs.length-(2+j)]
      var inputLayer =  this.activationOutputs[this.activationOutputs.length-(3+j)]
      for (var k = 0; k < this.hiddenLayers[j].length; k++) {
          this.hiddenLayers[j][k].adjustWeights(inputLayer, outputLayer[k], outputError, learningRate);
      }
    }

//    for (var j = 0; j < this.inputLayer.length; j++) {
//        var output = this.activationOutputs[0];
//        this.inputLayer[j].adjustWeights(output[j], outputError, learningRate);
//    }
  }
}
