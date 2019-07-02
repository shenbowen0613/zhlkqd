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
App.controller('fumBarController', ['$scope', '$http', 'ngDialog', function ($scope, $http, ngDialog) {
    $scope.menus = menuItems;
}]);
App.controller('fumController', ['$scope', '$http', 'ngDialog', '$rootScope', function ($scope, $http, ngDialog, $rootScope) {
    $rootScope.app.navbarTitle = "智能熏蒸系统"; //设置头部提示信息
    $.ajax({ //获取仓房信息
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
    $http({ //当前仓房详细信息
        url: '/la/house/load',
        method: 'POST',
        data: {housecode: selHouseCode}
    }).success(function (result) {
        if (result.success) {
            $scope.houseInfo = result.data;
        }
    });

    $scope.toInspection = function () {
        $scope.opt_title = "虫害检测";
        $scope.opt_legend = ['虫害', '主要虫害'];
        var pData = {
            code: selHouseCode,
            pageSize: 10
        };
        $.ajax({ //首次进入，获取温度信息
            url: '/grain/inspectionPest',
            method: 'POST',
            async: false,
            data: pData
        }).success(function (result) {
            if (result.success) {
                var axisObj = [];
                var dataObj1 = [];
                var dataObj2 = [];
                angular.forEach(result.data, function (data) {
                    axisObj.push(data.checktime);
                    dataObj1.push(data.pestdensity);
                    dataObj2.push(data.mainpestdensity);
                });
                $scope.opt_xAxis = axisObj;
                $scope.data1 = dataObj1;
                $scope.data2 = dataObj2;
            }
        });
        $scope.charts_option = {
            backgroundColor: '#fff',//背景色
            title: {
                text: $scope.opt_title
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params, ticket, callback) {

                    var res;
                    if (typeof(params[0]) == "undefined") {
                        res = params.name + "<br/>" + params.seriesName + " : " + params.data.value + "头/公斤"
                    } else {
                        res = params[0].name;
                        for (var i = 0, l = params.length; i < l; i++) {
                            res += '<br/>' + params[i].seriesName + ' : ' + params[i].value + "头/公斤";
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
                    formatter: '{value} 头'
                }
            },
            series: [
                {
                    name: $scope.opt_legend[0],
                    type: 'line',
                    barWidth: 10,
                    data: $scope.data1,
                    formatter: '{a} 头/公斤'
                }
                ,
                {
                    name: $scope.opt_legend[1],
                    type: 'line',
                    barWidth: 10,
                    data: $scope.data2
                }
            ]
        }; //图表数据
    }
    $scope.toInspection();

    $scope.toTempCharts = function (curStorey) {
        var Xaxis = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        var Yaxis = [0, 1, 2, 3, 4];
        var pData = {
            code: selHouseCode,
            checkkind: 2,
            storey: curStorey,
            pageSize: 4,
        };
        $.ajax({ //首次进入，获取多层粮情信息
            url: '/grain/inspectionMultiStorey',
            method: 'POST',
            async: false,
            data: pData
        }).success(function (result) {
            if (result.success) {
                var datas=result.data;
                $scope.alldata=result.data;
                var datas = [];
                for (var idx in $scope.alldata) {
                    var data=$scope.alldata[idx];
                    var datalittle = [];
                    datalittle.push(1);
                    datalittle.push(data.yaxis);
                    datalittle.push(data.xaxis1);
                    datas.push(datalittle);

                    datalittle = [];
                    datalittle.push(2);
                    datalittle.push(data.yaxis);
                    datalittle.push(data.xaxis2);
                    datas.push(datalittle);

                    datalittle = [];
                    datalittle.push(3);
                    datalittle.push(data.yaxis);
                    datalittle.push(data.xaxis3);
                    datas.push(datalittle);

                    datalittle = [];
                    datalittle.push(4);
                    datalittle.push(data.yaxis);
                    datalittle.push(data.xaxis4);
                    datas.push(datalittle);

                    datalittle = [];
                    datalittle.push(5);
                    datalittle.push(data.yaxis);
                    datalittle.push(data.xaxis5);
                    datas.push(datalittle);

                    datalittle = [];
                    datalittle.push(6);
                    datalittle.push(data.yaxis);
                    datalittle.push(data.xaxis6);
                    datas.push(datalittle);

                    datalittle = [];
                    datalittle.push(7);
                    datalittle.push(data.yaxis);
                    datalittle.push(data.xaxis7);
                    datas.push(datalittle);

                    datalittle = [];
                    datalittle.push(8);
                    datalittle.push(data.yaxis);
                    datalittle.push(data.xaxis8);
                    datas.push(datalittle);

                    datalittle = [];
                    datalittle.push(9);
                    datalittle.push(data.yaxis);
                    datalittle.push(data.xaxis9);
                    datas.push(datalittle);

                    datalittle = [];
                    datalittle.push(10);
                    datalittle.push(data.yaxis);
                    datalittle.push(data.xaxis10);
                    datas.push(datalittle);
                }
                if (curStorey == 1) {
                    layerText = "粮堆 - 一层温度";
                } else if (curStorey == 2) {
                    layerText = "粮堆 - 二层温度";
                } else if (curStorey == 3) {
                    layerText = "粮堆 - 三层温度";
                } else if (curStorey == 4) {
                    layerText = "粮堆 - 四层温度";
                }
                $scope.temp_option = {
                    backgroundColor: '#fff',//背景色
                    title: {
                        textStyle: {
                            fontSize: 15
                        },
                        padding: [0, 8],
                        top: '10',
                        text: layerText
                    },
                    tooltip: {
                        position: 'top',
                        formatter: function (params, ticket, callback) {
                            ;
                            var res;
                            res = params.seriesName + "<br/>" + "坐标（" + params.data[0] + "," + params.data[1] + "） : " + params.data[2] + "°C";
                            setTimeout(function () {
                                callback(ticket, res);
                            }, 100)
                            return 'loading';
                        }
                    },
                    grid: {
                        top: '40',
                        left: '25',
                        height: '65%',
                        width: '85%'
                    },
                    animation: false,
                    xAxis: {
                        type: 'category',
                        data: Xaxis,
                        splitArea: {
                            show: true
                        }
                    },
                    yAxis: {
                        type: 'category',
                        data: Yaxis,
                        splitArea: {
                            show: true
                        }
                    },
                    visualMap: {
                        min: 10,
                        max: 50,
                        show: false,
                        calculable: true,
                        realtime: false,
                        inRange: {
                            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                        }
                    },
                    series: [{
                        name: '温度',
                        type: 'heatmap',
                        data: datas,
                        //label: {
                        //    normal: {
                        //        show: true
                        //    }
                        //},
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }]
                };
                if (curStorey == 1) {
                    $scope.temp_one_option = $scope.temp_option;
                } else if (curStorey == 2) {
                    $scope.temp_two_option = $scope.temp_option;
                } else if (curStorey == 3) {
                    $scope.temp_three_option = $scope.temp_option;
                } else if (curStorey == 4) {
                    $scope.temp_four_option = $scope.temp_option;
                }
            }
        });


    }

    for (var s = 1; s <= 4; s++) {
        $scope.toTempCharts(s);
    }

    //点击仓房，加载信息
    $scope.houseInspectionInfo = function (code, name, $event) {
        $("#all_house > button").removeClass("btn-primary"); //剔除其他选中样式
        $($event.target).addClass("btn-primary"); //添加样式
        selHouseCode = code;
        selHouseName = selHouseCode;
        $("#houseName").html("- " + name); //设置选中的当前仓房名
        $http({ //当前仓房详细信息
            url: '/la/house/load',
            method: 'POST',
            data: {housecode: selHouseCode}
        }).success(function (result) {
            if (result.success) {
                $scope.houseInfo = result.data;
            }
        });
        $scope.toInspection();
        for (var i = 1; i <= 4; i++) {
            $scope.toTempCharts(i);
        }
    }

    //提交熏蒸申请
    $scope.fumApply = function () {
        rzhdialog(ngDialog, "提交申请完成", "success");
    }

    //更多熏蒸方式
    $scope.morefumType = function () {
        window.location.href = "#/fum/case/" + selHouseCode + "/" + selHouseName;
    }
}]);
