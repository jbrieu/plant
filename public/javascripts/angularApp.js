var app = angular.module('plant', ['ui.router', 'ui.bootstrap', 'chart.js'])

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
          postPromise: ['measures', function(measures){
              return measures.getAll();
          }]
      }
    })
    $urlRouterProvider.otherwise('home');
}]);

app.factory('measures', ['$http', function($http){
    var o = {
        measures: []
    };
    
    o.getAll = function(){
      return $http.get('/measures').success(function(data){
        angular.copy(data, o.measures); 
      });
    };
    
    o.create = function(measure){
        return $http.post('/measures', measure).success(function(data){
            o.measures.push(data);
        });
    };
            
    o.get = function(id){
      return $http.get('/measures/'+id).then(function(res){
        return res.data;
        });        
    };
    
    return o;
}])

app.controller('MainCtrl', [
    '$scope',
    'measures',
    function($scope, measures){    
        $scope.measures = measures.measures;                
    }
]);
