var mongoose = require('mongoose');

var SensorSchema = new mongoose.Schema({
    plantName: {type: String, required: true},
    sensorName: {type: String, required: true},
    valueType: {type: String, required: true},    
    minValue: {type: Number, default: 0},
    maxValue: {type: Number, default: 1024},    
    description: String,
    measures : [{type: mongoose.Schema.Types.ObjectId, ref: 'Measure' }]
});

mongoose.model('Sensor', SensorSchema);