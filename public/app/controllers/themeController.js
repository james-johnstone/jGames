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

    var previousTheme = docCookies.getItem("theme");

    if (!!previousTheme){
       var previousTheme = $scope.themes.filter(function(el){ return el.name == previousTheme;});;
         if (!!previousTheme[0])
           $scope.currentTheme = previousTheme[0];
    }
    else
      $scope.currentTheme = $scope.themes[0];

    $scope.changeTheme = function(theme){
      docCookies.setItem('theme', theme.name);

      $scope.currentTheme = theme;
    }

});
