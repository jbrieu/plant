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

        $scope.currentPlant = plantsService.plants[0];
    }
]);

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