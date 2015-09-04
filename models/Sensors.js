var mongoose = require('mongoose');

var SensorSchema = new mongoose.Schema({
    sensorName: {type: String, required: true},
    valueType: {type: String, required: true},    
    minValue: {type: Number, default: 0},
    maxValue: {type: Number, default: 1024},    
    description: String,
    measures : [{type: mongoose.Schema.Types.ObjectId, ref: 'Measure' }],
    plants :  [{type: mongoose.Schema.Types.ObjectId, ref: 'Plant' }]
});

mongoose.model('Sensor', SensorSchema);