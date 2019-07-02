/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('aerateViewController', ['$scope', '$http', '$stateParams', function ($scope, $http, $stateParams) {
    $("#houseName").html($stateParams.name); //设置仓名
    $("#inspectionTime").html($stateParams.time == null ? '' : formatDate($stateParams.time)); //设置检测时间
    $scope.gasId = $stateParams.id; //获取检测编码
    angular.element("#topBar").append(getHtmlInfos("app/views/base/to_back.html", "返回", "goGrain")); //添加功能按钮
    $("#goGrain").click(function () {
        window.location.href = "#/aerate/history";
    });
    $http({
            url: GserverURL+ '/aerate/load',
        method: 'POST',
        data: {id: $scope.gasId}
    }).success(function (result) {
        if (result.success) {
            $scope.aerateInfo = result.data;
            if($scope.aerateInfo.starttime != null && $scope.aerateInfo.starttime != "") $scope.aerateInfo.starttime = formatDate($scope.aerateInfo.starttime);
            if($scope.aerateInfo.endtime != null && $scope.aerateInfo.endtime != "") $scope.aerateInfo.endtime = formatDate($scope.aerateInfo.endtime);
        }else {
            alert(result.info);
        }
    });
}]);