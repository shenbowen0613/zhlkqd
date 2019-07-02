App.controller('zjjcindexController', ['$scope', '$http', 'ngDialog', '$rootScope', function ($scope, $http, ngDialog, $rootScope) {
    $rootScope.app.navbarTitle = "专家决策系统"; //设置头部提示信息

    $http({
        url: GserverURL+ '/la/house/list',
        method: 'POST'
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            if(response.data!=null){
                $scope.house = response.data.aaData;
            }
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    });
    $scope.buttontoview = function (data) {
        console.log(data);
        window.location.href = "#/zjjc/aeration/view";
    };
    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/zjjc/aeration";
    }
}]);
// 查看详情
App.controller("zjjcindexViewController", function ($scope, $stateParams,$http, ngDialog) {

});