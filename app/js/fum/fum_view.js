/*
 * Copyright (c) 2016. .保留所有权利.
 *                       
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('fumViewController', ['$scope', '$http', '$stateParams', function ($scope, $http, $stateParams) {
    function formatDatetime(str) {
        if (str.indexOf("-")<0) {
            return str.substring(0, 4) + "-" + str.substring(4, 6) + "-" + str.substring(6, 8);
        }else{
            return str;
        }
    }
    $("#houseName").html($stateParams.name); //设置仓名
    $("#inspectionTime").html($stateParams.time == null ? '' : formatDatetime($stateParams.time)); //设置检测时间

    $.ajax({
        type: "POST",
        url: GserverURL + "/fum/list",
        dataType: 'json',
        data: {"code":$stateParams.id}, //以json格式传递
        async: false,
        "success": function (resp) {
            if(resp.success){
                $scope.cangdata = resp.data.aaData[0];
                console.log($scope.cangdata);
            }
        }
    });


    $scope.instime = $stateParams.time == null ? '' : formatDatetime($stateParams.time);
    $scope.ihouseName = $stateParams.name;
    $scope.gasId = $stateParams.id; //获取检测编码
    angular.element("#topBar").append(getHtmlInfos("app/views/base/to_back.html", "返回", "goGrain")); //添加功能按钮
    $("#goGrain").click(function () {
        window.location.href = "#/fum/history";
    });
    /*$http({ //首次进入，获取气调信息
        url: '/fum/load',
        method: 'POST',
        data: {id: $scope.gasId}
    }).success(function (result) {
        if (result.success) {
            $scope.fumInfo = result.data;
            if($scope.fumInfo.starttime != null && $scope.fumInfo.starttime != "") $scope.fumInfo.starttime = formatDate($scope.fumInfo.starttime);
            if($scope.fumInfo.endtime != null && $scope.fumInfo.endtime != "") $scope.fumInfo.endtime = formatDate($scope.fumInfo.endtime);
        }else {
            alert(result.info);
        }
    });*/
}]);