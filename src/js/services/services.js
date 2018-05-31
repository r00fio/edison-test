/**
 * Created by r00fi0 on 1/11/17.
 */
    angular.module('app')

        .factory('accelerometerService', ['$window', '$rootScope', function ($window, $rootScope) {
            var acceleration = {};
            var accelerometer = {};
            accelerometer.stop = {};
            accelerometer.sensivity = {};
            accelerometer.sensivity.x = 20000;
            accelerometer.sensivity.y = 20000;
            accelerometer.sensivity.z = 20000;

            var startWatch = function () {

                if (window.screen.lockOrientation) {
                    window.screen.lockOrientation('portrait');
                }


                function sendData() {
                    var data = {
                        ax: acceleration.x,
                        ay: acceleration.y,
                        az: acceleration.z,
                        aT: acceleration.timestamp,
                        side: 'left'
                    };

                    $.ajax({
                        type: 'POST',
                        url: $rootScope.host.url + '/orientation/accelerometer',
                        data: data,
                        success: function (data) {
                        },
                        dataType: 'json',
                        async: false
                    });

                }

                function onError() {
                    alert('onError!');
                }

                var options = {frequency: 20};  // Update every 3 seconds

                navigator.accelerometer.watchAcceleration(detectShake, onError, options);


//для более стабильной работы - использовать два смартфона и считывать наклон с ноги которая не в движении
                function detectShake(acceleration) {
                    acceleration.x = Math.round(acceleration.x * 10000);
                    acceleration.y = Math.round(acceleration.y * 10000);
                    acceleration.z = Math.round(acceleration.z * 10000);
                    acceleration.timestamp = acceleration.timestamp;

                    $rootScope.$applyAsync();

                    if (acceleration.x > accelerometer.stop.x + accelerometer.sensivity.x ||
                        acceleration.x < accelerometer.stop.x - accelerometer.sensivity.x ||
                        acceleration.y > accelerometer.stop.y + accelerometer.sensivity.y ||
                        acceleration.y < accelerometer.stop.y - accelerometer.sensivity.y ||
                        acceleration.z > accelerometer.stop.z + accelerometer.sensivity.z ||
                        acceleration.z < accelerometer.stop.z - accelerometer.sensivity.z
                    ) {
                        sendData();
                    }


                }
            }

            return {
                startWatch: startWatch
            };

        }])
