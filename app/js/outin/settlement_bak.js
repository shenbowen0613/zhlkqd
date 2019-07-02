/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('settlementController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {

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

    //根据智能卡号获取出入库信息
    $scope.settlementGetByCardno=function () {
        $scope.cardno=$("#smart_card").val();
        console.log("$scope.cardno++"+$scope.cardno);
        $http({
            url: GserverURL+"/outin/settlement/load",
            method: 'POST',
            data:{cardno:$scope.cardno},
            async: false
        }).success(function (response) {
            if (response.success) {
                $scope.settlementDetailVO = response.data;
                var grossweight=$scope.settlementDetailVO.grossweight;
                var tareweight=$scope.settlementDetailVO.tareweight;
                var qualitycutweight=$scope.settlementDetailVO.qualitycutweight;
                var jsweight=(grossweight-tareweight)*(100-qualitycutweight)/100;
                jsweight=jsweight.toFixed(2);
                $scope.jsweight=jsweight;
                $("#jsweight").val($scope.jsweight);
            }
        });
    }

    $scope.sumJsMoney = function(obj){
        var jsweight = $("#jsweight").val();
        var jsprice = obj.outinSettlement.jsprice;
        var sumNum = 0;
        if(jsweight!=null&&jsprice!=""){
            sumNum = jsweight * jsprice;
        }
        sumNum=sumNum.toFixed(2);
        $scope.jsweight=jsweight;
        $scope.jsmoney=sumNum;
        $("#jsmoney").val($scope.jsmoney);
    }

    //添加数据
    $scope.settlement = function () {
        $scope.outinSettlement.jsmoney=$scope.jsmoney;
        $scope.outinSettlement.jsweight=$scope.jsmoney;
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        $scope.outinSettlement.busno=$scope.busno;
        var pData = {
            outinSettlementStr: JSON.stringify($scope.outinSettlement)
        };
        $http({
            url: GserverURL+'/outin/settlement/settlement',
            method: 'POST',
            data: pData
        }).success(function (response) { //提交成功
            if (response.success) { //信息处理成功，进入用户中心页面
                rzhdialog(ngDialog, response.info, "success");
                $scope.cardno=null;
                $scope.jsweight=null;
                $scope.jsmoney=null;
                $scope.settlementDetailVO=null;
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, response.info, "error");
            }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })
    }
}]);


