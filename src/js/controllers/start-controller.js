var application = angular.module('app');
var crimeServiceURL = 'https://data.police.uk/api/crimes-at-location?date=*&lat=#&lng=@';
var coords = [52.629729, -1.131592];
var myMap;
var gross = Observable.just(5000)




var buildHint = function (el) {
    var hint = el.outcome_status != null && el.outcome_status != 'undefined' ?
    'status: ' + el.outcome_status.category + ", \n date:" + el.outcome_status.date : ''
    hint += el.location.street != null && el.location.street != 'undefined' ? ", \n street name: " + el.location.street.name : ''
    return hint;
};

var searchCrime = function (coordinates) {
    //todo: remove old placemarks
    var date = $("#datepicker").datepicker("getDate");
    date = date != null ? date.toISOString().substring(0, 7) : null;
    var reqURL = crimeServiceURL.replace('*', date).replace('#', coordinates[0]).replace('@', coordinates[1]);
    var success = function (data) {
        data.forEach(function (el, pos) {
            var selectedCategory = $('#categorySelect :selected').text();
            if (el.category.toLowerCase() == selectedCategory.toLowerCase()) {
                myMap.geoObjects.add(new ymaps.GeoObject({
                    // Описание геометрии.
                    geometry: {
                        type: "Point",
                        coordinates: [el.location.latitude, el.location.longitude]
                    },
                    properties: {
                        // Контент метки.
                        hintContent: buildHint(el)
                    }
                }, {

                    // Опции.
                    // Иконка метки будет растягиваться под размер ее содержимого.
                    preset: 'islands#redIcon',
                    // Метку можно перемещать.
                    draggable: false
                }))
            }
        })
    };
    $.ajax({
        type: 'GET',
        url: reqURL,
        success: success,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        async: false
    });
}

ymaps.ready(function () {
    myMap = new ymaps.Map('map', {
        center: coords,
        zoom: 9
    }, {
        searchControlProvider: 'yandex#search'
    });

    // Создаём макет содержимого.
    MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
        '<div style="color: #FFFFFF; font-weight: bold;">$[properties.iconContent]</div>'
    );

    myGeoObject = new ymaps.GeoObject({
        // Описание геометрии.
        geometry: {
            type: "Point",
            coordinates: coords
        },
        properties: {
            iconContent: 'Drag to search crimes'
        }

    }, {
        // Опции.
        // Иконка метки будет растягиваться под размер ее содержимого.
        preset: 'islands#blackStretchyIcon',
        // Метку можно перемещать.
        draggable: true
    });
    myGeoObject.events.add('dragend', function (e) {
        var coordinates = e.get('target').geometry.getCoordinates();
        coordinates[1] = coordinates[1].toPrecision(6);
        coordinates[0] = coordinates[0].toPrecision(6);

        searchCrime(coordinates);

    });

    myMap.geoObjects
        .add(myGeoObject);
});


application.controller('StartCtrl', ['$scope', '$state', '$rootScope', '$timeout',
    function ($scope, $state, $rootScope, $timeout) {
        $scope.currentDate = new Date().toISOString().substring(0, 7);
        $.ajax({
            type: 'GET',
            url: 'https://data.police.uk/api/crime-categories?date=' + $scope.currentDate,
            success: function (data) {
                $scope.categories = data;
            },
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            async: false
        });
    }]);
