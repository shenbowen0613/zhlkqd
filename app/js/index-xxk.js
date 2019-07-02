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
    //获取气象数据

    $http({
        url: OilmonURL + '/Detection/selectWd',
        method: 'GET'
    }).success(function (data) {
        //响应成功
        if(data!=""&&data!=null&&data!=[]){
            $scope.weather = data;
            $scope.weather.typea = true;
        }else{
            $scope.weather = {};
            $scope.weather.typea = false;
        }
    }).error(function () {
        //处理响应失败
    });

}]);

//首页信息处理
function setDivHeight(sideleft, sideright) {
    var a = document.getElementById(sideleft);
    var b = document.getElementById(sideright);
    if (a == null || b == null) return;
    if (a.clientHeight < b.clientHeight) {
        a.style.height = b.clientHeight + "px";
    } else {
        b.style.height = a.clientHeight + "px";
    }
}

function studyShowModalDialog(id) {
    if (id === '01') {
        window.showModalDialog("", "", "dialogHeight=800%;dialogWidth=1200%;");
    } else if (id === '02') {
        window.showModalDialog("", "",
            "dialogHeight=800%;dialogWidth=1200%;");
    } else if (id === '3d') {
        window.showModalDialog("", "",
            "dialogHeight=1100%;dialogWidth=2000%;");
    } else if (id === 'OA') {
        window.showModalDialog("", "", "dialogHeight=1100%;dialogWidth=2000%;");
    } else {
        window.showModalDialog("", "", "dialogHeight=800%;dialogWidth=1200%;");
    }
}

function myrefresh() {
    setTimeout('TimingQuery()', 150000);
}
setTimeout('TimingQuery()', 300000); //指定1秒刷新一次

function show(obj, id, i) {
    jqueryAjax(i);
    var objDiv = $("#" + id + "");
    $(objDiv).css("display", "block");
    $(objDiv).css("left", event.clientX);
    $(objDiv).css("top", event.clientY + 10);
}
function jqueryAjax(i) {
    //var user = {
    //    "name": i
    //};
    /*  user.name=i; */
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
function TimingQuery() {
    //var user = {
    //    "name": ""
    //};
    //$.ajax({
    //    url: "TestServlet?action=query",
    //    data: "name=" + user.name,
    //    datatype: "json",//请求页面返回的数据类型
    //    type: "get",
    //    contentType: "application/json",//注意请求页面的contentType 要于此处保持一致
    //    success: function (data) {//这里的data是由请求页面返回的数据
    //        var dataJson = JSON.parse(data); // 使用json2.js中的parse方法将data转换成json格式
    //        if (dataJson.name === null) {
    //            for (var i = 0; i <= 18; i++) {
    //                $("#green" + i).show();
    //                $("#red" + i).hide();
    //            }
    //        } else {
    //            var top = $("#green" + dataJson.name).css("top");
    //            var left = $("#green" + dataJson.name).css("left");
    //            $("#green" + dataJson.name).hide();
    //            $("#red" + dataJson.name).css("top", "" + top + "");
    //            $("#red" + dataJson.name).css("left", "" + left + "");
    //            $("#red" + dataJson.name).show();
    //        }
    //    },
    //    error: function (XMLHttpRequest, textStatus, errorThrown) {
    //        alert(error);
    //    }
    //});
    //setTimeout('myrefresh()', 150000);
}
function hide(obj, id) {
    var objDiv = $("#" + id + "");
    $(objDiv).css("display", "none");
}
