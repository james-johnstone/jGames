angular.module('app').factory('identity', function ($window, userService) {
    var currentUser;

    if (!!window.bootstrappedUserObject) {
        var currentUser = new userService();
        angular.extend(currentUser, window.bootstrappedUserObject);
    }

    return {
        currentUser: currentUser,
        isAuthenticated: function () {
            return !!this.currentUser;
        },
        isAuthorized: function (role) {
            return !!this.currentUser && this.currentUser.local.roles.indexOf(role) > -1;
        },
        getUsername: function () {
            if (!this.currentUser)
                return;

            var user = this.currentUser;

            if (!!user.local.userName)
                return user.local.userName;

            if (!!user.local.email)
                return user.local.email;

            if (!!user.facebook)
                return user.facebook.name || user.google.name;

            if(!!user.google)
                return user.google.email || user.twitter.displayName;

            if (!!user.twitter)
                return user.twitter.displayName || user.twitter.userName;
        }
    };
})