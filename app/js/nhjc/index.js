App.controller('nhjcindexController', ['$scope', '$http', 'ngDialog', '$rootScope', function ($scope, $http, ngDialog, $rootScope) {
    $rootScope.app.navbarTitle = "能耗监测首页"; //设置头部提示信息

    /*查询全部数据*/
    $http({
        method: 'GET',
        url: OilmonURL + '/selectData',
    }).success(function(response) {
        $scope.allData = response;
    });
    $scope.buttontoview = function (data) {
        window.location.href = "#/nhjc/index/view/" + data;
    }
    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/nhjc/index";
    }
}]);
// 查看详情
App.controller('nhjcViewController', ['$scope', '$http', 'ngDialog','$rootScope','$stateParams', function ($scope, $http, ngDialog,$rootScope,$stateParams) {
    $scope.houstcode = $stateParams.id;
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
    $scope.wnduchaxun = function (datax) {
        $http({
            method: 'GET',
            url: OilmonURL + '/select',
            params: {
                housecode: $scope.houstcode,
                pageNum:datax,
                pageSize:8
            }
        }).success(function(response) {
            $scope.items = response;
        });
    };
    $scope.wnduchaxun(1);
    $scope.collectionInfo = function () {
        $("#box").show();
        $http({
            method: 'GET',
            url: OilmonURL + '/va',
            params: {
                houseid: $scope.houstcode
            }
        }).success(function(response) {
            $("#box").hide();
            rzhdialog(ngDialog,"采集成功","success");
            $scope.wnduchaxun();
        }).error(function () {
            $("#box").hide();
            //处理响应失败
            rzhdialog(ngDialog,"采集失败","error");
        });
    };
    $scope.toDateSerach = function () {
        $("#box2").show();
        $http({
            method: 'GET',
            url: OilmonURL + '/selectweek',
            params: {
                housecode: $scope.houstcode,
                kaishitime:$scope.starttime,
                jieshutime:$scope.endtime
            }
        }).success(function(response) {
            //response.save('content.pdf');
            //console.log(response);
            try {
                window.open(response.pdf);
                $("#box2").hide();
                rzhdialog(ngDialog,"导出成功","success");
            }catch (err){
                $("#box2").hide();
                rzhdialog(ngDialog,"导出失败","error");
            }
            // $scope.wnduchaxun();
        }).error(function () {
            $("#box2").hide();
            //处理响应失败
            rzhdialog(ngDialog,"导出失败","error");
        });
    }
}]);