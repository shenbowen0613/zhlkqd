/*
 * Copyright (c) 2016. .保留所有权利.
 *                       
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

// 查看详情
App.controller("viewOutinDetailController", function ($scope, $stateParams, $http, ngDialog) {
    $http({
        url: GserverURL + '/outin/detailedAll',
        method: 'POST',
        data: {busno: $stateParams.busno}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.outinEnty = response.data;
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog, response.info, "error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog, "操作失败", "error");
    })
});

