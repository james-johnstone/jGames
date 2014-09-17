angular.module('app').factory('userService', function ($resource) {

    var UserResource = $resource('/api/users/:id', { _id: "@id" }, {
        update: { method: 'PUT', isArray: false }
    });

    UserResource.prototype.isAdmin = function () {
        return this.local.roles && this.local.roles.indexOf('admin') > -1;
    }

    return UserResource;
})