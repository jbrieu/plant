var mongoose = require('mongoose');

var PlantSchema = new mongoose.Schema({
    name: {type: String, required: true},    
    description: String,
    sensors: [{type: mongoose.Schema.Types.ObjectId, ref: 'Sensor'}],
    addedBy: String
});

mongoose.model('Plant', PlantSchema);