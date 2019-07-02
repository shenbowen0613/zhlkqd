App.controller('QualitybJsController', ['$scope', '$http', 'ngDialog', '$rootScope', function ($scope, $http, ngDialog, $rootScope) {
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


    //质量检测图表
    $scope.toTempCharts = function (curStorey) {
        var title_list = ['容量', '水分', '杂质', '不完善粒', '面筋吸水盘'];
        var color_list = ['#6ad382', '#d3c36f', '#d37498', '#7fc1d3', '#b688d3'];
        $scope.data1= [
            [{value:50, name:''},{value:50, name:'容量'}],
            [{value:50, name:''},{value:50, name:'水分'}],
            [{value:50, name:''},{value:50, name:'杂质'}],
            [{value:50, name:''},{value:50, name:'不完善粒'}],
            [{value:50, name:''},{value:50, name:'面筋吸水盘'}]
        ];
        var Yaxis = [0, 1, 2, 3, 4];
        var pData = {
            code: $scope.housecode,
            checkkind: 2,
            storey: curStorey,
            pageSize: 4,
        };
        var charts_option = {
            color:["#d4d4d4",color_list[curStorey]],
            title: {
                text: title_list[curStorey]
            },
            tooltip : {
                trigger: 'item'
            },
            legend: {
                data: ['',title_list[curStorey]]
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
            series: [
                {
                    name: "占比",
                    type: 'pie',
                    data: $scope.data1[curStorey]
                }
            ]
        };
        if (curStorey == 0) {
            $scope.temp_one_option = charts_option;
        } else if (curStorey == 1) {
            $scope.temp_two_option = charts_option;
        } else if (curStorey == 2) {
            $scope.temp_three_option = charts_option;
        } else if (curStorey == 3) {
            $scope.temp_four_option = charts_option;
        } else if (curStorey == 4) {
            $scope.temp_Five_option = charts_option;
        }
    };

    for (var s = 0; s <= 4; s++) {
        $scope.toTempCharts(s);
    }
}]);
