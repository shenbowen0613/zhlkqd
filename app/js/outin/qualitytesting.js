/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('qualitytestingController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {



    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=zjoperator_list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.zjoperatorList = response.data;
        }
    });


    //获取仓房列表
    $.ajax({ //查询按钮权限
        url: GserverURL + "/la/house/tree?isrs=1",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.treeInfos = response.data;
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

    //添加数据
    $scope.save = function () {
        $scope.cardno = $("#smart_card").val();
        $scope.removeWater = $("#removeWater").val();
        $scope.removeFood = $("#removeFood").val();
        $scope.assayNames = "";
        $scope.assayValues = "";
        $scope.assayCutValues = "";
        $("input[name='assayNames']").each(function () {
                $scope.assayNames = $scope.assayNames + $(this).val() + ",";
            }
        );
        $("input[name='assayValues']").each(function () {
                $scope.assayValues = $scope.assayValues + $(this).val() + ",";
            }
        );
        $("input[name='assayCutValues']").each(function () {
                $scope.assayCutValues = $scope.assayCutValues + $(this).val() + ",";
            }
        );
        $scope.assayNames = $scope.assayNames.substr(0, $scope.assayNames.length - 1);
        $scope.assayValues = $scope.assayValues.substr(0, $scope.assayValues.length - 1);
        $scope.assayCutValues = $scope.assayCutValues.substr(0, $scope.assayCutValues.length - 1);
        angular.forEach($scope.treeInfos, function (item) {
            if ($scope.housecode == item.code) {
                $scope.housename = item.label;
            }
        });
        $("#housename").val($scope.housename);
        var pData = {
            cardno: $scope.cardno,
            assayNames: $scope.assayNames,
            assayValues: $scope.assayValues,
            assayCutValues: $scope.assayCutValues,
            isPass: $scope.isPass,
            removeWater: $scope.removeWater,
            removeFood: $scope.removeFood,
            level: $scope.level,
            housecode: $scope.housecode,
            housename: $scope.housename,
            zjoperator: $scope.zjoperator
        };

        // angularParamString($http); //解决post提交接收问题，json方式改为string方式
        $http({
            url: GserverURL + '/outin/quality/addDetail',
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


    var LODOP;

    $scope.print_setup = function () {//打印维护
        LODOP = getLodop();

        LODOP.PRINT_INITA(10, 9, 762, 533, "质量检验打印");
        LODOP.ADD_PRINT_TEXT(285, 28, 29, 25, "等级");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(287, 91, 31, 20, "容重");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(87, 91, 31, 20, "仓房");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(287, 154, 27, 20, "水份");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(287, 220, 32, 21, "杂质");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(288, 281, 36, 20, "不完善粒");
        LODOP.ADD_PRINT_TEXT(287, 349, 44, 20, "色泽气味");
        LODOP.PRINT_SETUP();
    };


    $scope.print_preview = function () {


        var level = $("input[name='level']:checked").val();
        var rongzhong = $("#rongzhong").val();
        var shuifenVal = $("#shuifenVal").val();
        var zazhiVal = $("#zazhiVal").val();
        var buwanshanliVal = $("#buwanshanliVal").val();
        var sezeqiwei = $("#sezeqiwei").val();
        var housename = $("#housecode  option:selected").text();

        LODOP = getLodop();
        LODOP.PRINT_INITA(10, 9, 762, 533, "质量检验打印");
        LODOP.ADD_PRINT_TEXT(285, 28, 29, 25, level);
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(287, 91, 31, 20, rongzhong);
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(87, 91, 31, 20, housename);
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(287, 154, 27, 20, shuifenVal);
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(287, 220, 32, 21, zazhiVal);
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(288, 281, 36, 20, buwanshanliVal);
        LODOP.ADD_PRINT_TEXT(287, 349, 44, 20, sezeqiwei);
        LODOP.PREVIEW();
    }


    //水分增扣量
    $scope.shuifenCheck = function () {
        var shuifenVal = $("#shuifenVal").val() * 10;
        var shuifenValcut = 0;
        var biaozhunshuifen = 125;
        var kouliang = shuifenVal - biaozhunshuifen;
        var adds = 0;
        if (kouliang <= 0) {
            kouliang = kouliang *(-1);
            var addsz = Math.floor(kouliang / 5);
            if (addsz >= 5) {
                adds = 3.75;
            } else {
                adds = addsz * 0.75;
            }
            adds = adds * (-1);
            shuifenValcut = adds;
        } else {
            var addsz = Math.floor(kouliang / 5);
            adds = addsz * 1;
            shuifenValcut = adds;
        }
        $("#shuifenValRemove").val(shuifenValcut);
        this.calcRemoveFood();
    }

    //杂质检测
    $scope.zazhiCheck = function () {
        var zazhiVal = $("#zazhiVal").val() * 10;
        var zazhiValcut = 0;
        var biaozhunzazhi = 10;
        var kouliang = zazhiVal - biaozhunzazhi;
        var adds = 0;
        if (kouliang <= 0) {
            kouliang = kouliang *(-1);
            var addsz = Math.floor(kouliang / 5);
            if (addsz >= 2) {
                adds = 1.5;
            } else {
                adds = addsz * 0.75;
            }
            adds = adds * (-1);
            zazhiValcut = adds;
        } else {
            var addsz = Math.floor(kouliang / 5);
            adds = addsz * 1.5;
            zazhiValcut = adds;
        }
        $("#zazhiValRemove").val(zazhiValcut);
        this.calcRemoveFood();
    }

    //矿物质检测
    $scope.kuangwuzhiCheck = function () {
        var kuangwuzhiVal = $("#kuangwuzhiVal").val() * 10;
        var kuangwuzhiValCut = 0;
        var biaozhunkuangwuzhi = 5;
        var kouliang = kuangwuzhiVal - biaozhunkuangwuzhi;
        if (kouliang > 0) {
            kuangwuzhiValCut = 0.75;
        }else{
            kuangwuzhiValCut = 0;
        }

        if ($scope.varietyname == '荞麦'){//品种是荞麦
            kuangwuzhiValCut = Math.floor(kouliang/1);
        }

        $("#kuangwuzhiValRemove").val(kuangwuzhiValCut);
        this.calcRemoveFood();
    }

    //不完善颗粒
    $scope.buwanshanliCheck = function () {
        var buwanshanliVal = $("#buwanshanliVal").val() * 10;
        var buwanshanliValCut = 0;
        var biaobuwanshanli = 60;
        var kouliang = buwanshanliVal - biaobuwanshanli;
        var adds = 0;
        if (kouliang <= 0) {
            buwanshanliValCut = 0;
        } else {
            var addsz = Math.floor(kouliang / 10);
            adds = addsz * 0.5;
            buwanshanliValCut = adds;
        }
        $("#buwanshanliValRemove").val(buwanshanliValCut);
        this.calcRemoveFood();
    }


    $("#rongzhongRemove").val(0);
    $("#shuifenValRemove").val(0);
    $("#zazhiValRemove").val(0);
    $("#kuangwuzhiValRemove").val(0);
    $("#buwanshanliValRemove").val(0);
    $("#sezeqiweiRemove").val(0);

    $scope.calcRemoveFood = function () {
        //容重扣量
        var rongzhong = Number($("#rongzhongRemove").val());
        //水分扣量
        var shuifen = Number($("#shuifenValRemove").val());
        //杂质扣量
        var zazhi = Number($("#zazhiValRemove").val());
        //矿物质扣量
        var kuangwuzhi = Number($("#kuangwuzhiValRemove").val());
        //不完善粒扣量
        var buwanshanli = Number($("#buwanshanliValRemove").val());
        //色泽气味扣量
        var sezeqiwei = Number($("#sezeqiweiRemove").val());

        $("#removeFood").val(rongzhong + shuifen + zazhi + kuangwuzhi + buwanshanli + sezeqiwei);
    }

    //根据智能卡号获取出入库信息
    $scope.qualitytestingGetByCardno = function () {
        $scope.cardno = $("#smart_card").val();
        $http({ //查询按钮权限
            url: GserverURL + "/outin/getByCardno",
            method: 'POST',
            data: {cardno: $scope.cardno},
            async: false
        }).success(function (response) {
            if (response.success) {
                $scope.outinEntry = response.data.outinEntry;
            }
        });
    }
}]);

