angular.module('app').controller('adminUserDetailsController', function ($scope, userService, $routeParams, authService, appNotifier, $location) {
    $scope.user = userService.get({ id: $routeParams.id });

    $scope.addRole = function () {
        if ($scope.user.local.roles.indexOf("") === -1)
            $scope.user.local.roles.push("");
    };

    $scope.removeRole = function (index) {
        $scope.user.local.roles.splice(index, 1);
    };

    $scope.update = function () {
        authService.updateUser($scope.user).then(function () {
            $location.path('/admin/users')
            appNotifier.notify('User details successfully updated', true);
        }, function (reason) {
            appNotifier.notify(reason, false);
        });
    };

    $scope.roleOptions = [{ value: "user", text: "user" }, { value: "admin", text: "admin" }];    
});