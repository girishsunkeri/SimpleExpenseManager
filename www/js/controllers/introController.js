appModule.controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate, Settings){

  $scope.startApp = function(){
    console.log("skipped");
    Settings.set('noIntro', true);
    $state.go('app.dashboard');
  };

  $scope.next = function(){
    $ionicSlideBoxDelegate.next();
  };

  $scope.previous = function(){
    $ionicSlideBoxDelegate.previous();
  };

  $scope.slideChanged = function(index){
    console.log("slideChanged");
    $scope.slideIndex = index;
  }
});
