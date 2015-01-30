angular.module('app').controller('themeController', function($scope){
    $scope.themes = [{
      name:'ubuntu',
      url:'bootstrap-ubuntu.css'
    },
    {
      name:'cyborg',
      url:'bootstrap-cyborg.css'
    },
    {
      name:'light',
      url:'bootstrap.css'
    },
    {
      name:'slate',
      url:'bootstrap-slate.css'
    },
    {
      name:'yeti',
      url:'bootstrap-yeti.css'
    },
    {
      name:'bright',
      url:'bootstrap-chieko.css'
    }];

    $scope.currentTheme = $scope.themes[0];

    $scope.changeTheme = function(theme){
      $scope.currentTheme = theme;
    }

});
