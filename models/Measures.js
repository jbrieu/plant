var mongoose = require('mongoose');

var MeasureSchema = new mongoose.Schema({
    type: String,
    value: Number,
    source: String,
    date: Date
});

mongoose.model('Measure', MeasureSchema);