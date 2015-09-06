var app = angular.module('plant', ['ui.router', 'ui.bootstrap', 'chart.js'])

app.config([
'$stateProvider',
'$urlRouterProvider',
function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: {
                    sensorsPromise: ['sensorsService', function (sensorsService) {
                        return sensorsService.getAll();
          }],
                    plantsPromise: ['plantsService', function (plantsService) {
                        return plantsService.getAll();
          }]
                }
            })
            .state('sensors', {
                url: '/sensors/{id}',
                templateUrl: '/sensors.html',
                controller: 'SensorsCtrl',
                resolve: {
                    sensor: ['$stateParams', 'sensorsService', function ($stateParams, sensorsService) {
                        return sensorsService.get($stateParams.id);
          }]
                }
            });

        $urlRouterProvider.otherwise('home');
}]);

app.factory('sensorsService', ['$http', function ($http) {
    var o = {
        sensors: []
    };

    o.getAll = function () {
        return $http.get('/sensors').success(function (data) {
            angular.copy(data, o.sensors);
        });
    };

    o.create = function (sensor) {
        return $http.post('/sensors', sensor).success(function (data) {
            o.sensors.push(data);
        });
    };

    o.get = function (id) {
        return $http.get('/sensors/' + id).then(function (res) {
            return res.data;
        });
    };

    o.commentMeasure = function (sensor, measure, comment) {
        return $http.put('/sensors/' + sensor._id + '/measures/' + measure._id, {
                'comment': comment
            })
            .success(function (data) {
                measure.comment = comment;
            });
    };

    return o;
}])

app.factory('plantsService', ['$http', function ($http) {
    var o = {
        plants: []
    };

    o.getAll = function () {
        return $http.get('/plants').success(function (data) {
            angular.copy(data, o.plants);
        });
    };

    o.create = function (plant) {
        return $http.post('/plants', plant).success(function (data) {
            o.plants.push(data);
        });
    };

    o.linkWithSensor = function (plant, sensor)  {
        // Look for Ids and not Objects because get does not populate sensors in plant
        console.log("plant to link :" + plant + " with sensor " + sensor);
        if (plant.sensors.indexOf(sensor._id) === -1) {
            var newArrayIds = plant.sensors;
            newArrayIds.push(sensor._id);

            console.log("sensor not already linked with plant, continue");

            $http.put('/plants/' + plant._id, {
                    'sensors': newArrayIds
                })
                .success(function (data) {
                    plant.sensors = newArrayIds;
                    var found = false;
                    for (var i = 0; i < sensor.plants.length; i++) {
                        if (sensor.plants[i]._id == plant._id) {
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        var newArrayIds2 = sensor.plants;
                        newArrayIds2.push(plant._id);
                        return $http.put('/sensors/' + sensor._id, {
                                'plants': newArrayIds2
                            })
                            .success(function (data) {
                                sensor.plants = newArrayIds2;
                            });
                    }

                });
        }
    };

    return o;
}])

String.prototype.padLeft = function (length, character) {
    return new Array(length - this.length + 1).join(character || ' ') + this;
};

Date.prototype.toFormattedString = function () {
    return [String(this.getMonth() + 1).padLeft(2, '0'),
            String(this.getDate()).padLeft(2, '0'),
            String(this.getFullYear()).substr(2, 2)].join("/") + " " + [String(this.getHours()).padLeft(2, '0'),
            String(this.getMinutes()).padLeft(2, '0')].join(":");
};

app.controller('MainCtrl', [
    '$scope',
    'sensorsService',
    'plantsService',
    function ($scope, sensorsService, plantsService) {
        $scope.sensors = sensorsService.sensors;
        $scope.plants = plantsService.plants;

        $scope.addSensor = function () {
            if (!$scope.sensorName || $scope.sensorName === '' || !$scope.valueType || $scope.valueType === '') {
                return;
            }

            sensorsService.create({
                sensorName: $scope.sensorName,
                valueType: $scope.valueType,
                minValue: $scope.minValue,
                maxValue: $scope.maxValue,
                description: $scope.description
            });

            $scope.sensorName = '';
            $scope.valueType = '';
            $scope.minValue = 0;
            $scope.maxValue = 1023;
            $scope.description = '';
        };

        $scope.addPlant = function () {
            if (!$scope.plantCreateName || $scope.plantCreateName === '') {
                return;
            }

            plantsService.create({
                name: $scope.plantCreateName,
                description: $scope.plantCreateDescription
            });

            $scope.plantCreateName = '';
            $scope.plantCreateDescription = '';
        };

        $scope.linkWithSensor = function () {
            if (!$scope.plantToLink || !$scope.sensorToLink) {
                console.log("null ? plant = " + $scope.plantToLink + " sensor = " + $scope.sensorToLink);
                return;
            }

            plantsService.linkWithSensor($scope.plantToLink, $scope.sensorToLink);
        };


        $scope.currentPlant = plantsService.plants[0];
        $scope.currentSensors = $scope.sensors;

        $scope.$watch("currentPlant", function (newValue, oldValue) {
            if ($scope.currentPlant) {
                $scope.currentSensors = $scope.sensors.filter(function (sensor) {
                    return $scope.currentPlant.sensors.indexOf(sensor._id) !== -1;
                });
            } else {
                $scope.currentSensors = $scope.sensors;
            }
            $scope.series = $scope.currentSensors.map(function (sensor) {
                return sensor.sensorName;
            });

            var allLabels = $scope.currentSensors.map(function (sensor) {
                return sensor.measures.map(function (measure) {
                    //return new Date(measure.date).toFormattedString();
                    return "date";
                })
            });
            
            $scope.labels = arrayUnique(allLabels);

            $scope.data = $scope.currentSensors.map(function (sensor) {
                return sensor.measures.map(function (measure) {
                    return measure.value;
                })
            });

        });

        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
    }
]);

function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

app.controller('SensorsCtrl', [
    '$scope',
    'sensorsService',
    'sensor',
    function ($scope, sensorsService, sensor) {
        $scope.sensor = sensor;

        $scope.setCommentOnMeasure = function (measure, comment) {
            sensorsService.commentMeasure(sensor, measure, comment);
        };

        $scope.labels = sensor.measures.map(function (measure) {
            return new Date(measure.date).toFormattedString();
        });
        $scope.series = [sensor.sensorName];
        $scope.data = [sensor.measures.map(function (measure) {
            return measure.value
        })];
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
    }
]);