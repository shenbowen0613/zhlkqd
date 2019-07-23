App.controller('indexPageController', ['$scope', '$http', '$state','$rootScope', function ($scope, $http, $state,$rootScope) {
    $rootScope.app.navbarTitle = "首页";
    menuItems=indexMenuItems;
    $scope.items = menuItems;

    $scope.standardsList = function(){
        $.ajax({
            type: "POST",
            url: 'sys/dict/map',
            dataType: 'json',
            data: {"typecode":"grainstandards_wendu"}, //以json格式传递
            async: false,
            "success": function (resp) {
                if(resp.data!=null) {
                    //标准最低温
                    $scope.temp_l = resp.data.temp_l;
                    //标准最高温
                    $scope.temp_h = resp.data.temp_h;
                }
            }
        });
    }
    $scope.standardsList();
    $scope.cangfangjibenxinxi = function(){
        $.ajax({
            type: "GET",
            url: '/system/laGrainInspection/indexGrain',
            dataType: 'json',
            async: true,
            "success": function (resp) {
                console.log(resp);
                if(resp.success){
                    $scope.itemscangfang = resp.data;
                }else{
                    console.log(resp.info);
                }
            }
        });
    }
    $scope.cangfangjibenxinxi();


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
        url: OilmonURL + '/selectWd',
        method: 'GET'
    }).success(function (data) {
        //响应成功
        if(data!=""&&data!=null&&data!=[]){
            $scope.weather = data;
			if(Number(data.yg)==0){
				$scope.weather.yg="无";
			}
            $scope.weather.typea = true;
        }else{
            $scope.weather = {};
            $scope.weather.typea = false;
        }
    }).error(function () {
        //处理响应失败
    });




     $scope.jqueryAjax =function(i,data) {
         $("#ch").html(Number(i)+"号仓");
         $("#avgt").html(data.avgt);
         $("#hight").html(data.hight);
         $("#innert").html(data.innert);
         $("#lowt").html(data.lowt);
         $("#outt").html(data.outt);
         $("#avgh").html(data.avgh);
         $("#highh").html(data.highh);
         $("#inh").html(data.inh);
         $("#lowh").html(data.lowh);
         $("#outh").html(data.outh);
         if(data.statuscode=="001"){
             $("#wendutishi").html(data.statusname);
             $("#tishi").attr("style","padding-top:4px");
         }else if(data.statuscode=="012"){
             $("#wendutishi").html(data.statusname);
             $("#tishi").attr("style","padding-top:4px;color: red;");
         }else if(data.innert*1>$scope.temp_h){
             //温度过高
             $("#wendutishi").html("温度过高↑↑");
             $("#tishi").attr("style","padding-top:4px;color: red;");
         }else if(data.innert*1<$scope.temp_l){
             //温度过低
             $("#wendutishi").html("温度过低↓↓");
             $("#tishi").attr("style","padding-top:4px;color: red;");
         }
        //var user = {
        //    "name": i
        //};
        /*  user.name=i; */
        // $.ajax({
        //     url: GserverURL+"/wxy",
        //     data: {
        //         housename:i+"仓"
        //     },
        //     success: function (resp) {//这里的data是由请求页面返回的数据
        //         if(resp.success){
        //             var data = resp.data;
        //             $("#ch").html(i+"号仓");
        //             $("#cr").html(data.granaryactualcapacity);
        //             $("#wendu").html(data.innert);
        //             if(data.innert*1>$scope.temp_h){
        //                 //温度过高
        //                 $("#wendutishi").html("温度过高↑↑");
        //                 $("#tishi").attr("style","padding-top:4px;color: red;");
        //             }else if(data.innert*1<$scope.temp_l){
        //                 //温度过低
        //                 $("#wendutishi").html("温度过低↓↓");
        //                 $("#tishi").attr("style","padding-top:4px;color: red;");
        //             }else{
        //                 $("#wendutishi").html("温度正常");
        //                 $("#tishi").attr("style","padding-top:4px");
        //             }
        //             $("#cs").html(data.inh);
        //             $("#dh").html(data.granarytel);
        //             $("#mz").html(data.operatorname);
        //         }
        //     },
        //     error: function () {
        //         $("#ch").html("null");
        //         $("#wendutishi").html("null");
        //         $("#cr").html("null");
        //         $("#wendu").html("null");
        //         $("#cs").html("null");
        //         $("#dh").html("null");
        //         $("#mz").html("null");
        //     }
        // });

    }

    $scope.show=function(obj, id, i) {
         var houname = Number(i)+ "仓";
         var cnf={avgt:"",hight:"",innert:"",lowt:"",outt:"",avgh:"",highh:"",inh:"",lowh:"",outh:"",statuscode:"012",statusname:"无数据"};
         angular.forEach($scope.itemscangfang,function (d,i) {
             if(d.housename == houname){
                 cnf = d
             }
         });
        $scope.jqueryAjax(i,cnf);
        var objDiv = $("#" + id + "");
        $(objDiv).css("display", "block");
        $(objDiv).css("left", event.clientX);
        $(objDiv).css("top", event.clientY + 10);
    };

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
