angular.module('app').controller('userProfileController', function ($scope, authService, identity, appNotifier) {

    $scope.user = angular.copy(identity.currentUser);

    $scope.update = function () {
        authService.updateUser($scope.user).then(function () {
            appNotifier.notify('Your profile has been successfully updated', true);
        }, function (reason) {
            appNotifier.notify(reason, false);
        });
    }

    $scope.unlinkTwitter = function () {
        $scope.user.twitter = null;
        $scope.update();
    }

    $scope.unlinkGoogle = function () {
        $scope.user.google = null;
        $scope.update();
    }

    $scope.unlinkFacebook = function () {
        $scope.user.facebook = null;
        $scope.update();
    }
})