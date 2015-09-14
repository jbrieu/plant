var app = angular.module('plant', ['ui.router', 'ui.bootstrap', 'chart.js', 'plant.services'])

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
            })
            .state('login', {
                url: '/login',
                templateUrl: '/login.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
  }]
            })
            .state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
  }]
            });



        ;

        $urlRouterProvider.otherwise('home');
}]);

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
    'auth',
    function ($scope, sensorsService, plantsService, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
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

            var allLabels = new Array();

            for (var sensorIndex in $scope.currentSensors) {
                var labelsForThisSensor = new Array();
                for (var measureIndex in $scope.currentSensors[sensorIndex].measures) {
                    labelsForThisSensor.push(new Date($scope.currentSensors[sensorIndex].measures[measureIndex].date).toFormattedString());
                }
                allLabels.push(labelsForThisSensor)
            }

            var merged = [].concat.apply([], allLabels);

            $scope.labels = arrayUnique(merged);

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
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};



app.controller('SensorsCtrl', [
    '$scope',
    'sensorsService',
    'sensor',
    'auth',
    function ($scope, sensorsService, sensor, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
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

app.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function ($scope, $state, auth) {
        $scope.user = {};

        $scope.register = function () {
            auth.register($scope.user).error(function (error) {
                $scope.error = error;
            }).then(function () {
                $state.go('home');
            });
        };

        $scope.logIn = function () {
            auth.logIn($scope.user).error(function (error) {
                $scope.error = error;
            }).then(function () {
                $state.go('home');
            });
        };
}]);

app.controller('NavCtrl', [
'$scope',
'auth',
function ($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
}]);