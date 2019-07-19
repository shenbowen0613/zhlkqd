/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('samplingController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {

    //获取扦样人员列表
    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=sampling_list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.samplingList = response.data;
        }
    });



    $scope.readSmartCard=function () {
        var mcard=document.getElementById("mcard");

        try {
            var version = mcard.openReader(1, 9600);
            if (mcard.LastRet != 0) {
                alert("打开读写器失败");
                return;
            }
            else {
                var result = mcard.openCard(1, 16); //打开卡片,让其显示16进制字符串卡号
                if (mcard.LastRet != 0) {
                    alert("打开卡片失败或未发现卡片");
                    var result = mcard.closeReader();
                    return;

                }
                else {
                    $("#smart_card").val(result);
                    var result = mcard.closeReader();
                }

            }
        }
        catch (e) {
            console.log(e.Message);
        }
    }

    //添加数据
    $scope.save = function () {
        $scope.cardno=$("#smart_card").val();
        $scope.name=$("#name").val();
        $scope.typecode=$("#typecode").val();
        // $scope.qyoperator=$("#qyoperator").val();
        $scope.memo=$("#memo").val();
        if ($scope.qyoperator!=null || $scope.qyoperator!=undefined) {
            $scope.qyoperator = $scope.qyoperator;
        }else {
            $scope.qyoperator =$scope.samplingList[0].code;
        }
        var pData = {
            busno:$scope.outinEntry.busno,
            cardno:$scope.cardno,
            name:$scope.name,
            typecode:$scope.typecode,
            qyoperator:$scope.qyoperator,
            memo:$scope.memo
        };

        // angularParamString($http); //解决post提交接收问题，json方式改为string方式
        $http({
            url: GserverURL+'/system/outinSampling/add',
            method: 'POST',
            data: pData
        }).success(function (response) { //提交成功
            if (response.success) { //信息处理成功，进入用户中心页面
                rzhdialog(ngDialog, response.info, "success");
                $scope.outinEntry = null;
                $("button[type=reset]").trigger("click");
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, response.info, "error");
            }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })
    }

    //根据智能卡号获取出入库信息
    $scope.samplingGetByCardno=function () {
        $scope.cardno=$("#smart_card").val();
        $http({ //查询按钮权限
            url: GserverURL+"/outin/getByCardno",
            method: 'POST',
            data:{cardno:$scope.cardno},
            async: false
        }).success(function (response) {
            if (response.success) {
                $scope.outinEntry = response.data.outinEntry;
            }
        });
    }
}]);


