var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Sensor = mongoose.model('Sensor');
var Measure = mongoose.model('Measure');

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
    req.sensor.populate('measures', function(err, sensor){
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
