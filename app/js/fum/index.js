/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
var selHouseCode;
var selHouseName;
var table;
var zyghOAURL = 'http://192.0.0.250:8002/zhlsOA/';
App.controller('fumController', ['$scope', '$http', 'ngDialog', '$rootScope', function ($scope, $http, ngDialog, $rootScope) {
    $scope.menus = menuItems;
    $rootScope.app.navbarTitle = "智能熏蒸系统"; //设置头部提示信息
    $('#sttime,#edtime').datetimepicker({ //加载日期插件
        todayBtn:  1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        minView: 1, //最小显示单位  2 代表到天
        todayHighlight: 1 //今天日期高亮
    });
    $scope.statescode = "";
    $.ajax({ //获取仓房信息
        url: '/la/house/tree',
        method: 'POST',
        async: false
    }).success(function (result) {
        if (result.success) {
            $scope.houseItems = result.data;
            if ($scope.houseItems.length > 0) {
                selHouseCode = $scope.houseItems[0].code; //设置当前仓房编码
                $scope.statescode = $scope.houseItems[0].code;
                selHouseName = $scope.houseItems[0].label;
                $("#houseName").html("- " + selHouseName); //设置选中的当前仓房名
            }
        }
    });
    $scope.findxz = function () {
        $http({
            url: zyghOAURL + 'findFUm.action',
            method: 'GET',
            params: {housecode:selHouseCode, chaxunTime1:$scope.sttime,chaxunTime2:$scope.edtime}
        }).success(function (result) { //提交成功
            $scope.checked=[];
            if (result!=null||result!=[]||result!="") {
                $scope.housexz = result;
            };
        }).error(function (response) { //提交失败
            rzhdialog(ngDialog,"操作失败","error");
        });
    };
    $scope.findxz();
    $scope.checked=[];
    $scope.selectOne = function() {
        angular.forEach($scope.housexz, function(x) {
            var index = $scope.checked.indexOf(x.fumId);
            if (x.checked && index === -1) {
                $scope.checked.push(x.fumId);
            } else if (!x.checked && index !== -1) {
                $scope.checked.splice(index, 1);
            };
        });
    };
    //点击仓房，加载信息
    $scope.houseInspectionInfo = function (code, name) {
        selHouseCode = code;
        $scope.statescode = code;
        selHouseName = name;
        $("#houseName").html("- " + name); //设置选中的当前仓房名
        $scope.findxz();
    };

    $scope.addupdata = function (d) {
        if(d==2||d==3){
            if($scope.checked[0]==undefined){
                rzhdialog(ngDialog,"未选择数据","success");
            }else{
                window.location.href = "#/fum/index/add/"+$scope.checked[0]+"/"+d;
            }
        }else{
            window.location.href = "#/fum/index/add/"+$scope.checked[0]+"/"+d;
        }
    };
    $scope.deldata = function () {
        $http({
            url: zyghOAURL + 'delFum.action',
            method: 'GET',
            params: {
                fumIds:$scope.checked
            }
        }).success(function (response) { //提交成功
            if(response=="1"){
                $scope.houseInspectionInfo(selHouseCode,selHouseName);
                rzhdialog(ngDialog,"操作成功","success");
            }else{
                rzhdialog(ngDialog,"操作失败","error");
            }
        }).error(function (response) { //提交失败
            rzhdialog(ngDialog,"操作失败","error");
        });
    };
    $scope.xqxunzheng = function (d) {
        $scope.checked[0] = d;
        $scope.addupdata(4);
    };

    $scope.stxunzheng = function (d) {
        if($scope.checked[0]==undefined){
            rzhdialog(ngDialog,"操作失败","error");
        }else{
            $http({
                url: zyghOAURL + 'updFum.action',
                method: 'GET',
                params: {
                    fumId:$scope.checked[0],
                    fumStatus:d
                }
            }).success(function (response) { //提交成功
                $scope.houseInspectionInfo(selHouseCode,selHouseName);
                rzhdialog(ngDialog, "提交申请完成", "success");
                window.location.href = "#/fum/index";
            }).error(function (response) { //提交失败
                rzhdialog(ngDialog,"操作失败","error");
            });
        }
    };
    // //提交熏蒸申请
    // $scope.fumApply = function () {
    //     rzhdialog(ngDialog, "提交申请完成", "success");
    // }
}]);
//添加信息
App.controller("addfumController", function ($scope, $http, $stateParams,ngDialog) {
    $scope.plan = {};
    $scope.planyj = {};
    $scope.ypadd = false;
    $scope.ypxqa = true;
    if($stateParams.idb=="3"){
        $scope.ypadd = true;
    }
    if($stateParams.idb=="4"){
        $scope.ypadd = true;
        $scope.ypxqa = false;
    }
    if($stateParams.idb!="1"){
        $http({
            url: zyghOAURL + 'selectFumByNum.action',
            method: 'GET',
            params: {
                fumId:$stateParams.id
            }
        }).success(function (response) { //提交成功
            $scope.plan = response;
            if($stateParams.idb=="4"){
                $http({
                    url: zyghOAURL + 'findTon.action',
                    method: 'GET',
                    params: {
                        fumOrderNum:$scope.plan.fumOrderNum
                    }
                }).success(function (response) { //提交成功
                      $scope.planyj = response[response.length-1];
                }).error(function (response) { //提交失败
                    rzhdialog(ngDialog,"操作失败","error");
                });
            };
        }).error(function (response) { //提交失败
            rzhdialog(ngDialog,"操作失败","error");
        });
    };
    $.ajax({ //获取仓房信息
        url: '/la/house/tree',
        method: 'POST',
        async: false
    }).success(function (result) {
        if (result.success) {
            $scope.housealist = result.data;
        };
    });
    $('#pytime,#startime,#endtime').datetimepicker({ //加载日期插件
        todayBtn:  1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        minView: 1, //最小显示单位  2 代表到天
        todayHighlight: 1 //今天日期高亮
    });

    //点击仓房，加载信息
    $scope.houseInspectionInfo = function (code, name) {
        selHouseCode = code;
        $scope.statescode = code;
        selHouseName = name;
        $("#houseName").html("- " + name); //设置选中的当前仓房名
        $scope.findxz();
    };
    $scope.addfum = function () {
        var aurl = "";
        var pardata = {};
        if($stateParams.idb=="3"){
            pardata = $scope.planyj;
            pardata.fumOrderNum = $scope.plan.fumOrderNum;
            aurl = 'addTon.action';
        }else if($stateParams.idb=="2"){
            aurl = 'updFum.action';
            pardata = $scope.plan;
        }else{
            aurl = 'addFum.action';
            pardata = $scope.plan;
        };
        angular.forEach($scope.housealist,function (d,i) {
            if(d.code==$scope.plan.housecode){
                $scope.plan.housename = d.label;
            }
        });
        $http({
            url: zyghOAURL + aurl,
            method: 'GET',
            params: pardata
        }).success(function (response) { //提交成功
            $scope.houseInspectionInfo(selHouseCode,selHouseName);
            rzhdialog(ngDialog, "提交申请完成", "success");
            window.location.href = "#/fum/index";
        }).error(function (response) { //提交失败
            rzhdialog(ngDialog,"操作失败","error");
        });
    };
    $scope.toRemove = function () {
        window.location.href = "#/fum/index";
    }
});