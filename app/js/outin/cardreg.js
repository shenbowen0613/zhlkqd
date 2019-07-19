/*
 * Copyright (c) 2016. .保留所有权利.
 *                       
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('cardregController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {

    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=cardreg_dtoperator_list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.cardregDtoperatorList = response.data;
        }
    });



    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=varietyname_list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            var optionHtmls="";
            $scope.varietynameList = response.data;
            angular.forEach($scope.varietynameList, function (data) {
                console.log(data);
                optionHtmls += "<option value=\""+data.code+"\">"+data.label+"</option>";
            });
            $("#varietyname").append(optionHtmls);
        }
    });

    $.ajax({
        url: GserverURL+"/outin/prodPlaceList",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            var optionHtmls="";
            $scope.prodplaceList = response.data;
            angular.forEach($scope.prodplaceList, function (data) {
                optionHtmls += "<option value=\""+data.prodplace+"\">"+data.prodplace+"</option>";
            });
            $("#prodplace").append(optionHtmls);
        }
    });





    angular.element(document).ready(function(){
        $("#prodplace").chosen({
            no_results_text: "没有找到结果！",//搜索无结果时显示的提示
            search_contains:true,   //关键字模糊搜索，设置为false，则只从开头开始匹配
            allow_single_deselect:true, //是否允许取消选择
            max_selected_options:1  //当select为多选时，最多选择个数
        })
        $('#prodplace').on('change', function(e, params) {
            $("#prodplace1").val(params.selected);
        });
        $('#prodplace').on('chosen:no_results', function(e, params) {
            $("#prodplace1").val($(".chosen-search-input").val());
            $(".chosen-single").find('span').text($(".chosen-search-input").val());
        });
        $("#varietyname").chosen({
            no_results_text: "没有找到结果！",//搜索无结果时显示的提示
            search_contains:true,   //关键字模糊搜索，设置为false，则只从开头开始匹配
            allow_single_deselect:true, //是否允许取消选择
            max_selected_options:1  //当select为多选时，最多选择个数
        });
    });


    //采购合同列表
    $.ajax({
        url: GserverURL + "/buss/plan/treelist",
        method: 'POST',
        data: {"type": "contract"}, //以json格式传递
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.contractList = response.data;
        }
    });

    //获取仓房列表
    $.ajax({ //查询按钮权限
        url: GserverURL + "/la/house/tree?isrs=1",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.houseList = response.data;
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
            var result = mcard.closeReader();
            alert("未找到卡片");
        }
    }


    //供应商列表
    // $.ajax({ //查询按钮权限
    //     url: "buss/cust/treelist",
    //     method: 'POST',
    //     data: {"type": 1}, //以json格式传递
    //     async: false
    // }).success(function (response) {
    //     if (response.success) {
    //         $scope.custList = response.data;
    //     }
    // });

    //采购计划列表
    $.ajax({
        url: GserverURL + "/buss/plan/treelist",
        method: 'POST',
        data: {"type": "gain"}, //以json格式传递
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.planList = response.data;
        }
    });
    var LODOP;
    var curDate = new Date();
    var curYear = curDate.getFullYear();
    var curMonth = curDate.getMonth() + 1;
    var curDay = curDate.getDate();
    var years = new Array();
    for (var i = 0; i < 5; i++) {
        var paraarr = {
            key: curYear - i
        };
        years.push(paraarr);
    }
    $scope.yearList = years;


    $scope.iotypename = "入库";
    //添加数据
    $scope.save = function () {
        $scope.outinEntry.cardno = $("#smart_card").val();
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        $scope.outinEntry.iotypename = $scope.iotypename;
        if ($scope.outinVehicle == null) {
            $scope.outinVehicle = $("#cphm").val();
        }
        if ($scope.outinEntry.dtoperator == null) {
            $scope.outinEntry.dtoperator = $scope.cardregDtoperatorList[0].code;
        }else {
            $scope.outinEntry.dtoperator =$scope.outinEntry.dtoperator;
        }
        $scope.outinEntry.customername = $("#nameInput").val();
        $scope.outinCarrier.carrier = $("#nameInput").val();
        $scope.outinCarrier.cellphone = $("#cellphone").val();
        $scope.outinCarrier.indentitycard = $("#sfzh").val();
        $scope.outinCarrier.fulladdress = $("#jtzz").val();
        $scope.outinCarrier.identityimage = $("#identityimage").val();
        $scope.outinCarrier.bankname = $("#bankname").val();
        $scope.outinCarrier.bankcard = $("#bankcard").val();
        $scope.outinEntry.prodplace = $("#prodplace1").val();

        angular.forEach($scope.houseList, function (item) {
            if ($scope.outinEntry.housecode === item.code) {
                $scope.outinEntry.housename = item.label;
            }
        });
        var pData = {
            outinEntryStr: JSON.stringify($scope.outinEntry),
            outinCarrierStr: JSON.stringify($scope.outinCarrier)
            // ,
            // outinVehicleStr: $scope.outinVehicle
        };
        $http({
            url: GserverURL + '/outin/cardreg',
            method: 'POST',
            data: pData
        }).success(function (response) { //提交成功
            if (response.success) { //信息处理成功，进入用户中心页面
                $scope.outinEntry = null;
                $scope.outinCarrier = null;
                // $scope.outinVehicle = null;
                $("#cphm").val("");
                $("#smart_card").val("")
                rzhdialog(ngDialog, response.info, "success");
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, response.info, "error");
            }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })
    }


    $scope.print_setup = function () {//打印维护
        LODOP = getLodop();
        LODOP.PRINT_INITA(10, 9, 762, 533, "领卡登记打印");
        LODOP.ADD_PRINT_TEXT(97, 254, 48, 20, "年");
        LODOP.ADD_PRINT_TEXT(97, 127, 119, 20, "承储单位");
        LODOP.ADD_PRINT_TEXT(97, 339, 29, 20, "月");
        LODOP.ADD_PRINT_TEXT(97, 397, 30, 20, "日");
        LODOP.ADD_PRINT_TEXT(97, 480, 120, 20, "编号");
        LODOP.ADD_PRINT_TEXT(181, 86, 40, 20, "企业(个人)");
        LODOP.ADD_PRINT_TEXT(200, 86, 150, 20, "身份证号码");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(182, 260, 30, 20, "合同编号");
        LODOP.ADD_PRINT_TEXT(182, 370, 30, 20, "品种");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(182, 490, 43, 20, "运输工具");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(182, 589, 27, 20, "车号");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 11);
        LODOP.ADD_PRINT_TEXT(183, 688, 38, 20, "承运人");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);

        LODOP.PRINT_SETUP();
    };


    var currDate = new Date();
    $scope.print_preview = function () {
        var name = $("#nameInput").val();
        var idCard = $("#sfzh").val();
        var bianhao = $("#bianhao").val();
        var cph = $("#cph").val();
        var outincontractno = $("#outincontractno").val();
        LODOP = getLodop();
        LODOP.PRINT_INITA(10, 9, 762, 533, "领卡登记打印");
        LODOP.ADD_PRINT_TEXT(97, 254, 48, 20, currDate.getFullYear());
        LODOP.ADD_PRINT_TEXT(97, 127, 119, 20, "河南省粮食局浚县直属粮库");
        LODOP.ADD_PRINT_TEXT(97, 339, 29, 20, currDate.getMonth() + 1);
        LODOP.ADD_PRINT_TEXT(97, 397, 30, 20, currDate.getDate());
        LODOP.ADD_PRINT_TEXT(97, 480, 30, 20, bianhao);
        LODOP.ADD_PRINT_TEXT(181, 86, 40, 20, name);
        LODOP.ADD_PRINT_TEXT(200, 86, 150, 20, idCard);//身份证号码
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(182, 260, 30, 20, outincontractno);
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(182, 370, 30, 20, $scope.outinEntry.varietyname);
        LODOP.ADD_PRINT_TEXT(182, 490, 43, 20, "汽车");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.ADD_PRINT_TEXT(182, 589, 27, 20, cph);
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 11);
        LODOP.ADD_PRINT_TEXT(183, 688, 38, 20, name);
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
        LODOP.PREVIEW();
    }


    //读取身份证照片;
    $scope.readIdCardInfo = function () {
        //获取对象;
        var CertCtl = document.getElementById("CertCtl");
        //连接设备;
        var ret = CertCtl.connect();
        ret = $scope.JStrToObj(ret);
        if (ret.resultFlag == -1) {
            alert("未连接设备");
        } else {
            //读取数据;
            var ret = CertCtl.readCert();
            ret = $scope.JStrToObj(ret);
            if (ret.resultFlag == -1) {
                alert("读取身份证失败或未找到卡片");
            } else {
                $("#nameInput").val(ret.resultContent.partyName);
                $("#sfzh").val(ret.resultContent.certNumber);
                $("#jtzz").val(ret.resultContent.certAddress);
                // $scope.outinCarrier.carrier=$("#nameInput").val();
                // $scope.outinCarrier.indentitycard=$("#sfzh").val();
                // $scope.outinCarrier.fulladdress=$("#jtzz").val();
                $("#people_img").attr('src', "data:image/jpg;base64," + ret.resultContent.identityPic);
                $("#identityimage").val("data:image/jpg;base64," + ret.resultContent.identityPic);
                // CertCtl.Base64Data2File(ret.resultContent.identityPic, "c:\\temp\\zp.jpg");
            }
        }
    }


    $scope.JStrToObj = function (str) {
        return eval("(" + str + ")");
    }


}]);



