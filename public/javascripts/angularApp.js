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
                    postPromise: ['measures', function (measures) {
                        return measures.getAll();
          }]
                }
            })
        $urlRouterProvider.otherwise('home');
}]);

app.factory('measures', ['$http', function ($http) {
    var o = {
        measures: []
    };

    o.getAll = function () {
        return $http.get('/measures').success(function (data) {
            angular.copy(data, o.measures);
        });
    };

    o.create = function (measure) {
        return $http.post('/measures', measure).success(function (data) {
            o.measures.push(data);
        });
    };

    o.get = function (id) {
        return $http.get('/measures/' + id).then(function (res) {
            return res.data;
        });
    };

    return o;
}])

String.prototype.padLeft = function (length, character) { 
    return new Array(length - this.length + 1).join(character || ' ') + this; 
};

Date.prototype.toFormattedString = function () {
    return [String(this.getMonth()+1).padLeft(2, '0'),
            String(this.getDate()).padLeft(2, '0'),
            String(this.getFullYear()).substr(2, 2)].join("/") + " " +
           [String(this.getHours()).padLeft(2, '0'),
            String(this.getMinutes()).padLeft(2, '0')].join(":");
};

app.controller('MainCtrl', [
    '$scope',
    'measures',
    function ($scope, measures) {
        $scope.measures = measures.measures;

        $scope.labels = measures.measures.map(function(measure){
                                                        return new Date(measure.date).toFormattedString();
                                                        });
        $scope.series = ['Series A'];
        $scope.data = [measures.measures.map(function(measure){return measure.value})];
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
    }
]);

