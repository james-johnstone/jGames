angular.module('app').controller('themeController', function($scope){
    $scope.themes = [{
      name:'standard',
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
      name:'ubuntu',
      url:'bootstrap-ubuntu.css'
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
