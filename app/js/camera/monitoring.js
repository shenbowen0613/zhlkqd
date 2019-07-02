App.controller('monitoringController', ['$scope', '$http', 'ngDialog', '$rootScope', function ($scope, $http, ngDialog, $rootScope) {
    $rootScope.app.navbarTitle = "智能安防系统"; //设置头部提示信息

    // 获取摄像头列表
    $http({ //查询按钮权限
        url: "/camera/info/list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.cameras = response.data;
        }
    });

    $scope.Language = 0;
    $scope.IPC_AX_exist = 0;
    $scope.isPlay = 0;

    $scope.divWidth = 1000;
    $scope.divHeight = 580;

    $scope.ip = "";//ip地址
    $scope.port = "";//端口号码
    $scope.logincode = "";//用户名
    $scope.loginpassword = "";//密码
    $scope.ishourse = 0;// 1 仓内；0 仓外，默认仓外

    $scope.initWebVideoCtrl = 0;// 是否初始化插件
    $scope.playIp = "";//播放IP


    // $scope.cangneiHK = function (ishourse) {
    //     // alert("ishourse---"+ishourse);
    //     $(".button-video").removeClass("button-cilck");
    //     $("#button" + ishourse).addClass("button-cilck");
    //     $scope.changeVideo($scope.curhousecode, $scope.curhouseid, ishourse);
    // };
    $scope.changeVideo = function (cameraid) {

        angular.forEach($scope.cameras,function(camera){
            if (camera.id==cameraid){
                $scope.camera=camera;
            }
        });

        $scope.initBds();//关闭贝德斯
        $scope.ishourse = $scope.camera.ishourse;
        $scope.curhouseid = $scope.camera.houseid;

        if ($scope.ishourse == 1) {
            $("#mpg4Ocx").show();
            $("#divPlugin").hide();
            $("#cloud_terrace").hide();
        } else {
            $("#mpg4Ocx").hide();
            $("#divPlugin").show();
            $("#cloud_terrace").show();
        }


        $('.houseOption').removeClass("video-canvas");
        $('#' + $scope.camera.cameracode).addClass("video-canvas");
        $.ajax({ //查询按钮权限
            url: "/grain/getByHouseId",
            data: {
                houseId: $scope.curhouseid
            },
            method: 'POST',
            async: false
        }).success(function (response) {
            if (response.success) {
                $scope.laGrainInspection = response.data;
            }
        });

        $("#camera_no").hide();
        $("#videoDiv").show();

        // $.ajax({ //查询按钮权限
        //     url: "/camera/info/loadByHouseId",
        //     data: {
        //         houseid: $scope.houseid,
        //         ishourse: $scope.ishourse
        //     },
        //     method: 'POST',
        //     async: false
        // }).success(function (response) {
        //     if (response.success) {
                $scope.securityCameraInfo = $scope.camera;
                $scope.ip = $scope.securityCameraInfo.cameraip;//ip地址
                $scope.port = $scope.securityCameraInfo.cameraport;//端口号码
                $scope.logincode = $scope.securityCameraInfo.logincode;//用户名
                $scope.loginpassword = $scope.securityCameraInfo.loginpassword;//密码
                if ($scope.ishourse == 1) {
                    //$scope.playBds();
                    $scope.playcangnei($scope.camera);
                } else {
                    $scope.playHk();
                }
            // } else {
            //     $("#camera_no").show();
            //     $("#videoDiv").hide();
            // }
        // });

    }
    // 贝德斯 -------------begin---------------
    //判断是否有插件
    $scope.HankPBds = function () {
        try {
            if (parent.parent.topFrame.lanSelect.value == '0') {
                $scope.Language = 0;
            } else {
                $scope.Language = 1;
            }
        } catch (e) {
            $scope.lang = navigator.language || navigator.systemLanguage;
            if ($scope.lang.toLowerCase() == "zh-cn")
                $scope.Language = 1;
            else
                $scope.Language = 0;
        }
        if ($scope.Language == 1) {
            $("#firefox_text").html("<h4>首次使用网页请下载<a href='download/ffactivex-setup-r39.exe'>FFActiveX工具</a>并安装，并下载<a href='download/axhost.r39.xpi'>ActiveX Hosting 插件</a>拖到Firefox浏览器中进行安装</h4>");
            $("#chrome_text").html("<h3>首次使用网页请下载<a href='download/ffactivex-setup-r39.exe'>FFActiveX工具</a>并安装，并下载<a href='download/chrome.r39.crx'>ActiveX Hosting 插件</a>拖到Chrome浏览器中进行安装</h3>");
            if ($("#HAS_IPC_AX").val() == "1")
                $("#text_lan").html("<h3><br>点此<a href='download/IPC_AX.exe' onclick='loadexe()'><font size='5'>下载控件</font></a>，安装成功后请<a href='#' onclick='windows.location.reload();'><font size='5'>刷新页面</font></a>。</h3>");
        }
        else {
            $("#firefox_text").html("<h3>If it's first time you open the browser, please download and install <a href='download/ffactivex-setup-r39.exe'>FFActiveX Tools</a>, and then download and drag<a href='download/axhost.r39.xpi'>ActiveX Hosting Plugin</a>to Firefox to install</h3>");
            $("#chrome_text").html("<h3>If it's first time you open the browser, please download and install <a href='download/ffactivex-setup-r39.exe'>FFActiveX Tools</a>, and then download and drag<a href='download/chrome.r39.crx'>ActiveX Hosting Plugin</a>to Chrome to install</h3>");
            if ($("#HAS_IPC_AX").val() == "1")
                $("#text_lan").html("<h3><br>click here<a href='download/IPC_AX.exe' onclick='loadexe()'><font size='5'>download control</font></a>.After install the control, <a href='#' onclick='windows.location.reload();'><font size='5'>refresh the page</font></a> please.</h3>");
            else
                $("#text_lan").html("<h3><br>click here<a href='https://1drv.ms/u/s!AvEAxOp0F01Ua3MNUvLCVJeDyf0' target='_blank' onclick='loadexe()'><font size='5'>download control</font></a>.After install the control, <a href='#' onclick='windows.location.reload();'><font size='5'>refresh the page</font></a> please.</h3>");

        }
        if (navigator.userAgent.indexOf("Chrome") != -1) {
            $("#chrome_text").show();
        }
        else {
            $("#chrome_text").hide();
        }
        if (navigator.userAgent.indexOf("Firefox") != -1) {
            $("#firefox_text").show();
        }
        else {
            $("#firefox_text").hide();
        }
    }
    <!--初始化加载-->
    $scope.initBds = function () {
        if ($scope.isPlay == 1) {
            $scope.player.StopPlay();
            $scope.isPlay = 0;
        }
    }
    //登录摄像机
    $scope.loginBds = function () {
        if (!(navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Chrome") == -1)) {
            try {
                $("#down_exe").hide();
                $("#mpg4Ocx").show();
                $("#down_exe").css("background-color", "#F9F6F6");
                var intvl = setInterval(function () {
                    $scope.result = $scope.player.RunPlayEx($scope.ip, 0, "0.0.0.0", 2, $scope.port, 0, $scope.logincode, $scope.loginpassword);
                    if ($scope.result) {
                        // $scope.isPlay = 1;
                        window.clearInterval(intvl);
                    }
                }, 1000);
                $scope.IPC_AX_exist = 1;
            }
            catch (e) {
                $("#down_exe").show();
                $("#mpg4Ocx").hide();
                $("#down_exe").css("background-color", "#B2B2B2");
            }
        }
        else {
            $("#down_exe").hide();
            $("#mpg4Ocx").show();
            $("#down_exe").css("background-color", "#F9F6F6");
        }

    }

    <!--开始播放-->
    $scope.startBds = function () {

        if ($scope.isPlay == 1) {
            $scope.player.StopPlay();
        } else {
            $scope.result = $scope.player.RunPlayEx($scope.ip, 0, "0.0.0.0", 2, $scope.port, 1, $scope.logincode, $scope.loginpassword);
            if ($scope.result) {
                $scope.isPlay = 1;
            }
        }
    }

    $scope.playBds = function () {
        $scope.player = document.getElementById("Player");
        //1，先判断是否有插件
        $scope.HankPBds();
        //2,初始化插件
        $scope.initBds();
        //    3,登录摄像机
        $scope.loginBds();
        /* //    4,播放视频
             $scope.startBds();*/

    }

    // 贝德斯 -------------end---------------


    // 海康 -------------begin---------------

    $scope.loginIp = [];

    $scope.playHk = function () {
        // 检查插件是否已经安装过
        var iRet = WebVideoCtrl.I_CheckPluginInstall();
        if (-1 == iRet) {
            $("#firefox_text").html("<h4>首次使用网页请下载<a href='download/WebComponentsKit.exe'>WebComponentsKit.exe</a>安装升级</h4>");
            $("#chrome_text").html("<h3>首次使用网页请下载<a href='download/WebComponentsKit.exe'>WebComponentsKit.exe</a>安装升级</h3>");
            if (navigator.userAgent.indexOf("Chrome") != -1) {
                $("#chrome_text").show();
            }
            else {
                $("#chrome_text").hide();
            }
            if (navigator.userAgent.indexOf("Firefox") != -1) {
                $("#firefox_text").show();
            }
            else {
                $("#firefox_text").hide();
            }
            return;
        }

        var oPlugin = {
            iWidth: $scope.divWidth,             // plugin width
            iHeight: $scope.divHeight             // plugin height
        };

        var oLiveView = {
            iProtocol: 1,            // protocol 1：http, 2:https
            szIP: $scope.ip,    // protocol ip
            szPort: $scope.port,            // protocol port
            szUsername: $scope.logincode,     // device username
            szPassword: $scope.loginpassword, // device password
            iStreamType: 1,          // stream 1：main stream  2：sub-stream  3：third stream  4：transcode stream
            iChannelID: 1,           // channel no
            bZeroChannel: false      // zero channel
        };

        // 初始化插件参数及插入插件
        WebVideoCtrl.I_InitPlugin(oPlugin.iWidth, oPlugin.iHeight, {
            bWndFull: true,//是否支持单窗口双击全屏，默认支持 true:支持 false:不支持
            iWndowType: 1
        });

        WebVideoCtrl.I_InsertOBJECTPlugin("divPlugin");
        // 登录设备
        var szDeviceIdentify = oLiveView.szIP;
        if ($scope.loginIp.indexOf(szDeviceIdentify) > -1) {//已经登录过了
            $scope.startPlay(szDeviceIdentify, oLiveView);
        } else {
            WebVideoCtrl.I_Login(oLiveView.szIP, oLiveView.iProtocol, oLiveView.szPort, oLiveView.szUsername, oLiveView.szPassword, {
                success: function (xmlDoc) {
                    // 开始预览
                    $scope.loginIp.push(szDeviceIdentify);
                    $scope.startPlay(szDeviceIdentify, oLiveView);
                },
                error: function () {
                    alert("登录失败");
                }
            });
        }

        // 关闭浏览器
        $(window).unload(function () {
            WebVideoCtrl.I_Stop();
        });
    }
    $scope.startPlay = function (szDeviceIdentify, oLiveView) {
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(0);
        if (oWndInfo != null) {// 已经在播放了，先停止
            WebVideoCtrl.I_Stop();
        }
        setTimeout(function () {
            WebVideoCtrl.I_StartRealPlay(szDeviceIdentify, {
                iStreamType: oLiveView.iStreamType,
                iChannelID: oLiveView.iChannelID,
                bZeroChannel: oLiveView.bZeroChannel
            });
        }, 100);
    }

// PTZ控制 9为自动，1,2,3,4,5,6,7,8为方向PTZ
    var g_bPTZAuto = false;
    $scope.mouseDownPTZControl = function (iPTZIndex) {
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(0),
            iPTZSpeed = 4,
            bStop = false;

        if (oWndInfo != null) {
            if (9 === iPTZIndex && g_bPTZAuto) {
                iPTZSpeed = 0;// 自动开启后，速度置为0可以关闭自动
                bStop = true;
            } else {
                g_bPTZAuto = false;// 点击其他方向，自动肯定会被关闭
                bStop = false;
            }

            WebVideoCtrl.I_PTZControl(iPTZIndex, bStop, {
                iPTZSpeed: iPTZSpeed,
                success: function (xmlDoc) {
                    if (9 === iPTZIndex) {
                        g_bPTZAuto = !g_bPTZAuto;
                    }
                    console.log(oWndInfo.szIP + " 开启云台成功！");
                },
                error: function () {
                    console.log(oWndInfo.szIP + " 开启云台失败！");
                }
            });
        }
    };

    // 方向PTZ停止
    $scope.mouseUpPTZControl = function () {
        var oWndInfo = WebVideoCtrl.I_GetWindowStatus(0);
        if (oWndInfo != null) {
            WebVideoCtrl.I_PTZControl(1, true);
        }
    };

    // 海康 -------------begin---------------

    // 仓内 -------------start---------------
    $scope.playcangnei = function (camera) {
        $("#mpg4Ocx").hide();
        $("#divPlugin").show();
        $("#cloud_terrace").show();
        // 检查插件是否已经安装过
        var iRet = WebVideoCtrl.I_CheckPluginInstall();
        if (-1 == iRet) {
            $("#firefox_text").html("<h4>首次使用网页请下载<a href='download/WebComponentsKit.exe'>WebComponentsKit.exe</a>安装升级</h4>");
            $("#chrome_text").html("<h3>首次使用网页请下载<a href='download/WebComponentsKit.exe'>WebComponentsKit.exe</a>安装升级</h3>");
            if (navigator.userAgent.indexOf("Chrome") != -1) {
                $("#chrome_text").show();
            }
            else {
                $("#chrome_text").hide();
            }
            if (navigator.userAgent.indexOf("Firefox") != -1) {
                $("#firefox_text").show();
            }
            else {
                $("#firefox_text").hide();
            }
            return;
        }

        var oPlugin = {
            iWidth: $scope.divWidth,             // plugin width
            iHeight: $scope.divHeight             // plugin height
        };

        var oLiveView = {
            iProtocol: 1,            // protocol 1：http, 2:https
            szIP: camera.cameraip,    // protocol ip
            szPort: camera.cameraport,            // protocol port
            szUsername: camera.logincode,     // device username
            szPassword: camera.loginpassword, // device password
            iStreamType: 2,          // stream 1：main stream  2：sub-stream  3：third stream  4：transcode stream
            iChannelID: parseInt(camera.gateway),           // channel no
            bZeroChannel: false      // zero channel
        };
        console.log(oLiveView);
        // 初始化插件参数及插入插件
        WebVideoCtrl.I_InitPlugin(oPlugin.iWidth, oPlugin.iHeight, {
            bWndFull: true,//是否支持单窗口双击全屏，默认支持 true:支持 false:不支持
            iWndowType: 1
        });

        WebVideoCtrl.I_InsertOBJECTPlugin("divPlugin");

        var szDeviceIdentify = oLiveView.szIP;
        if ($scope.loginIp.indexOf(szDeviceIdentify) > -1) {//已经登录过了
            $scope.startPlay(szDeviceIdentify, oLiveView);
        }else{
            WebVideoCtrl.I_Login(oLiveView.szIP, oLiveView.iProtocol, oLiveView.szPort, oLiveView.szUsername, oLiveView.szPassword, {
                success: function (xmlDoc) {
                    console.log(oLiveView.szIP + " 登录成功！");
                    $scope.loginIp.push(szDeviceIdentify);
                    $scope.startPlay(oLiveView.szIP,oLiveView);
                },
                error: function () {
                    console.log(oLiveView.szIP + " 登录失败！");
                }
            });
        }
    }
}]);
