/*
 * Copyright (c) 2016. .保留所有权利.
 *                       
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('tareweightController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {
    $scope.val=localStorage.getItem('mod')
    $scope.tareWeight=0;
    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=looker_list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.lookerList = response.data;
        }
    });

    //获取仓房列表
    $.ajax({ //查询按钮权限
        url: GserverURL + "/la/house/tree?isrs=1",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.treeInfos = response.data;
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

    $scope.xiaopingshow1 =function(data){
        //TODO 删除
        console.log("---data---"+data);
        // alert("---data---"+data);
        if(data==0){
            data=10 + parseInt(Math.random()*10);
        }
        console.log("----小屏显示的数据--------"+data);
        // alert("----小屏显示的数据--------"+data);
        //投小屏
        $.ajax({
            url:"/ledsamll/ScSmallsend?weight="+data+"&flag="+Math.random(),
            async: false,
            method: 'GET'
        }).success(function(response){
            console.log("成功:"+response);
        }).error(function (response) { //提交失败
            console.log("失败:"+response);
        });
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
            var sf_num = parseInt(Math.floor(netweight * removeMap.水分 / 100));
            var zz_num = parseInt(Math.floor(netweight * removeMap.杂质 / 100));
            var zjml_num=parseInt(Math.floor(netweight * removeMap.整精米率 / 100));
            var gwcm_num=parseInt(Math.floor(netweight * removeMap.谷外糙米 / 100));
            var hlm_num=parseInt(Math.floor(netweight * removeMap.黄粒米 / 100));
            var hhl_num=parseInt(Math.floor(netweight * removeMap.互混率 / 100));
            var zjsg_num=parseInt(Math.floor(netweight * removeMap.重金属镉 / 100));
            var szqw_value=removeMap.色泽气味;

            var  cutweight =  sf_num + zz_num +  zjml_num + gwcm_num + hlm_num + hhl_num + zjsg_num;
            $("#cutweight").val(cutweight);
            $scope.outinTare.cutweight=cutweight;
            var realnetweight = netweight - cutweight ;
            realnetweight = parseInt(realnetweight);
            $("#netweight").val(realnetweight);
            $scope.outinTare.netweight = realnetweight;

            var dapingData = {
                hphm: $scope.outinEntry.vehicleno,//车牌号码
                dj: $scope.outinEntry.outinQualityResult.gradename,//等级，一级，二级
                pz: $scope.outinEntry.outinQualityResult.varietyname,//品种
                rz: qualityMap.容重,//容重
                sf: qualityMap.水分,//水分
                sf_num: sf_num,//水分扣量
                zz: qualityMap.杂质,//杂质
                zz_num: zz_num,//杂质扣量
                zjml: qualityMap.整精米率,//整精米率
                zjml_num: zjml_num,//整精米率扣量
                gwcm: qualityMap.谷外糙米,//谷外糙米
                gwcm_num: gwcm_num,//谷外糙米扣量
                hlm: qualityMap.黄粒米,//黄粒米
                hlm_num: hlm_num,//黄粒米扣量
                hhl: qualityMap.互混率,//互混率
                hhl_num: hhl_num,//互混率
                szqw: qualityMap.色泽气味,//互混率
                szqw_value: szqw_value,//色泽气味
                zjsg: qualityMap.重金属镉,//重金属镉
                zjsg_num: zjsg_num,//重金属镉
            };
            //把质检信息保存到皮重环节
            $scope.outinTare.memo = JSON.stringify(dapingData);

            $scope.daPingShow = dapingData;
            $.ajax({
                    headers: {
                        "content-Type": "application/json;charset=UTF-8",
                        "Accept": "application/json;charset=UTF-8"
                    },
                    url: "/led/ScSend99",
                    type: "POST",
                    data: JSON.stringify(dapingData),
                    dataType: "json"
                }
            );
        }
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
            if($scope.qualitycutweight==null){
                $scope.qualitycutweight=0;
            }
            //先初始化净重
            var jz = parseInt($scope.grossweight) - parseInt($scope.outinTare.tareweight);
            $("#netweight").val(jz);
            $scope.outinTare.netweight=jz;
        } else {
            $("#netweight").val(0);
            $("#cutweight").val(0);
            $scope.outinTare.netweight = 0;
        }
        //对接大屏显示 begin
        $scope.LedShow();
    }


    $scope.zhuapai= function () {
        //抓拍三张图
        $.ajax({
            url: '/lpr/scklpr',
            method: 'POST'
        }).success(function (response) { //提交成功
            if (response.success) { //信息处理成功，进入用户中心页面
                $scope.result = response.data;
                $("#zp1").attr("src", $scope.result.zp1);
                $("#zp1val").val($scope.result.zp1);
                $("#zp2").attr("src", $scope.result.zp2);
                $("#zp2val").val($scope.result.zp2);
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, response.info, "error");
            }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })
    }

    //获取称重;
    $scope.getTareWeight = function () {
        $scope.url = 'http://192.168.1.222:8868/liangqing';
        $http({
            url: $scope.url,
            method: 'GET',
            async: true
        }).success(function (response) { //提交成功
            // if (response.requst == 1) { //信息处理成功，进入用户中心页面
                var tareWeight = response.data;
                tareWeight = tareWeight * 1;
                $scope.tareWeight=tareWeight;
                //小屏直接显示
                $scope.xiaopingshow1($scope.tareWeight);

                $scope.outinTare.tareweight = tareWeight;
                $scope.upNetWeight();
                $("#tareweight").val(tareWeight);

                $scope.zhuapai();
            // } else { //信息处理失败，提示错误信息
            //     rzhdialog(ngDialog, "服务器有异常", "error");
            // }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })
    }

    $scope.ifTaiGan= function(){
        if ($scope.vehicleno == $scope.outinEntry.vehicleno){
            $.ajax({
                //出库 摄像头 ip 192.168.1.202 admin admin
                url: '/gb/openGB?ip=192.168.1.202&username=admin&password=admin&flag='+Math.random(),
                method: 'GET'
            }).success(function (){
                var timer=false
                var i=0;
                var j=3;//延迟几秒
                if(timer){
                    clearInterval(timer);
                }
                timer=setInterval(function(){
                    ++i;
                    if(i==j){
                        $.ajax({
                            //出库 摄像头 ip 192.168.1.202 admin admin
                            url: '/gb/closeGB?ip=192.168.1.202&username=admin&password=admin&flag='+Math.random(),
                            method: 'GET'
                        })
                        clearInterval(timer);
                    }
                },1000);
            });
        }else{
            rzhdialog(ngDialog, "车牌不一致", "error");
        }
    }
    //商城获取车牌照片;
    $scope.readLicensePlate = function () {
        $.ajax({
            url: '/outPlat/PlateServlet?flag='+Math.random(),
            method: 'GET'
        }).success(function (response) { //提交成功
            if (response.success) {
                $scope.vehicleno = response.info;
                $scope.ifTaiGan();
                $("#cphm").val($scope.vehicleno);
                $("#clzp").attr("src", "app/img/cur_cheliang_out.jpg");
            }else{
                $("#cphm").val("");
                $("#clzp").attr("src", "app/img/cheliang.jpg");
                rzhdialog(ngDialog, "无车牌信息", "error");
            }
        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })
    }


    //下磅抬杆;
    $scope.xiabangtaigan = function () {
        $scope.doding = true;
        $scope.iotypename=$("input:radio[name='iotypename']:checked").val();
        if ($scope.iotypename == "入库") {
            $.ajax({
                //入库 摄像头 ip 192.168.1.183 admin admin12345
                url: '/gb/openGB?ip=192.168.1.183&username=admin&password=admin12345&flag='+Math.random(),
                method: 'GET'
            }).success(function (){
                var timer=false
                var i=0;
                var j=3;//延迟几秒
                if(timer){
                    clearInterval(timer);
                }
                timer=setInterval(function(){
                    ++i;
                    if(i==j){
                        $.ajax({
                            //出库 摄像头 ip 192.168.1.202 admin admin
                            url: '/gb/closeGB?ip=192.168.1.183&username=admin&password=admin12345&flag='+Math.random(),
                            method: 'GET'
                        })
                        clearInterval(timer);
                    }
                },1000);
            });
        } else if ($scope.iotypename == "出库") {
            $.ajax({
                //出库 摄像头 ip 192.168.1.202 admin admin
                url: '/gb/openGB?ip=192.168.1.202&username=admin&password=admin&flag='+Math.random(),
                method: 'GET'
            }).success(function (){
                var timer=false
                var i=0;
                var j=3;//延迟几秒
                if(timer){
                    clearInterval(timer);
                }
                timer=setInterval(function(){
                    ++i;
                    if(i==j){
                        $.ajax({
                            //出库 摄像头 ip 192.168.1.202 admin admin
                            url: '/gb/closeGB?ip=192.168.1.202&username=admin&password=admin&flag='+Math.random(),
                            method: 'GET'
                        })
                        clearInterval(timer);
                    }
                },1000);
            });
        } else {
            $scope.doding = false;
            rzhdialog(ngDialog, "请选择出入库类型", "error");
        }
        if ($scope.doding) {
            $.ajax({
                url: $scope.url,
                method: 'POST'
            })
        }
    }


    //根据智能卡号获取出入库信息
    $scope.getByCardno = function () {
        $scope.cardno = $("#smart_card").val();
        $.ajax({ //查询按钮权限
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

        angular.forEach($scope.treeInfos, function (item) {
            if ($scope.housecode == item.code) {
                $scope.housename = item.label;
            }
        });

        if ($scope.outinTare.tarelooker!=null || $scope.outinTare.tarelooker!=undefined) {
            $scope.outinTare.tarelooker = $scope.outinTare.tarelooker;
        }else {
            $scope.outinTare.tarelooker =$scope.lookerList[0].code;
        }
        if ($scope.outinTare.dtoperator!=null || $scope.outinTare.dtoperator!=undefined) {
            $scope.outinTare.dtoperator = $scope.outinTare.dtoperator;
        }else {
            $scope.outinTare.dtoperator =$scope.dtoperatorList[0].code;
        }

        $scope.outinTare.clzp = $scope.clzp;
        $scope.outinTare.zp1 = $scope.zp1;
        $scope.outinTare.zp2 = $scope.zp2;
        $scope.outinTare.zp3 = $scope.zp3;

        var pData = {
            housecode:$scope.housecode,
            housename:$scope.housename,
            outinEntryStr: JSON.stringify($scope.outinEntry),
            outinTareStr: JSON.stringify($scope.outinTare)
        };
        $.ajax({
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


