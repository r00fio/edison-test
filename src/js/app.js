/**
 * Created by r00fi0 on 6/10/16.
 */
var app = angular.module('app', ['ionic','ui.router']);

app.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('start', {
            url: '/start',
            templateUrl: 'index.html',
            controller: 'StartCtrl',
            cache: false
        });
    
});
