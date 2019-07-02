/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('tareweightController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {
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

    $scope.upNetWeight = function(){
        var jz = parseInt($scope.grossweight) - parseInt($scope.tareweight);
        $("#netweight").val(jz);
        $scope.outinTare.netweight=jz;
    }


    //获取称重;
    $scope.getTareWeight = function () {
        $scope.url='http://192.0.0.99:8868/liangqing';
        $http({
            url: $scope.url,
            method: 'GET'
        }).success(function (response) { //提交成功
            if (response.requst==1) { //信息处理成功，进入用户中心页面
                var tareWeight=response.data;
                tareWeight=tareWeight*1;
                $scope.tareweight=tareWeight;
                $scope.upNetWeight();
                $("#tareweight").val(tareWeight);
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, "服务器有异常", "error");
            }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })

        //获取两张车辆照片 begin
        $http({
            url: '/lpr/scklpr',
            method: 'POST'
        }).success(function (result) { //提交成功
            if (result.success) { //信息处理成功，进入用户中心页面
                $("#zp1").attr("src","app/img/"+result.data.zp1);
                $("#zp2").attr("src","app/img/"+result.data.zp2);
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, result.info, "error");
            }
        }).error(function () { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })
        //获取两张车辆照片 end

    }


    //获取车牌照片;
    $scope.readLicensePlate = function () {

        $http({
            url: '/PlateServlet',
            method: 'GET'
        }).success(function (response) { //提交成功
            if (response.success) {
                $scope.vehicleno = response.info;
                $("#cphm").val($scope.vehicleno);
                $("#clzp").attr("src", "app/img/cur_cheliang.jpg");
            }else{
                $("#cphm").val("");
                $("#clzp").attr("src", "app/img/cheliang.jpg");
                rzhdialog(ngDialog, "无车牌信息", "error");
            }
        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })
    }


    //根据智能卡号获取出入库信息
    $scope.getByCardno=function () {
        $scope.cardno=$("#smart_card").val();
        $http({ //查询按钮权限
            url: "/outin/getByCardno",
            method: 'POST',
            data:{cardno:$scope.cardno},
            async: false
        }).success(function (response) {
            if (response.success) {
                $scope.outinEntry = response.data.outinEntry;
                $scope.outinGross = response.data.outinGross;
                $scope.grossweight = $scope.outinGross.grossweight;
                $scope.upNetWeight();
            }
        });
    }


    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        $scope.cardno=$("#smart_card").val();
        $scope.outinEntry.cardno=$scope.cardno;
        $scope.outinTare.clzp=$("#clzp").val();
        $scope.outinTare.zp1=$("#zp1").val();
        $scope.outinTare.zp2=$("#zp2").val();
        var pData = {
            outinEntryStr: JSON.stringify($scope.outinEntry),
            outinTareStr: JSON.stringify($scope.outinTare)
        };
        $http({
            url: GserverURL+'/outin/weight/saveTare',
            method: 'POST',
            data: pData
        }).success(function (response) { //提交成功
            if (response.success) { //信息处理成功，进入用户中心页面
                rzhdialog(ngDialog, response.info, "success");
                $scope.outinEntry=null;
                $scope.outinTare=null;
                $scope.cardno=null;
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, response.info, "error");
            }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })
    }
}]);


