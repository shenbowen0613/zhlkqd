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
App.controller('aircondBarController', ['$scope', '$http', 'ngDialog', function ($scope, $http, ngDialog) {
    $scope.menus = menuItems;
}]);
App.controller('aircondController', ['$scope', '$http', 'ngDialog','$rootScope', function ($scope, $http, ngDialog,$rootScope) {
    $rootScope.app.navbarTitle = "智能气调系统"; //设置头部提示信息
    $.ajax({
        url: '/la/house/tree',
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
    // $http({ //当前仓房详细信息
    //     url: '/la/house/load',
    //     method: 'POST',
    //     data:{housecode: selHouseCode}
    // }).success(function (result) {
    //     if (result.success) {
    //         $scope.houseInfo = result.data;
    //     }
    // });

    $scope.opt_title = "气体浓度检测";
    $scope.opt_legend = ['磷化氢', '氮气', '氧气', '二氧化碳'];
    $scope.toInspection = function(){
        var pData = {code: selHouseCode};
        $.ajax({
            url: '/grain/inspectionGas',
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
                angular.forEach(result.data, function (data) {
                    axisObj.push(data.checktime);
                    dataObj1.push(data.phosphineconcentration);
                    dataObj2.push(data.nitrogenconcentration);
                    dataObj3.push(data.oxygenconcentration);
                    dataObj4.push(data.co2concentration);
                });
                $scope.opt_xAxis = axisObj;
                $scope.data1 = dataObj1;
                $scope.data2 = dataObj2;
                $scope.data3 = dataObj3;
                $scope.data4 = dataObj4;
                $scope.charts_option = {
                    backgroundColor: '#EEE9E9',//背景色
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
                            formatter: '{value} ppm'
                        }
                    },
                    series: [
                        {
                            name: $scope.opt_legend[0],
                            type: 'line',
                            data: $scope.data1,
                            formatter: '{a} ppm',
                            stack: '总量',
                            areaStyle: {normal: {}},
                            itemStyle:{
                                normal:{
                                    color:'#E1C4C4',
                                    lineStyle:{
                                        color:'#E1C4C4'
                                    }
                                }
                            }
                        }
                        ,
                        {
                            name: $scope.opt_legend[1],
                            type: 'line',
                            data: $scope.data2,
                            stack: '总量',
                            areaStyle: {normal: {}},
                            itemStyle:{
                                normal:{
                                    color:'#A6A6D2',
                                    lineStyle:{
                                        color:'#A6A6D2'
                                    }
                                }
                            }
                        },
                        {
                            name: $scope.opt_legend[2],
                            type: 'line',
                            data: $scope.data3,
                            stack: '总量',
                            areaStyle: {normal: {}},
                            itemStyle:{
                                normal:{
                                    color:'#81C0C0',
                                    lineStyle:{
                                        color:'#81C0C0'
                                    }
                                }
                            }
                        },
                        {
                            name: $scope.opt_legend[3],
                            type: 'line',
                            data: $scope.data4,
                            stack: '总量',
                            areaStyle: {normal: {}},
                            itemStyle:{
                                normal:{
                                    color:'#B9B973',
                                    lineStyle:{
                                        color:'#B9B973'
                                    }
                                }
                            }
                        }
                    ]
                }; //图表数据
            }
        });
    }
    $scope.toInspection();

    //点击仓房，加载信息
    $scope.houseInspectionInfo = function (code, name,$event) {
        $("#all_house > button").removeClass("btn-primary"); //剔除其他选中样式
        $($event.target).addClass("btn-primary"); //添加样式
        selHouseCode = code;
        selHouseName = selHouseCode;
        $("#houseName").html("- " + name); //设置选中的当前仓房名
        // $http({ //当前仓房详细信息
        //     url: '/la/house/load',
        //     method: 'POST',
        //     data:{housecode: selHouseCode}
        // }).success(function (result) {
        //     if (result.success) {
        //         $scope.houseInfo = result.data;
        //     }
        // });
        $scope.toInspection();
    }

    //获取气调后数据
    $scope.getaircondOverInfo = function(){
        rzhdialog(ngDialog,"数据获取成功","success");
    }

    //提交气调申请
    $scope.aircondApply = function(){
        rzhdialog(ngDialog,"提交申请完成","success");
    }

    //更多气调方式
    $scope.moreaircondType = function(){
        window.location.href = "#/aircond/case/"+selHouseCode+"/"+selHouseName;
    }
}]);
