App.controller('GrainDataJsController', ['$scope', '$http', 'ngDialog', '$rootScope', function ($scope, $http, ngDialog, $rootScope) {
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
    })
    $scope.buttontoview = function (data) {
        window.location.href = "#/zjjc/GrainData/view/" + data.housecode + "/" + data.housename;
    }
    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/zjjc/GrainData";
    }
}]);
// 查看详情
App.controller('GrainDataViewController', ['$scope', '$http', 'ngDialog','$rootScope','$stateParams', function ($scope, $http, ngDialog,$rootScope,$stateParams) {
    $scope.houstname = $stateParams.name;
    var selHouseCode = $stateParams.id;
    $scope.tempInspection = function(){ //温度图表
        $scope.opt_title = "温度";
        $scope.opt_legend = ['仓内温', '仓外温', '平均温', '最低温', '最高温'];
        var pData = {
            code: selHouseCode,
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
                    name: $scope.opt_legend[1],
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
                    name: $scope.opt_legend[2],
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
                    name: $scope.opt_legend[3],
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
                    name: $scope.opt_legend[4],
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
}]);