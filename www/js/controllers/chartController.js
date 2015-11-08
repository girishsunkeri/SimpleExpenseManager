appModule.controller('ChartCtrl', function($scope, Report, Settings, $cordovaToast, $cordovaDatePicker) {
  $scope.labels = [];
  $scope.series = [];
  $scope.data = [
      []
  ];
  $scope.itemcount = 0;

  $scope.startDate = new Date();

  $scope.endDate = new Date();

  $scope.startDatePicker  = function () {
      $cordovaDatePicker.show({
          date: new Date($scope.startDate),
          mode: 'date'
      }).then(function (date) {
          $scope.startDate = new Date(date);
          $scope.updateReportExpenses();
      }); 
  };

  $scope.endDatePicker  = function (val) {
      $cordovaDatePicker.show({
          date: new Date($scope.endDate),
          mode: 'date'
      }).then(function (date) {
          $scope.endDate = new Date(date);
          $scope.updateReportExpenses();
      }); 
  };

  
  $scope.updateReportExpenses = function(){
    Report.getReportByDate($scope.startDate, $scope.endDate).then(function(reportExpenses){
      $scope.labels = [];
      $scope.series = [];
      $scope.data = [
          []
      ];

      $scope.itemcount = 0;

      console.log("reportExpenses " + reportExpenses.length)
      $scope.reportExpenses = reportExpenses;
      if($scope.reportExpenses.length > 0){
        $scope.itemcount = $scope.reportExpenses.length;
        console.log("$scope.itemcount");
        console.log($scope.itemcount);
        var max = parseFloat($scope.reportExpenses[0].totalCost);
      }else{
        var canvas = document.getElementById('bar');
        if (canvas){
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
        }
        if(window.cordova){
          $cordovaToast.show('Records not found', 'short', 'top');
        }else{
          alert("Records not found");
        }
      }
      angular.forEach($scope.reportExpenses, function(value, key){
          $scope.labels.push(value.title);
          $scope.data[0].push(value.totalCost);
      });
    });
  }



  $scope.$on('$ionicView.enter', function(e) {

    Settings.get('offsetDate').then(function(result){
      console.log(result);
      if(result){
        $scope.startDate = new Date(result.SettingValue);
      }

      $scope.updateReportExpenses();
    })
  });
});