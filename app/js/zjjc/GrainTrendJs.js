App.controller('GrainTrendJsController', ['$scope', '$http', 'ngDialog', '$rootScope', function ($scope, $http, ngDialog, $rootScope) {
    $scope.housecode = "06b4b29841b5484190a23f33760d0c3a";
    $scope.startimeOpen = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.startimeIsOpen = true;
    };
    $http({
        url: GserverURL+ '/la/house/list',
        method: 'POST'
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            if(response.data!=null){
                $scope.house = response.data.aaData;
            }
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    });

    $scope.tempInspection = function(){ //温度图表
        $scope.opta_title = "温度";
        $scope.opta_legend = ['仓内温', '仓外温', '平均温', '最低温', '最高温'];
        var pData = {
            code: $scope.housecode,
            pageSize:10
        };
        $.ajax({ //首次进入，获取温度信息
            url: '/grain/inspectionTemp',
            method: 'POST',
            data: pData,
            async: false
        }).success(function (result) {
            if (result.success && result.data.aaData.length>0) {
                var axisObj = [];
                var dataObj1 = [];
                var dataObj2 = [];
                var dataObj3 = [];
                var dataObj4 = [];
                var dataObj5 = [];
                angular.forEach(result.data.aaData, function (data) {
                    axisObj.push(data.checktime.substr(8, 2) + ":" + data.checktime.substr(10, 2));
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
        $scope.charts_option = {
            backgroundColor: '#EEE5DE',//背景色
            title: {
                text: $scope.opta_title
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
                data: $scope.opta_legend
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
                    name: $scope.opta_legend[0],
                    type: 'line',
                    data: $scope.data1,
                    itemStyle:{
                        normal:{
                            color:'#707038',
                            lineStyle:{
                                color:'#707038'
                            }
                        }
                    }
                }
                ,
                {
                    name: $scope.opta_legend[1],
                    type: 'line',
                    data: $scope.data2,
                    itemStyle:{
                        normal:{
                            color:'#3D7878',
                            lineStyle:{
                                color:'#3D7878'
                            }
                        }
                    }
                },
                {
                    name: $scope.opta_legend[2],
                    type: 'line',
                    data: $scope.data3,
                    itemStyle:{
                        normal:{
                            color:'#01814A',
                            lineStyle:{
                                color:'#01814A'
                            }
                        }
                    }
                },
                {
                    name: $scope.opta_legend[3],
                    type: 'line',
                    data: $scope.data4,
                    itemStyle:{
                        normal:{
                            color:'#796400',
                            lineStyle:{
                                color:'#796400'
                            }
                        }
                    }
                },
                {
                    name: $scope.opta_legend[4],
                    type: 'line',
                    data: $scope.data5,
                    itemStyle:{
                        normal:{
                            color:'#003D79',
                            lineStyle:{
                                color:'#003D79'
                            }
                        }
                    }
                }
            ]
        }; //图表数据
    }
    $scope.tempInspection();

    //四层温
    $scope.toTempCharts = function (curStorey) {
        var Xaxis = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        var Yaxis = [0, 1, 2, 3, 4];
        var pData = {
            code: $scope.housecode,
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
    };

    for (var s = 1; s <= 4; s++) {
        $scope.toTempCharts(s);
    }
    //四层温end
}]);
