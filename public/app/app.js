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
        .when('/admin/words', {
            templateUrl: '/partials/admin/words-list',
            controller: 'adminWordsController',
            resolve: routeRoleChecks.admin
        })
        .when('/admin/words/new', {
            templateUrl: '/partials/admin/word-details',
            controller: 'wordDetailsController',
            resolve: routeRoleChecks.admin
        })
        .when('/admin/words/:id', {
            templateUrl: '/partials/admin/word-details',
            controller: 'wordDetailsController',
            resolve: routeRoleChecks.admin
        })
        .when('/admin/languages', {
            templateUrl: '/partials/admin/languages-list',
            controller: 'languagesController',
            resolve: routeRoleChecks.admin
        })
        .when('/admin/languages/new', {
            templateUrl: '/partials/admin/languags-details',
            controller: 'languageDetailsController',
            resolve: routeRoleChecks.admin
        })
        .when('/admin/languages/:id', {
            templateUrl: '/partials/admin/languags-details',
            controller: 'languageDetailsController',
            resolve: routeRoleChecks.admin
        });
});


angular.module('app').run(function ($rootScope, $location) {
    $rootScope.$on('$routeChangeError', function (evt, current, previous, rejection) {
        if (rejection === 'not authorized') {
            $location.path('/');
        }
    });
});
