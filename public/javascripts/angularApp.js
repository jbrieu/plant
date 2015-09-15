var app = angular.module('plant', ['ui.router', 'ui.bootstrap', 'chart.js', 'plant.services', 'plant.controllers'])

app.config([
'$stateProvider',
'$urlRouterProvider',
function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'partials/home.html',
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
                templateUrl: 'partials/sensors.html',
                controller: 'SensorsCtrl',
                resolve: {
                    sensor: ['$stateParams', 'sensorsService', function ($stateParams, sensorsService) {
                        return sensorsService.get($stateParams.id);
          }]
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: 'partials/login.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
  }]
            })
            .state('register', {
                url: '/register',
                templateUrl: 'partials/register.html',
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