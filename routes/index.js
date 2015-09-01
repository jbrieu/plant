var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Measure = mongoose.model('Measure');

router.get('/measures', function(req, res, next){
    Measure.find(function(err, measures){
        if(err){return next(err);}
        
        res.json(measures);
    });
});

router.post('/measures', function(req, res, next){
   var measure = new Measure(req.body); // TODO => que faut-il récupérer ?
    
    measure.save(function(err, measure){
       if(err) {return next(err);}
        
        res.json(measure);
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

router.get('/measures/:measure', function(req, res, next){
    res.json(req.measure);    
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
