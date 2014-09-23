//angular.module('app').value('toastrNotifier', toastr);

angular.module('app').factory('appNotifier', function () {
    return {
        notify: function (message, success) {
            Messenger().post({
              message : message,
              type: success ? "success" : "error",
              showCloseButton : true
            });
            // if (success) {
            //     toastrNotifier.success(message);
            // }
            // else
            // {
            //     toastrNotifier.error(message);
            // }
        }
    };
});
