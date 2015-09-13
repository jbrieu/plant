var mongoose = require('mongoose');

var MeasureSchema = new mongoose.Schema({
    value: {type: Number, required: true},
    date: {type: Date, required: true},
    comment: String,
    sensor: {type: mongoose.Schema.Types.ObjectId, ref: 'Sensor'},
    addedBy: String 
});

mongoose.model('Measure', MeasureSchema);