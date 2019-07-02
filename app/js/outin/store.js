/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('storeController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {


    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=verifyoperatorname_list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.verifyoperatornameList = response.data;
        }
    });

    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=store_looker_list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.storeLookerList = response.data;
        }
    });


    //根据智能卡号获取出入库信息
    $scope.getByCardno=function () {
        $scope.outinGross=null;
        $scope.outinEntry=null;
        $scope.cardno=$("#smart_card").val();

        $http({ //查询按钮权限
            url: "/outin/weight/loadGross",
            method: 'POST',
            data:{cardno:$scope.cardno},
            async: false
        }).success(function (response) {
            if (response.success) {
                $scope.outinEntry = response.data.outinEntry;
            }
        });
    }

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
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        $scope.outinStore.busno=$scope.outinEntry.busno;
        $scope.outinEntry.cardno=$("#smart_card").val();
        var pData = {
            outinStoreStr: JSON.stringify($scope.outinStore),
            outinEntryStr: JSON.stringify($scope.outinEntry)
        };
        $http({
            url: GserverURL+'/outin/store/save',
            method: 'POST',
            data: pData
        }).success(function (response) { //提交成功
            if (response.success) { //信息处理成功，进入用户中心页面
                rzhdialog(ngDialog, response.info, "success");
                $scope.outinStore=null;
                $scope.outinGross=null;
                $scope.outinEntry=null;
                $scope.cardno=null;
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, response.info, "error");
            }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })
    }


    $scope.print_setup=function() {//打印维护
        LODOP = getLodop();

        LODOP.PRINT_INITA(10,9,762,533,"打印控件功能演示_Lodop功能_移动公司发票全样");
        LODOP.ADD_PRINT_TEXT(97,254,48,20,"年");
        LODOP.ADD_PRINT_TEXT(97,127,119,20,"承储单位");
        LODOP.ADD_PRINT_TEXT(96,556,122,20,"编号");
        LODOP.ADD_PRINT_TEXT(97,339,29,20,"月");
        LODOP.ADD_PRINT_TEXT(97,397,30,20,"日");
        LODOP.ADD_PRINT_TEXT(285,28,29,25,"等级");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(287,91,31,20,"容重");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(287,154,27,20,"水份");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(287,220,32,21,"杂质");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(288,281,36,20,"不完善粒");
        LODOP.ADD_PRINT_TEXT(287,349,44,20,"色泽气味");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(285,451,26,20,"毛重");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(286,563,30,20,"皮重/增扣量");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(285,678,31,20,"净重");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
        LODOP.ADD_PRINT_TEXT(341,218,34,25,"拾");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(342,305,33,25,"万");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(344,382,49,25,"仟");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(345,479,36,25,"佰");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(344,554,54,25,"拾");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(346,647,28,25,"xx");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
        LODOP.ADD_PRINT_TEXT(181,86,47,20,"企业(个人)");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(182,260,30,20,"合同编号");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(182,365,28,20,"仓房");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(182,426,31,20,"品种");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(182,490,43,20,"运输工具");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(182,589,27,20,"车号");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
        LODOP.ADD_PRINT_TEXT(183,688,38,20,"承运人");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);

        LODOP.PRINT_SETUP();
    };



    $scope.print_preview = function () {
        LODOP = getLodop();
        LODOP.PRINT_INITA(10,9,762,533,"打印控件功能演示_Lodop功能_移动公司发票全样");
        LODOP.ADD_PRINT_TEXT(97,254,48,20,"年");
        LODOP.ADD_PRINT_TEXT(97,127,119,20,"承储单位");
        LODOP.ADD_PRINT_TEXT(96,556,122,20,"编号");
        LODOP.ADD_PRINT_TEXT(97,339,29,20,"月");
        LODOP.ADD_PRINT_TEXT(97,397,30,20,"日");
        LODOP.ADD_PRINT_TEXT(285,28,29,25,"等级");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(287,91,31,20,"容重");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(287,154,27,20,"水份");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(287,220,32,21,"杂质");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(288,281,36,20,"不完善粒");
        LODOP.ADD_PRINT_TEXT(287,349,44,20,"色泽气味");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(285,451,26,20,"毛重");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(286,563,30,20,"皮重/增扣量");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(285,678,31,20,"净重");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
        LODOP.ADD_PRINT_TEXT(341,218,34,25,"拾");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(342,305,33,25,"万");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(344,382,49,25,"仟");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(345,479,36,25,"佰");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(344,554,54,25,"拾");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(346,647,28,25,"xx");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
        LODOP.ADD_PRINT_TEXT(181,86,47,20,"企业(个人)");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(182,260,30,20,"合同编号");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(182,365,28,20,"仓房");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(182,426,31,20,"品种");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(182,490,43,20,"运输工具");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.ADD_PRINT_TEXT(182,589,27,20,"车号");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
        LODOP.ADD_PRINT_TEXT(183,688,38,20,"承运人");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.PREVIEW();
    }




}]);


