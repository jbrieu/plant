var mongoose = require('mongoose');

var MeasureSchema = new mongoose.Schema({
    value: {type: Number, required: true},
    date: {type: Date, required: true},
    sensors: {type: mongoose.Schema.Types.ObjectId, ref: 'Sensor'}
});

mongoose.model('Measure', MeasureSchema);