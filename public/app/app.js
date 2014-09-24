angular.module('app', ['ngResource', 'ngRoute', 'ngAnimate']);

angular.module('app').config(function ($routeProvider, $locationProvider) {

    var routeRoleChecks = {
        admin: {
            auth: function (authService) {
                return authService.authorizeCurrentUserForRole('admin');
            }
        },
        user: {
            auth: function (authService) {
                return authService.authenticateCurrentUser();
            }
        }
    }

    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', { templateUrl: '/partials/home/main', controller: 'mainController'})
        .when('/play', {templateUrl: 'partials/game/play', controller: 'gameController'})
        .when('/play/tictactoe', {templateUrl: '/partials/game/tictactoe', controller: 'tictactoeController'})
        .when('/play/pong', {templateUrl: '/partials/game/pong', controller: 'pongController'})
        .when('/play/tetris', {templateUrl: '/partials/game/tetris', controller: 'tetrisController'})
        .when('/profile', {
            templateUrl: '/partials/user/user-profile',
            controller: 'userProfileController',
            resolve: routeRoleChecks.user
        })
        .when('/login', {
            templateUrl: '/partials/auth/login',
            controller: 'authController'
        })
        .when('/signup', {
            templateUrl: '/partials/home/signup',
            controller: 'signupController'
        })
        .when('/connect/local', {
            templateUrl: '/partials/user/connect-local',
            resolve: routeRoleChecks.user
        })
        .when('/admin/users', {
            templateUrl: '/partials/admin/user-list',
            controller: 'adminUsersController',
            resolve: routeRoleChecks.admin
        })
        .when('/admin/users/:id', {
            templateUrl: '/partials/admin/user-details',
            controller: 'adminUserDetailsController',
            resolve: routeRoleChecks.admin
        })
});


angular.module('app').run(function ($rootScope, $location) {
    $rootScope.$on('$routeChangeError', function (evt, current, previous, rejection) {
        if (rejection === 'not authorized') {
            $location.path('/');
        }
    });
});
