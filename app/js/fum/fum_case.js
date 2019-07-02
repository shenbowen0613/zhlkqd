/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('fumCaseController', ['$scope', '$http', '$stateParams','ngDialog', function ($scope, $http, $stateParams,ngDialog) {
    $("#houseName").html($stateParams.name); //设置仓名
    $scope.houseCode = $stateParams.code; //获取检测编码
    angular.element("#topBar").append(getHtmlInfos("app/views/base/to_back.html", "返回", "goGrain")); //添加功能按钮
    $("#goGrain").click(function () {
        window.location.href = "#/fum/index";
    });
    $http({ //获取气调方案
        url: '/fum/caseList',
        method: 'POST'
    }).success(function (result) {
        if (result.success) {
            $scope.caseList = result.data;
        }else {
            alert(result.info);
        }
    });
    $scope.fumApply = function(){ //TODO 申请熏蒸方案
        rzhdialog(ngDialog,"申请成功！","success")
    }
}]);