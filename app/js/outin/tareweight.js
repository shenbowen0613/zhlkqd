/*
 * Copyright (c) 2016. .保留所有权利.
 *                       
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('tareweightController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {


    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=looker_list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.lookerList = response.data;
        }
    });


    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=dtoperator_list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.dtoperatorList = response.data;
        }
    });


    $scope.readSmartCard = function () {
        var mcard = document.getElementById("mcard");

        try {
            var version = mcard.openReader(1, 9600);
            if (mcard.LastRet != 0) {
                alert("打开读写器失败");
                return;
            }
            else {
                var result = mcard.openCard(1, 16); //打开卡片,让其显示16进制字符串卡号
                if (mcard.LastRet != 0) {
                    alert("打开卡片失败或未发现卡片");
                    var result = mcard.closeReader();
                    return;

                }
                else {
                    $("#smart_card").val(result);
                    var result = mcard.closeReader();
                }

            }
        }
        catch (e) {
            console.log(e.Message);
        }
    }



    $scope.LedShow = function (){
        //入库流程才对接大屏 begin
        if ($scope.iotypename == "入库") {
            //大屏显示的数据，调用沈博文接口  begin
            $scope.qualityDetail = $scope.outinEntry.outinQualityResult.memo;
            var detailMap = eval("(" + $scope.qualityDetail + ")");
            var qualityMap = detailMap.qualitys;
            var removeMap = detailMap.removes;

            //毛重 - 皮重
            var netweight = $("#netweight").val();
            var bwsl_num = parseInt(Math.floor(netweight * removeMap.不完善粒 / 100));
            var sf_num = parseInt(Math.floor(netweight * removeMap.水分 / 100));
            var zz_num = parseInt(Math.floor(netweight * removeMap.杂质 / 100));
            var kwz_num = parseInt(Math.floor(netweight * removeMap.矿物质 / 100));

            var  cutweight =  bwsl_num + sf_num +  zz_num + kwz_num;
            $("#cutweight").val(cutweight);
            var realnetweight = netweight - cutweight ;
            realnetweight = parseInt(realnetweight);
            $("#netweight").val(realnetweight);
            $scope.outinTare.netweight = realnetweight;


            var dapingData = {
                hphm: $scope.outinEntry.vehicleno,//车牌号码
                dj: $scope.outinEntry.outinQualityResult.gradename,//等级，一级，二级
                pz: $scope.outinEntry.outinQualityResult.varietyname,//品种
                rz: qualityMap.容重,//容重
                bwsl: qualityMap.不完善粒,//不完善粒
                bwsl_num: bwsl_num,//不完善粒扣量
                sf: qualityMap.水分,//水分
                sf_num: sf_num,//水分扣量
                zz: qualityMap.杂质,//杂质
                zz_num: zz_num,//杂质扣量
                kwz: qualityMap.矿物质,//矿物质
                kwz_num: kwz_num,//矿物质扣量
            };
            //把质检信息保存到皮重环节
            $scope.outinTare.memo = JSON.stringify(dapingData);

            $scope.daPingShow = dapingData;
            $.ajax({
                    headers: {
                        "content-Type": "application/json;charset=UTF-8",
                        "Accept": "application/json;charset=UTF-8"
                    },
                    url: "/xxbf/send129",
                    type: "POST",
                    data: JSON.stringify(dapingData),
                    dataType: "json"
                }
            );

            //ngix.conf文件中 修改 解决跨域问题

            //     upstream proxy_store {
            //         ip_hash;
            //         server 127.0.0.1:8090;     #业务逻辑
            //     }
            //
            //     upstream proxy_xxbf {
            //         ip_hash;
            //         server 192.0.0.79:8080;     #大屏显示
            //     }
            //
            //     server {
            //         listen       84;
            //         server_name  127.0.0.1;
            //
            //     #charset koi8-r;
            //
            //     #access_log  logs/host.access.log  main;
            //
            //         location =/ {
            //         root   D:/nginx-1.15.7/static;
            //         index  index.html index.htm index.jsp index.do;
            //     }
            //
            //     location / {
            //         proxy_pass http://proxy_store;
            //     proxy_set_header Host    $host;
            //     proxy_set_header X-Real-IP $remote_addr;
            //     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            // }
            //
            //     location /xxbf {
            //         proxy_pass http://proxy_xxbf;
            //             proxy_set_header Host    $host;
            //         proxy_set_header X-Real-IP $remote_addr;
            //         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            //     }
            //
            //     location ~ \.(html|htm|gif|jpg|jpeg|bmp|png|ico|txt|js|css|woff|woff2|eot|otf|svg|ttf|psd|jade|less|scss|json|xls|xlsx)$ {
            //         root  D:/nginx-1.15.7/static;
            //     }

            //大屏显示的数据，调用沈博文接口  end
        }

        //入库流程才对接大屏 end
    }



    $scope.showDiv = function (tid) {
        $("#outinDiv").hide();
        $("#inDiv").hide();
        $("#outDiv").hide();
        $("#outinDiv").show();
        $("#" + tid).show();
    }

    $scope.outinTare = {};
    $scope.upNetWeight = function () {
        if ($scope.iotypename == '入库') {
            if ($scope.outinTare.tareweight == null) {
                $scope.outinTare.tareweight = 0;
            }
            if ($scope.grossweight == null) {
                $scope.grossweight = 0;
            }
            //先初始化净重
            var jz = parseInt($scope.grossweight) - parseInt($scope.outinTare.tareweight);
            $("#netweight").val(jz);
        } else {
            $("#netweight").val(0);
            $("#cutweight").val(0);
            $scope.outinTare.netweight = 0;
        }
        //对接大屏显示 begin
        $scope.LedShow();
    }


    //获取称重;
    $scope.getTareWeight = function () {
        $scope.url = 'http://192.0.0.79:8868/liangqing';
        $http({
            url: $scope.url,
            method: 'GET'
        }).success(function (response) { //提交成功
            if (response.requst == 1) { //信息处理成功，进入用户中心页面
                var tareWeight = response.data;
                tareWeight = tareWeight * 1;
                $scope.outinTare.tareweight = tareWeight;
                $scope.upNetWeight();
                $("#tareweight").val(tareWeight);
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, "服务器有异常", "error");
            }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })

        //抓拍三张图
        $http({
            url: '/lpr/carImg',
            method: 'POST'
        }).success(function (response) { //提交成功
            if (response.success) { //信息处理成功，进入用户中心页面
                $scope.result = response.data;
                $("#zp1").attr("src", $scope.result.zp1);
                $("#zp1val").val($scope.result.zp1);
                $("#zp2").attr("src", $scope.result.zp2);
                $("#zp2val").val($scope.result.zp2);
                $("#zp3").attr("src", $scope.result.zp3);
                $("#zp3val").val($scope.result.zp3);
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, response.info, "error");
            }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })

        // //对接大屏显示 begin
        // $scope.daPingShow();
    }

    //获取车牌照片;
    $scope.readLicensePlate = function () {
        $scope.doding = true;
        if ($scope.iotypename == "入库") {
            $scope.url = '/lpr/xxklpr?cameraId=114';
        } else if ($scope.iotypename == "出库") {
            $scope.url = '/lpr/xxklpr?cameraId=113';
        } else {
            $scope.doding = false;
            rzhdialog(ngDialog, "请选择出入库类型", "error");
        }
        if ($scope.doding) {
            $http({
                url: $scope.url,
                method: 'POST'
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.result = response.data;
                    $scope.vehicleno = $scope.result.plate;
                    $("#cphm").val($scope.vehicleno);
                    // $("#clzp").attr("src",$scope.result.clzp);
                    // $("#clzpval").val($scope.result.clzp);
                } else { //信息处理失败，提示错误信息
                    rzhdialog(ngDialog, response.info, "error");
                }

            }).error(function (response) { //提交失败
                rzhdialog(ngDialog, "操作失败", "error");
            })
        }
    }


    //下磅抬杆;
    $scope.xiabangtaigan = function () {
        $scope.doding = true;
        if ($scope.iotypename == "入库") {
            $scope.url = '/lpr/xxklpr?cameraId=113';
        } else if ($scope.iotypename == "出库") {
            $scope.url = '/lpr/xxklpr?cameraId=114';
        } else {
            $scope.doding = false;
            rzhdialog(ngDialog, "请选择出入库类型", "error");
        }
        if ($scope.doding) {
            $http({
                url: $scope.url,
                method: 'POST'
            })
        }
    }


    //根据智能卡号获取出入库信息
    $scope.getByCardno = function () {
        $scope.cardno = $("#smart_card").val();
        $http({ //查询按钮权限
            url: "/outin/weight/loadGross",
            method: 'POST',
            data: {cardno: $scope.cardno},
            async: false
        }).success(function (response) {
            if (response.success) {
                $scope.outinEntry = response.data.outinEntry;
                $scope.qualitycutweight = response.data.qualitycutweight;
                $scope.grossweight = response.data.weight;
                $scope.upNetWeight();
            }
        });
    }


    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        $scope.cardno = $("#smart_card").val();
        $scope.outinEntry.cardno = $scope.cardno;

        $scope.clzp = $("#clzpval").val();
        $scope.zp1 = $("#zp1val").val();
        $scope.zp2 = $("#zp2val").val();
        $scope.zp3 = $("#zp3val").val();

        $scope.outinTare.clzp = $scope.clzp;
        $scope.outinTare.zp1 = $scope.zp1;
        $scope.outinTare.zp2 = $scope.zp2;
        $scope.outinTare.zp3 = $scope.zp3;

        var pData = {
            outinEntryStr: JSON.stringify($scope.outinEntry),
            outinTareStr: JSON.stringify($scope.outinTare)
        };
        $http({
            url: GserverURL + '/outin/weight/saveTare',
            method: 'POST',
            data: pData
        }).success(function (response) { //提交成功
            if (response.success) { //信息处理成功，进入用户中心页面
                rzhdialog(ngDialog, response.info, "success");
                $scope.outinEntry = null;
                $scope.outinTare = null;
                $scope.cardno = null;
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, response.info, "error");
            }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })
    }


    $scope.print_setup = function () {//打印维护
        LODOP = getLodop();
        LODOP.PRINT_INITA(10, 9, 762, 533, "回皮检斤打印");
        LODOP.ADD_PRINT_TEXT(286, 563, 30, 20, "皮重/增扣粮");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(286, 663, 30, 20, "净重");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(336, 560, 30, 20, "净重大写");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.PRINT_SETUP();
    };


    $scope.print_preview = function () {

        var tareweight = $("#tareweight").val();
        var netweight = $("#netweight").val();
        var cutweight = $("#cutweight").val();
        ;
        LODOP = getLodop();
        LODOP.PRINT_INITA(10, 9, 762, 533, "回皮检斤打印");
        LODOP.ADD_PRINT_TEXT(286, 563, 30, 20, tareweight + "/" + cutweight);
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(286, 663, 30, 20, netweight);
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(336, 560, 30, 20, intToChinese(netweight));
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.PREVIEW();
    }


    function intToChinese(str) {
        str = str + '';
        var len = str.length;
        var result = '';
        var num = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];

        for (var i = 0; i < len; i++) {
            result = result + num[str.substring(i, i + 1)] + '      ';
        }
        while (len < 6) {
            result = "☒      " + result;
            len++;
        }
        return result;

    }
}]);


