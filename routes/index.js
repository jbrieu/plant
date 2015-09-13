var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');

var auth = jwt({secret: process.env.PLANT_SECRET_KEY, userProperty: 'payload'});

var Sensor = mongoose.model('Sensor');
var Measure = mongoose.model('Measure');
var Plant = mongoose.model('Plant');
var User = mongoose.model('User');


router.param('plant', function (req, res, next, id) {
    var query = Plant.findById(id);

    query.exec(function (err, plant) {
        if (err) {
            return next(err);
        }
        if (!plant) {
            return next(new Error('can\'t find plant'));
        }

        req.plant = plant;
        return next();
    });
});

router.get('/plants', function (req, res, next) {
    Plant.find(function (err, plants) {
        if (err) {
            return next(err);
        }

        res.json(plants);
    });
});

router.get('/plants/:plant', function (req, res, next) {
    req.plant.populate('sensors', function (err, plant) {
        if (err) {
            return next(err);
        }

        return res.json(req.plant);
    });
});

router.post('/plants', auth, function (req, res, next) {
    var plant = new Plant(req.body);
    plant.addedBy = req.payload.username;

    plant.save(function (err, plant) {
        if (err) {
            return next(err);
        }

        res.json(plant);
    });
});


router.put('/plants/:plant', auth, function (req, res, next) {
    var objectIDs = req.body.sensors.map(function (sensorId) {
        return mongoose.Types.ObjectId(sensorId);
    });

    req.plant.sensors = objectIDs;

    req.plant.save(function (err, plant) {
        if (err) {
            return next(err);
        }
        res.json(plant);
    });
});

router.get('/sensors', function (req, res, next) {
    Sensor.find(function (err, sensors) {
        if (err) {
            return next(err);
        }
        
        var opts = [{path: 'plants', select: 'name'}, {path:'measures'}];
        Sensor.populate(sensors, opts, function (err, user) {
            res.json(sensors);
        });

    });
});

router.post('/sensors', auth, function (req, res, next) {
    var sensor = new Sensor(req.body);
    sensor.addedBy = req.payload.username;

    sensor.save(function (err, sensor) {
        if (err) {
            return next(err);
        }
        res.json(sensor);

    });
});


router.param('sensor', function (req, res, next, id) {
    var query = Sensor.findById(id);

    query.exec(function (err, sensor) {
        if (err) {
            return next(err);
        }
        if (!sensor) {
            return next(new Error('can\'t find sensor'));
        }

        req.sensor = sensor;
        return next();
    });
});

router.param('measure', function (req, res, next, id) {
    var query = Measure.findById(id);

    query.exec(function (err, measure) {
        if (err) {
            return next(err);
        }
        if (!measure) {
            return next(new Error('can\'t find measure'));
        }

        req.measure = measure;
        return next();
    });
});

router.get('/sensors/:sensor', function (req, res, next) {
    var populateQuery = [{
        path: 'plants',
        select: 'name'
    }, {
        path: 'measures'
    }];

    Sensor.populate(req.sensor, populateQuery, function (err, sensor) {
        if (err) {
            return next(err);
        }

        return res.json(req.sensor);
    });
});

router.post('/sensors/:sensor/measures', auth, function (req, res, next) {
    var measure = new Measure(req.body);
    measure.sensor = req.sensor;
    measure.addedBy = req.payload.username;

    measure.save(function (err, measure) {
        if (err) {
            return next(err);
        }

        req.sensor.measures.push(measure);
        req.sensor.save(function (err, sensor) {
            if (err) {
                return next(err);
            }
            res.json(measure);
        });
    });
});

router.put('/sensors/:sensor', auth, function (req, res, next) {
    var objectIDs = req.body.plants.map(function(plantId) {
        return mongoose.Types.ObjectId(plantId);
    });

    req.sensor.plants = objectIDs;

    req.sensor.save(function (err, sensor) {
        if (err) {
            return next(err);
        }
        res.json(sensor);
    });
});

router.put('/sensors/:sensor/measures/:measure', auth, function (req, res, next) {
    req.measure.comment = req.body.comment;

    req.measure.save(function (err, measure) {
        if (err) {
            return next(err);
        }
        res.json(measure);
    });
});

router.post('/register', function(req, res, next){
   if(!req.body.username || ! req.body.password){
       return res.status(400).json({message: 'Please fill out all fields'});
       
   }
   
    var user = new User();
    user.username = req.body.username;
    
    user.setPassword(req.body.password);
    
    user.save(function(err){
       if(err){return next(err);}
        return res.json({token: user.generateJWT()});
    });
    
});

router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message : 'Please fill out all fields'});
    }
    
    passport.authenticate('local', function(err, user, info){
       if(err){return next(err);}
        if(user){
            return res.json({token: user.generateJWT()});
        }else{
            return res.status(401).json(info);
        }
    })(req, res, next);
    
});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

module.exports = router;