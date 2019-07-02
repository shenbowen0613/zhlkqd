App.controller('cangneiController', ['$scope', '$http', 'ngDialog', '$rootScope', function ($scope, $http, ngDialog, $rootScope) {
    $.ajax({ //获取硬盘录像机
        url: GserverURL+"/camera/dvr/list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.dvrname = response.data.aaData;
        }else{
            alert("获取硬盘录像机失败！");
        }
    });
    var g_iWndIndex = 0; //可以不用设置这个变量，有窗口参数的接口中，不用传值，开发包会默认使用当前选择窗口
    var szIP = "",
        szPort = "",
        szUsername = "",
        szPassword = "";
    $scope.oSelname = [];//通道+名字
    // 获取通道
    $scope.getChannelInfo = function() {
        $scope.oSelname = [];
        var nAnalogChannel = 0;

        if ("" == szIP) {
            return;
        }
        // 数字通道
        WebVideoCtrl.I_GetDigitalChannelInfo(szIP, {
            async: false,
            success: function (xmlDoc) {
                var ia = 0;
                var oChannels = $(xmlDoc).find("InputProxyChannelStatus");
                $.each(oChannels, function (i) {
                    var id = parseInt($(this).find("id").eq(0).text(), 10),
                        name = $(this).find("name").eq(0).text(),
                        online = $(this).find("online").eq(0).text();
                    if ("false" == online) {// 过滤禁用的数字通道
                        return true;
                    }
                    if ("" == name) {
                        name = "IPCamera " + ((id - nAnalogChannel) < 10 ? "0" + (id - nAnalogChannel) : (id - nAnalogChannel));
                        $scope.oSelname[ia] = {
                            "id" : id,
                            "name" : name
                        };
                        ia++;
                    }else{
                        $scope.oSelname[ia] = {
                            "id" : id,
                            "name" : name
                        };
                        ia++;
                    }
                });
                $scope.$apply();

                console.log(szIP + " 获取数字通道成功！");
            },
            error: function () {
                console.log(szIP + " 获取数字通道失败！");
            }
        });
    };
    // 开始预览
    $scope.clickStartRealPlay = function(x) {
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex),
            iStreamType = parseInt(1, 10),// 码流类型 1-主码流，2-子码流，默认使用主码流预览
            iChannelID = parseInt(x, 10),//通道号
            bZeroChannel = false,//是否播放零通道，默认为 false
            szInfo = "";
        if ("" == szIP) {
            return;
        }

        if (oWndInfo != null) {// 已经在播放了，先停止
            WebVideoCtrl.I_Stop();
        }
        WebVideoCtrl.I_StartRealPlay(szIP, {
            iStreamType: iStreamType,
            iChannelID: iChannelID,
            bZeroChannel: bZeroChannel
        });
    };
    //登陆
    $scope.clickLogin = function() {
        if ("" == szIP || "" == szPort) {
            return;
        }
        WebVideoCtrl.I_Login(szIP, 1, szPort, szUsername, szPassword, {
            success: function (xmlDoc) {
                console.log(szIP + " 登录成功！");
                $scope.getChannelInfo();
            },
            error: function () {
                console.log(szIP + " 登录失败！");
            }
        });
    };


    // 退出
    function clickLogout() {
        if (szIP == "") {
            return;
        }
        var iRet = WebVideoCtrl.I_Logout(szIP);
        if (0 == iRet) {
            $scope.oSelname=[];
            console.log("退出成功！");
        } else {
            console.log("退出失败！");
        }
    };
    //初始化
    function chushihua(){
        try{
            if (-1 == WebVideoCtrl.I_CheckPluginInstall()) {
                alert("您还未安装过插件，双击开发包目录里的WebComponents.exe安装！");
                return;
            }
            // 初始化插件参数及插入插件
            WebVideoCtrl.I_InsertOBJECTPlugin("divPlugin");
            // 检查插件是否最新
            if (-1 == WebVideoCtrl.I_CheckPluginVersion()) {
                alert("检测到新的插件版本，双击开发包目录里的WebComponents.exe升级！");
                return;
            }
            var iType = parseInt(1, 10);
            WebVideoCtrl.I_ChangeWndNum(iType);
        }catch (err){
            alert("未安装插件！");
        }
    }

    $scope.yingpanluxiangji = function (ip,port,user,psword) {
        if(ip!=szIP){
            clickLogout();
            szIP = ip;
            szPort = port;
            szUsername = user;
            szPassword = psword;
            $scope.clickLogin();
        }
    }


    $rootScope.app.navbarTitle = "智能安防系统"; //设置头部提示信息
    chushihua();



}]);
