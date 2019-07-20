App.controller('outinController', ['$scope', '$http', 'ngDialog','$rootScope', '$location', function ($scope, $http, ngDialog,$rootScope,$location) {
    $rootScope.app.navbarTitle = " 智能出入库系统"; //设置头部提示信息
    var pathUrl = $location.url();
    if(pathUrl=='/outin/index'){
        $scope.title='ruku';
        localStorage.setItem('mod', $scope.title);
    }else if(pathUrl=='/outin/stockout'){
         $scope.title='chuku'
        localStorage.setItem('mod', $scope.title);
    }
}]);
