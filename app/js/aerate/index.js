/*
 * Copyright (c) 2016. .保留所有权利.
 *                       
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
var selHouseCode;
var selHouseName;
var inspectionType = "temp";
var table;
App.controller('aerateBarController', ['$scope', '$http', 'ngDialog', function ($scope, $http, ngDialog) {
    $scope.menus = menuItems;
}]);
//温度控制器
App.controller('tempController', ['$scope', '$http', 'ngDialog', function ($scope, $http, ngDialog) {
    $scope.tempInspection();
}]);
//湿度控制器
App.controller('humrityController', ['$scope', '$http', 'ngDialog', function ($scope, $http, ngDialog) {
    $scope.humrityInspection();
}]);
App.controller('aerateController', ['$scope', '$http', 'ngDialog','$rootScope', function ($scope, $http, ngDialog,$rootScope) {
    $rootScope.app.navbarTitle = "智能通风系统"; //设置头部提示信息
    $scope.gridtableid = "aerateTableGrids"; //数据列表id

    $('#starttime').datetimepicker({ //加载日期插件
        todayBtn: 1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        minView: 2, //最小显示单位  2 代表到天
        todayHighlight: 1 //今天日期高亮
    });
    $('#endtime').datetimepicker({ //加载日期插件
        todayBtn: 1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        minView: 2, //最小显示单位  2 代表到天
        todayHighlight: 1 //今天日期高亮
    });

    $.ajax({
        url:  '/la/house/tree',
        method: 'POST',
        async: false
    }).success(function (result) {
        if (result.success) {
            $scope.houseItems = result.data;
            if ($scope.houseItems.length > 0) {
                selHouseCode = $scope.houseItems[0].code; //设置当前仓房编码
                selHouseName = $scope.houseItems[0].label;
                $("#houseName").html("- " + selHouseName); //设置选中的当前仓房名
            }
        }
    });
    // $http({
    //         url:  '/la/house/load',
    //     method: 'POST',
    //     data:{housecode: selHouseCode}
    // }).success(function (result) {
    //     if (result.success) {
    //         $scope.houseInfo = result.data;
    //     }
    // });
    //点击仓房，加载信息
    $scope.toDateSerach = function () {
        $scope.tempInspection();
        $scope.humrityInspection();
        // $('#' + $scope.gridtableid).DataTable().draw();
    };

    $scope.tempInspection = function(){ //温度图表
        $scope.opt_title = "温度";
        $scope.opt_legend = ['仓内温', '仓外温', '平均温', '最低温', '最高温'];
        var pData = {
            code: selHouseCode,
            starttime: $scope.starttime,
            endtime: $scope.endtime
        };
        $.ajax({
            url: '/grain/inspectionTempChars',
            method: 'POST',
            data: pData,
            async: false
        }).success(function (result) {
            if (result.success) {
                var axisObj = [];
                var dataObj1 = [];
                var dataObj2 = [];
                var dataObj3 = [];
                var dataObj4 = [];
                var dataObj5 = [];
                angular.forEach(result.data.aaData, function (data) {
                    axisObj.push(formatDate(data.checktime));
                    dataObj1.push(data.innert);
                    dataObj2.push(data.outt);
                    dataObj3.push(data.avgt);
                    dataObj4.push(data.lowt);
                    dataObj5.push(data.hight);
                });
                $scope.opt_xAxis = axisObj;
                $scope.data1 = dataObj1;
                $scope.data2 = dataObj2;
                $scope.data3 = dataObj3;
                $scope.data4 = dataObj4;
                $scope.data5 = dataObj5;
            }
        });
        $scope.temp_option = {
            backgroundColor: '#EEE5DE',//背景色
            title: {
                text: $scope.opt_title
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params, ticket, callback) {

                    var res;
                    if (typeof(params[0]) == "undefined") {
                        res = params.name + "<br/>" + params.seriesName + " : " + params.data.value + "°C"
                    } else {
                        res = params[0].name;
                        for (var i = 0, l = params.length; i < l; i++) {
                            res += '<br/>' + params[i].seriesName + ' : ' + params[i].value + "°C";
                        }
                    }
                    setTimeout(function () {
                        callback(ticket, res);
                    }, 100)
                    return 'loading';
                }
            },
            legend: {
                data: $scope.opt_legend
            },
            toolbox: {
                show: false,
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    dataView: {readOnly: false},
                    magicType: {type: ['line', 'bar']},
                    restore: {},
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: $scope.opt_xAxis
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} °C'
                }
            },
            series: [
                {
                    name: $scope.opt_legend[0],
                    type: 'line',
                    data: $scope.data1,
                    formatter: '{a} °C'
                }
                ,
                {
                    name: $scope.opt_legend[1],
                    type: 'line',
                    data: $scope.data2
                },
                {
                    name: $scope.opt_legend[2],
                    type: 'line',
                    data: $scope.data3
                },
                {
                    name: $scope.opt_legend[3],
                    type: 'line',
                    data: $scope.data4
                },
                {
                    name: $scope.opt_legend[4],
                    type: 'line',
                    data: $scope.data5
                }
            ]
        }; //图表数据
    }
    $scope.humrityInspection = function(){
        //重绘图表
        $scope.opt_title = "湿度";
        $scope.opt_legend = ['仓内湿', '仓外湿'];
        var pData = {
            code: selHouseCode,
            starttime: $scope.starttime,
            endtime: $scope.endtime
        };
        $.ajax({ //首次进入，获取温度信息
            url: GserverURL+'/grain/inspectionHumrityChars',
            method: 'POST',
            data: pData,
            async: false
        }).success(function (result) {
            if (result.success && result.data.aaData.length>0) {
                var axisObj1 = [];
                var dataObj11 = [];
                var dataObj21 = [];
                angular.forEach(result.data.aaData, function (data) {
                    axisObj1.push(formatDate(data.checktime));
                    dataObj11.push(data.inh);
                    dataObj21.push(data.outh);
                });
                $scope.opt_xAxis1 = axisObj1;
                $scope.data11 = dataObj11;
                $scope.data21 = dataObj21;

            }
        });
        $scope.humrity_option = {
            backgroundColor: '#D1EEEE',//背景色
            title: {
                text: $scope.opt_title
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params, ticket, callback) {

                    var res;
                    if (typeof(params[0]) == "undefined") {
                        res = params.name + "<br/>" + params.seriesName + " : " + params.data.value + "%"
                    } else {
                        res = params[0].name;
                        for (var i = 0, l = params.length; i < l; i++) {
                            res += '<br/>' + params[i].seriesName + ' : ' + params[i].value + "%";
                        }
                    }
                    setTimeout(function () {
                        callback(ticket, res);
                    }, 100)
                    return 'loading';
                }
            },
            legend: {
                data: $scope.opt_legend
            },
            toolbox: {
                show: false,
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    dataView: {readOnly: false},
                    magicType: {type: ['line', 'bar']},
                    restore: {},
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: $scope.opt_xAxis1
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} %'
                }
            },
            series: [
                {
                    name: $scope.opt_legend[0],
                    type: 'line',
                    data: $scope.data11,
                    formatter: '{a} %'
                }
                ,
                {
                    name: $scope.opt_legend[1],
                    type: 'line',
                    data: $scope.data21
                }

            ]
        }; //图表数据
    }

    //点击仓房，加载信息
    $scope.houseInspectionInfo = function (code, name, $event) {
        $("#all_house > button").removeClass("btn-primary"); //剔除其他选中样式
        $($event.target).addClass("btn-primary"); //添加样式
        selHouseCode = code;
        selHouseName = selHouseCode;
        $("#houseName").html("- " + name); //设置选中的当前仓房名
        // $http({
        //     url: '/la/house/load',
        //     method: 'POST',
        //     data:{housecode: selHouseCode}
        // }).success(function (result) {
        //     if (result.success) {
        //         $scope.houseInfo = result.data;
        //     }
        // });
        $scope.tempInspection();
        $scope.humrityInspection();
        $('#' + $scope.gridtableid).DataTable().draw();
    }

    //获取通风后数据
    $scope.getAerateOverInfo = function(){
        rzhdialog(ngDialog,"数据获取成功","success");
    }

    //提交通风申请
    $scope.aerateApply = function(){
        rzhdialog(ngDialog,"提交申请完成","success");
    }

    //更多通风方式
    $scope.moreAerateType = function(){
        window.location.href = "#/aerate/case/"+selHouseCode+"/"+selHouseName;
    }
    //开窗
    $scope.openWindow = function(){
        layer.open({
            type: 2,
            title: '开窗通风',
            shadeClose: true,
            shade: 0.8,
            area: ['60%', '60%'],
            content: "/app/views/aerate/openWindow.html"
        });
    }
}]);
