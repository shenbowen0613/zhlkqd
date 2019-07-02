App.controller('indexPageController', ['$scope', '$http', '$state','$rootScope', function ($scope, $http, $state,$rootScope) {
    $rootScope.app.navbarTitle = "首页";
    menuItems=indexMenuItems;
    $scope.items = menuItems;
    //进入子模块
    $scope.getMod = function (code, uri) {
        var pData = {id: code};
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        footerMenuUrl = uri;
        $http({
            url: GserverURL+'/sys/user/queryMenus',
            method: 'POST',
            data: pData
        }).success(function (result) {
            if (result.success) {
                var menu = result.data;
                if (menu != null && menu != "") menuItems = JSON.parse(menu);
                $state.go(uri);
            } else {
                alert("跳转失败！");
            }
        }).error(function (result) { //提交失败
                alert("跳转失败！");
            }
        );
    };
    //$scope.getMod("d978747eefab4bc49ef7745bc7b18bbf","grain.index");  //TODO 暂时先进入粮情检测首页
    //退出当前登录
    $scope.to_mgt = function () {
        window.open(baseInfo.getInfo("mgtHref"));
    }
    //退出当前登录
    $scope.logout = function () {
        $http({
            url: GserverURL+'/exit',
            method: 'GET'
        }).success(function (data) {
            //响应成功
            if (data.success) {
                window.location.href = "#/page/login"; //进入登录页面
            } else {
                alert("请刷新页面，重新登陆！");
            }
        }).error(function () {
            //处理响应失败
            alert("请刷新页面，重新登陆！");
        });
    }

}]);

function studyShowModalDialog(id) {
}

function show(obj, id, i) {
    jqueryAjax(i);
    var objDiv = $("#" + id + "");
    $(objDiv).css("display", "block");
    $(objDiv).css("left", event.clientX);
    $(objDiv).css("top", event.clientY + 10);
}
function jqueryAjax(i) {
    $.ajax({
       url: GserverURL+"/wxy",
       data: {
           housename:i+"号仓"
       },
       success: function (resp) {//这里的data是由请求页面返回的数据
           if(resp.success){
               var data = resp.data;
               $("#ch").html(i+"号仓");
               $("#cr").html(data.granaryactualcapacity);
               $("#wendu").html(data.innert);
               $("#cs").html(data.inh);
               $("#dh").html(data.granarytel);
               $("#mz").html(data.operatorname);
           }
       },
       error: function () {
           $("#ch").html("null");
           $("#cr").html("null");
           $("#wendu").html("null");
           $("#cs").html("null");
           $("#dh").html("null");
           $("#mz").html("null");
       }
    });
}
function hide(obj, id) {
    var objDiv = $("#" + id + "");
    $(objDiv).css("display", "none");
}
