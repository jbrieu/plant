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
                    postPromise: ['sensors', function (sensors) {
                        return sensors.getAll();
          }]
                }
            })
            .state('sensors', {
                url: '/sensors/{id}',
                templateUrl: '/sensors.html',
                controller: 'SensorsCtrl',
                resolve: {
                    sensor: ['$stateParams', 'sensors', function ($stateParams, sensors) {
                        return sensors.get($stateParams.id);
          }]
                }
            });

        $urlRouterProvider.otherwise('home');
}]);

app.factory('sensors', ['$http', function ($http) {
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
        return $http.put('/sensors/' + sensor._id + '/measures/' + measure._id, {'comment' : comment})
            .success(function (data) {
                measure.comment = comment;
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
    'sensors',
    function ($scope, sensors) {
        $scope.sensors = sensors.sensors;

        $scope.addSensor = function () {
            if (!$scope.plantName || $scope.plantName === '' || !$scope.sensorName || $scope.sensorName === '' || !$scope.valueType || $scope.valueType === '') {
                return;
            }
            sensors.create({
                plantName: $scope.plantName,
                sensorName: $scope.sensorName,
                valueType: $scope.valueType,
                minValue: $scope.minValue,
                maxValue: $scope.maxValue,
                description: $scope.description
            });

            $scope.plantName = '';
            $scope.sensorName = '';
            $scope.valueType = '';
            $scope.minValue = 0;
            $scope.maxValue = 1024;
            $scope.description = '';
        };
    }
]);

app.controller('SensorsCtrl', [
    '$scope',
    'sensors',
    'sensor',
    function ($scope, sensors, sensor) {
        $scope.sensor = sensor;

        $scope.setCommentOnMeasure = function(measure, comment){
          sensors.commentMeasure(sensor, measure, comment);  
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