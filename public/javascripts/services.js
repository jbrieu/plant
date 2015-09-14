var servicesModule = angular.module('plant.services', []);

servicesModule.factory('auth', ['$http', '$window', function ($http, $window) {
    var auth = {};

    auth.saveToken = function (token) {
        $window.localStorage['plant-token'] = token;

    };

    auth.getToken = function () {
        return $window.localStorage['plant-token'];
    };

    auth.isLoggedIn = function () {
        var token = auth.getToken();

        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }

    };

    auth.currentUser = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };

    auth.register = function (user) {
        return $http.post('/register', user).success(function (data) {
            auth.saveToken(data.token);
        });
    };

    auth.logIn = function (user) {
        return $http.post('/login', user).success(function (data) {
            auth.saveToken(data.token);
        });
    };

    auth.logOut = function () {
        $window.localStorage.removeItem('plant-token');
    };

    return auth;
}]);

servicesModule.factory('sensorsService', ['$http', 'auth', function ($http, auth) {
    var o = {
        sensors: []
    };

    o.getAll = function () {
        return $http.get('/sensors').success(function (data) {
            angular.copy(data, o.sensors);
        });
    };

    o.create = function (sensor) {
        return $http.post('/sensors', sensor, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function (data) {
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
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                },
                'comment': comment

            })
            .success(function (data) {
                measure.comment = comment;
            });
    };

    return o;
}])

servicesModule.factory('plantsService', ['$http', 'auth', function ($http, auth) {
    var o = {
        plants: []
    };

    o.getAll = function () {
        return $http.get('/plants').success(function (data) {
            angular.copy(data, o.plants);
        });
    };

    o.create = function (plant) {
        return $http.post('/plants', plant, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function (data) {
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

            var req = {
                method: 'PUT',
                url: '/plants/' + plant._id,
                headers: {
                    'Authorization': 'Bearer ' + auth.getToken()
                },
                data: {
                    'sensors': newArrayIds
                }
            }


            $http(req).success(function (data) {
                plant.sensors = newArrayIds;
                var found = false;
                for (var i = 0; i < sensor.plants.length; i++) {
                    if (sensor.plants[i]._id == plant._id) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    var newArrayIds2 = sensor.plants.map(function (plant) {
                        return plant._id;
                    });
                    newArrayIds2.push(plant._id);
                    var req2 = {
                        method: 'PUT',
                        url: '/sensors/' + sensor._id,
                        headers: {
                            'Authorization': 'Bearer ' + auth.getToken()
                        },
                        data: {
                            'plants': newArrayIds2
                        }
                    }
                    return $http(req2).success(function (data) {
                        sensor.plants = newArrayIds2; // Should repopulate ?
                    });
                }

            });
        }
    };

    return o;
}]);