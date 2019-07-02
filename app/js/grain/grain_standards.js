/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
var selHouseCode;
var selHouseName;
var startDate;
var endDate;
var table;
App.controller('grainStandardsBarController', ['$scope', function ($scope) {
    $scope.menus = menuItems;
}]);
var standards_type = "wendu";//测温 默认
App.controller('grainStandardsController', ['$scope', '$http', 'ngDialog', '$filter', function ($scope, $http, ngDialog, $filter) {
    //点击修改类型
    $scope.changeStandardsType = function (code, typename) {
        standards_type = code;
        $("[name='standardstypename']").html(typename);
        $scope.standardsList();
    }
    $scope.standardsList = function () {
        $.ajax({
            type: "POST",
            url: 'sys/dict/list',
            dataType: 'json',
            data: {"typecode": "grainstandards_" + standards_type}, //以json格式传递
            async: false,
            "success": function (resp) {
                if (resp.data != null) {
                    $scope.standards = resp.data;
                } else {
                    $scope.standards = null;
                }
            }
        });
    }
    $scope.standardsList();
}]);

App.controller('grainStandardsListController', ['$scope', '$http', 'ngDialog', '$filter', function ($scope, $http, ngDialog, $filter) {
    $scope.standardsList();
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var standardCodes = new Array();
        var standardRemarks = new Array();
        var flag = true;
        var highV = new Array();
        var lowV = new Array();
        var theIndex = 0;
        var highIndex = new Array();
        var lowIndex = new Array();
        var vIndex = 0;
        $("[name='standardCode']").each(function () {
            var curVal = $(this).val();
            if (curVal.indexOf("_h") > -1) {
                highIndex.push(theIndex);
            } else if (curVal.indexOf("_l") > -1) {
                lowIndex.push(theIndex);
            }
            theIndex++;
            standardCodes.push(curVal);
        })
        $("[name='standardRemark']").each(function () {
            var curV = $(this).val();
            for (var i = 0; i < highIndex.length; i++) {
                if (vIndex == highIndex[i]) {
                    highV.push(curV);
                }
            }
            for (var i = 0; i < lowIndex.length; i++) {
                if (vIndex == lowIndex[i]) {
                    lowV.push(curV);
                }
            }
            vIndex++;
            standardRemarks.push($(this).val());
        });
        for (var i = 0; i < highV.length; i++) {
            if (parseFloat(lowV[i]) >= parseFloat(highV[i])) {
                flag = false;
                rzhdialog(ngDialog, "最低值必须小于最高值", "error");
            }
        }
        if (flag) {
            var pData = {
                codes: JSON.stringify(standardCodes),
                remarks: JSON.stringify(standardRemarks)
            };
            $http({
                url: GserverURL + 'sys/dict/update',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    //$scope.standards = null;
                    rzhdialog(ngDialog, "更新成功", "success");
                    $scope.standardsList();
                } else { //信息处理失败，提示错误信息
                    rzhdialog(ngDialog, response.info, "error");
                }

            }).error(function (response) { //提交失败
                rzhdialog(ngDialog, "操作失败", "error");
            })
        }

    }


}]);
