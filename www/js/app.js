var db = null;
var appModule = angular.module('sem', ['ionic', 'ngCordova', 'sem.services','chart.js', 'ngMessages']);

appModule.run(function($ionicPlatform, DB) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    DB.init();
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl',
    onEnter: function($state, Settings){
      Settings.get('noIntro').then(function(data){
        if(data){
          if(data.SettingValue != 'true'){
            $state.go('app.intro');
          }
        }else{
          $state.go('app.intro');
        }
      })
    }
  })

.state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.browse', {
    url: '/browse',
    views: {
      'menuContent': {
        templateUrl: 'templates/browse.html'
      }
    }
  })

  .state('app.dashboard', {
    url: '/dashboard',
    views: {
      'menuContent': {
        templateUrl: 'templates/dashboard.html',
        controller: 'DashboardCtrl'
      }
    }
  })

  .state('app.expense', {
    url: '/expense',
    views: {
      'menuContent': {
        templateUrl: 'templates/myExpenses.html',
        controller: 'ExpenseCtrl'
      }
    }
  })

  .state('app.expenseDetails', {
    url: '/expense/:expenseId',
    views: {
      'menuContent': {
        templateUrl: 'templates/expenseDetails.html',
        controller: 'ExpenseDetailsCtrl'
      }
    }
  })

  .state('app.report', {
    url: '/report',
    views: {
      'menuContent': {
        templateUrl: 'templates/report.html',
        controller: 'ReportCtrl'
      }
    }
  })

  .state('app.categories', {
    url: '/categories',
    views: {
      'menuContent': {
        templateUrl: 'templates/categories.html',
        controller: 'CategoriesCtrl'
      }
    }
  })

  .state('app.category', {
    url: '/categories/:categoryId',
    views: {
      'menuContent': {
        templateUrl: 'templates/category.html',
        controller: 'CategoryCtrl'
      }
    }
  })

  .state('app.chart', {
    url: '/chart',
    views: {
      'menuContent': {
        templateUrl: 'templates/chart.html',
        controller: 'ChartCtrl'
      }
    }
  })

  .state('app.settings', {
    url: '/settings',
    views: {
      'menuContent': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('app.intro', {
    url: '/intro',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/intro.html',
        controller: 'IntroCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise('/app/dashboard');
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, UI, $state) {

  $scope.loginData = {};

  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.doLogin = function() {
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  $scope.showBackButton = UI.backButtonStatus;

  $scope.navigateToPreviousScreen = function(){
    $state.go('app.dashboard');
  };
})
