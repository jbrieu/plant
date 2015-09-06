var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Sensor = mongoose.model('Sensor');
var Measure = mongoose.model('Measure');
var Plant = mongoose.model('Plant');

router.param('plant', function(req, res, next, id){
    var query = Plant.findById(id);
    
    query.exec(function(err, plant){
        if(err) {return next(err);}
        if(!plant){return next(new Error('can\'t find plant'));}
        
        req.plant = plant;
        return next();
    });
});

router.get('/plants', function(req, res, next){
    Plant.find(function(err, plants){
        if(err){return next(err);}
        
        res.json(plants);
    });
});

router.get('/plants/:plant', function(req, res, next){
    req.plant.populate('sensors', function(err, plant){
        if(err){return next(err);}
        
        return res.json(req.plant);
    });    
});

router.post('/plants', function(req, res, next){
   var plant = new Plant(req.body);
    
    plant.save(function(err, plant){
       if(err) {return next(err);}
        
        res.json(plant);
    });    
});


router.put('/plants/:plant', function(req, res, next){
    var objectIDs = req.body.sensors.map(function(sensorId){       
       return mongoose.Types.ObjectId(sensorId);       
   });
    
    req.plant.sensors = objectIDs;
    
    req.plant.save(function(err, plant){
        if(err){return next(err);}        
        res.json(plant);
    });
});

router.get('/sensors', function(req, res, next){
    Sensor.find(function(err, sensors){
        if(err){return next(err);}
        
        res.json(sensors);
    });
});

router.post('/sensors', function(req, res, next){
   var sensor = new Sensor(req.body);
    
    sensor.save(function(err, sensor){
       if(err) {return next(err);}
        
        res.json(sensor);
    });    
});


router.param('sensor', function(req, res, next, id){
    var query = Sensor.findById(id);
    
    query.exec(function(err, sensor){
        if(err) {return next(err);}
        if(!sensor){return next(new Error('can\'t find sensor'));}
        
        req.sensor = sensor;
        return next();
    });
});

router.param('measure', function(req, res, next, id){
    var query = Measure.findById(id);
    
    query.exec(function(err, measure){
        if(err) {return next(err);}
        if(!measure){return next(new Error('can\'t find measure'));}
        
        req.measure = measure;
        return next();
    });
});

router.get('/sensors/:sensor', function(req, res, next){
    var populateQuery = [{path:'plants', select:'name'}, {path:'measures'}];
    
    Sensor.populate(req.sensor, populateQuery, function(err, sensor){
        if(err){return next(err);}
        
        return res.json(req.sensor);
    });    
});

router.post('/sensors/:sensor/measures', function(req, res, next){
    var measure = new Measure(req.body);
    measure.sensor = req.sensor;
    
    measure.save(function(err, measure){
        if(err){return next(err);}
        
        req.sensor.measures.push(measure);
        req.sensor.save(function(err, sensor){
            if(err){return next(err);}
            res.json(measure);
        });
    });
});

router.put('/sensors/:sensor', function(req, res, next){
    var objectIDs = req.body.plants.map(function(plantId){       
       return mongoose.Types.ObjectId(plantId);       
   });
    
    req.sensor.plants = objectIDs;
    
    req.sensor.save(function(err, sensor){
        if(err){return next(err);}        
        res.json(sensor);
    });
});

router.put('/sensors/:sensor/measures/:measure', function(req, res, next){
    req.measure.comment = req.body.comment;
    
    req.measure.save(function(err, measure){
        if(err){return next(err);}        
        res.json(measure);
    });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
