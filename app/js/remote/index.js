App.controller('remoteController', ['$scope', '$http', 'ngDialog','$rootScope','$state', function ($scope, $http, ngDialog,$rootScope,$state) {
    $rootScope.app.navbarTitle = " 远程监管系统"; //设置头部提示信息
    $scope.list=function() {
        $.ajax({ //获取命令列表信息
            url: '/remote/command/list',
            method: 'POST',
            async: false
        }).success(function (result) {
            if (result.success) {
                $scope.files = result.data;
                $scope.curFile=$scope.files[0];
                $scope.getDetail($scope.curFile);
            }
        });
    }

    //获取命令详情
    $scope.getDetail=function(commandName) {
        $scope.curFile=commandName;
        $.ajax({
            url: '/remote/command/detail',
            method: 'POST',
            data:{
                commandName:commandName
            },
            async: false
        }).success(function (result) {
            if (result.success) {
                $scope.commandDetail = result.data;
            }
        });
    }

    //获取命令详情
    $scope.delete=function(commandName) {
        $scope.curFile=commandName;
        $.ajax({
            url: '/remote/command/delete',
            method: 'POST',
            data:{
                commandName:commandName
            },
            async: false
        }).success(function (result) {
            if (result.success) {
                rzhdialog(ngDialog,"删除成功！","success");
                $scope.list();
            }
        });
    }
    $scope.list();

    $scope.toEdit=function(commandName) {
        $state.go('remote.edit',{commandName:commandName});
    }

    $scope.edit=function(commandDetail) {
        $.ajax({
            url: '/remote/command/update',
            method: 'POST',
            data:{
                commandName:$scope.curFile,
                par:commandDetail
            },
            async: false
        }).success(function (result) {
            if (result.success) {
                rzhdialog(ngDialog,"修改成功！","success");

            }
        });
    }



}]);


