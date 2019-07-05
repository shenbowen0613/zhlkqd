﻿/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('grossweightController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {


    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=looker_list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.lookerList = response.data;
        }
    });


    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=dtoperator_list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.dtoperatorList = response.data;
        }
    });


    $scope.readSmartCard = function () {
        var mcard = document.getElementById("mcard");
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

    $scope.showDiv = function (tid) {
        $("#outinDiv").hide();
        $("#inDiv").hide();
        $("#outDiv").hide();
        $("#outinDiv").show();
        $("#" + tid).show();
    }


    $scope.upNetWeight = function () {
        if ($scope.iotypename == '出库') {
            $scope.grossweight = $("#grossweight").val();
            if ($scope.tareweight == null) {
                $scope.tareweight = 0;
            }
            if ($scope.grossweight == null) {
                $scope.grossweight = 0;
            }
            var jz = parseInt($scope.grossweight) - parseInt($scope.tareweight);
            $("#netweight").val(jz);
            $scope.netweight = jz;
        } else {
            $("#netweight").val(0);
            $scope.netweight = 0;
        }
    }


    //商城获取车牌照片;
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

    //下磅抬杆;
    $scope.xiabangtaigan = function () {
        $scope.doding = true;
        if ($scope.iotypename == "入库") {
            $scope.url = '/lpr/xxklpr?cameraId=114';
        } else if ($scope.iotypename == "出库") {
            $scope.url = '/lpr/xxklpr?cameraId=113';
        } else {
            $scope.doding = false;
            rzhdialog(ngDialog, "请选择出入库类型", "error");
        }
        if ($scope.doding) {
            $http({
                url: $scope.url,
                method: 'POST'
            })
        }
    }

    //获取称重;
    $scope.getWeight = function () {
        $scope.url = 'http://192.0.0.200:8868/liangqing';
        $http({
            url: $scope.url,
            method: 'GET'
        }).success(function (response) { //提交成功
            if (response.requst == 1) { //信息处理成功，进入用户中心页面
                var grossweight = response.data;
                grossweight = grossweight * 1;
                $("#grossweight").val(grossweight);
                $scope.upNetWeight();
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, "服务器有异常", "error");
            }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })

        //抓拍三张图
        $http({
            url: '/lpr/scklpr',
            method: 'POST'
        }).success(function (response) { //提交成功
            if (response.success) { //信息处理成功，进入用户中心页面
                $scope.result = response.data;
                $("#zp1").attr("src", $scope.result.zp1);
                $("#zp1val").val($scope.result.zp1);
                $("#zp2").attr("src", $scope.result.zp2);
                $("#zp2val").val($scope.result.zp2);
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, response.info, "error");
            }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })
    }


    //根据智能卡号获取出入库信息
    $scope.grossWeightGetByCardno = function () {
        $scope.cardno = $("#smart_card").val();
        $http({ //查询按钮权限
            url: "/outin/weight/loadGross",
            method: 'POST',
            data: {cardno: $scope.cardno},
            async: false
        }).success(function (response) {
            if (response.success) {
                $scope.outinEntry = response.data.outinEntry;
                $scope.tareweight = response.data.weight;
                $scope.upNetWeight();
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, response.info, "error");
            }
        });
    }


    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        $scope.cardno = $("#smart_card").val();
        $scope.vehicleno = $("#cphm").val();
        $scope.grossweight = $("#grossweight").val();
        $scope.clzp = $("#clzpval").val();
        $scope.zp1 = $("#zp1val").val();
        $scope.zp2 = $("#zp2val").val();
        $scope.zp3 = $("#zp3val").val();
        $scope.outinGross.grossweight = $scope.grossweight;
        $scope.outinGross.clzp = $scope.clzp;
        $scope.outinGross.zp1 = $scope.zp1;
        $scope.outinGross.zp2 = $scope.zp2;
        $scope.outinGross.zp3 = $scope.zp3;
        var pData = {
            cardno: $scope.cardno,
            iotypename: $scope.iotypename,
            outinGrossStr: JSON.stringify($scope.outinGross)
            , vehicleno: $scope.vehicleno,
            netweight: $scope.netweight
        };
        $http({
            url: GserverURL + '/outin/weight/save',
            method: 'POST',
            data: pData
        }).success(function (response) { //提交成功
            if (response.success) { //信息处理成功，进入用户中心页面
                rzhdialog(ngDialog, response.info, "success");
                $scope.outinEntry = null;
                $scope.outinGross = null;
                $scope.cardno = null;
                $scope.vehicleno = null;
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, response.info, "error");
            }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })
    }


    $scope.print_setup = function () {//打印维护
        LODOP = getLodop();
        LODOP.PRINT_INITA(10, 9, 762, 533, "毛重检斤打印");
        LODOP.ADD_PRINT_TEXT(285, 451, 100, 20, "毛重");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.PRINT_SETUP();
    };


    $scope.print_preview = function () {

        var grossweight = $("#grossweight").val();

        LODOP = getLodop();
        LODOP.PRINT_INITA(10, 9, 762, 533, "毛重检斤打印");
        LODOP.ADD_PRINT_TEXT(285, 451, 100, 20, grossweight);
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.PREVIEW();
    }


}]);


