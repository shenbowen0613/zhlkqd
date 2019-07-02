App.controller('FumigationJsController', ['$scope', '$http', 'ngDialog', '$rootScope', function ($scope, $http, ngDialog, $rootScope) {
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
    $scope.buttontoview = function (data) {
        window.location.href = "#/zjjc/Fumigation/view/" + data.housecode + "/" + data.housename;
    };
    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/zjjc/Fumigation";
    }
}]);
// 查看详情
App.controller('FumigationViewController', ['$scope', '$http', 'ngDialog','$rootScope','$stateParams', function ($scope, $http, ngDialog,$rootScope,$stateParams) {
    $scope.houstname = $stateParams.name;
    var selHouseCode = $stateParams.id;
    $scope.pestInspection = function(){
        //重绘图表
        $scope.opt_title = "虫害";
        $scope.opt_legend = ['虫害', '主要虫害'];
        var pData = {
            code: selHouseCode,
            pageSize:10
        };
        $.ajax({ //首次进入，获取温度信息
            url: '/grain/inspectionPest',
            method: 'POST',
            data: pData,
            async: false
        }).success(function (result) {
            if (result.success && result.data.aaData.length>0) {
                var axisObj = [];
                var dataObj1 = [];
                var dataObj2 = [];
                angular.forEach(result.data.aaData, function (data) {
                    axisObj.push(data.checktime.substr(8, 2) + ":" + data.checktime.substr(10, 2));
                    dataObj1.push(data.pestdensity);
                    dataObj2.push(data.mainpestdensity);
                });
                $scope.opt_xAxis = axisObj;
                $scope.data1 = dataObj1;
                $scope.data2 = dataObj2;
            }
        });
        $scope.pest_option = {
            backgroundColor: '#E0EEE0',//背景色
            title: {
                text: $scope.opt_title
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params, ticket, callback) {

                    var res;
                    if (typeof(params[0]) == "undefined") {
                        res = params.name + "<br/>" + params.seriesName + " : " + params.data.value + " 头/公斤"
                    } else {
                        res = params[0].name;
                        for (var i = 0, l = params.length; i < l; i++) {
                            res += '<br/>' + params[i].seriesName + ' : ' + params[i].value + " 头/公斤";
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
                    formatter: '{value}'
                }
            },
            series: [
                {
                    name: $scope.opt_legend[0],
                    type: 'line',
                    barWidth: 10,
                    data: $scope.data1,
                    formatter: '{a} 头/公斤',
                    //itemStyle:{
                    //    normal:{
                    //        color:'#ADADAD',
                    //        lineStyle:{
                    //            color:'#ADADAD'
                    //        }
                    //    }
                    //}
                }
                ,
                {
                    name: $scope.opt_legend[1],
                    type: 'line',
                    barWidth: 10,
                    data: $scope.data2,
                    //itemStyle:{
                    //    normal:{
                    //        color:'#ADADAD',
                    //        lineStyle:{
                    //            color:'#ADADAD'
                    //        }
                    //    }
                    //}
                }
            ]
        }; //图表数据
    }
    $scope.pestInspection();
}]);