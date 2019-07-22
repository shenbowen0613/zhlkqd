/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('settlementController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {


    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=jsoperatorname_list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.jsoperatornameList = response.data;
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
            console.log("未找到卡片");
        }
    }

    //根据智能卡号获取出入库信息
    $scope.settlementGetByCardno = function () {
        $scope.cardno = $("#smart_card").val();
        $http({
            url: GserverURL + "/outin/settlement/load",
            method: 'POST',
            data: {cardno: $scope.cardno},
            async: false
        }).success(function (response) {
            if (response.success) {
                $scope.settlementDetailVO = response.data;
                var grossweight = $scope.settlementDetailVO.grossweight;
                var price = $scope.settlementDetailVO.price;
                var tareweight = $scope.settlementDetailVO.tareweight;
                var jsweight = $scope.settlementDetailVO.netweight;
                $scope.jsweight = jsweight;
                $scope.price = price;
                $scope.grossweight = grossweight;
                $scope.tareweight = tareweight;
                $scope.busno = $scope.settlementDetailVO.busno;
                $("#jsweight").val($scope.jsweight);
                $("#jsprice").val($scope.price);
                $scope.sumJsMoney();
            }
        });


    }

    $scope.sumJsMoney = function () {
        var jsweight = $("#jsweight").val();
        var jsprice = $("#jsprice").val();
        var sumNum = 0;
        if (jsweight != null && jsprice != "") {
            sumNum = jsweight * jsprice;
        }
        sumNum = sumNum.toFixed(2)+"";
        $scope.jsweight = jsweight;
        $scope.jsmoney = sumNum;
        $("#jsmoney").val($scope.jsmoney);
    }

    //添加数据
    $scope.settlement = function () {
        $scope.jsmoney= $("#jsmoney").val();
        $scope.jsprice= $("#jsprice").val();
        $scope.jsweight= $("#jsweight").val();
        $scope.jsoperatorname= $("#jsoperatorname").val();
        var addData={
            jsmoney:$scope.jsmoney,
            jsprice:$scope.jsprice,
            jsweight:$scope.jsmoney,
            jsoperatorname:$scope.jsoperatorname,
            busno:$scope.busno,
        }
        // $scope.outinSettlement.jsmoney = $scope.jsmoney;
        // $scope.outinSettlement.jsweight = $scope.jsweight;
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        // $scope.outinSettlement.busno = $scope.busno;
        var pData = {
            outinSettlementStr: JSON.stringify(addData)
        };
        $http({
            url: GserverURL + '/outin/settlement/settlement',
            method: 'POST',
            data: pData
        }).success(function (response) { //提交成功
            if (response.success) { //信息处理成功，进入用户中心页面
                rzhdialog(ngDialog, response.info, "success");
                $scope.cardno = null;
                $scope.jsweight = null;
                $scope.jsmoney = null;
                $scope.settlementDetailVO = null;
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, response.info, "error");
            }

        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })
    }



    $scope.print_setup = function () {//打印维护
        LODOP = getLodop();
        LODOP.PRINT_INITA(10,9,800,600,"结算打印");
        LODOP.ADD_PRINT_RECT("20.37mm","5.29mm","200mm","120.99mm",0,1);
        LODOP.ADD_PRINT_TEXT("4.23mm","75.14mm","12.17mm","5.29mm","year");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.SET_PRINT_STYLEA(0,"Bold",1);
        LODOP.ADD_PRINT_TEXT("5.03mm","85.99mm","59.53mm","8.2mm","年小麦最低收购价收购结算凭证");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
        LODOP.ADD_PRINT_TEXT("14.82mm","6.88mm","70.12mm","5.29mm","填写单位：河南省粮食局浚县直属粮库");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("15.08mm","105.83mm","3.18mm","3.97mm","y");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("16.14mm","109.01mm","5.56mm","2.65mm","年");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("15.61mm","114.56mm","3.18mm","3.97mm","m");
        LODOP.ADD_PRINT_TEXT("16.14mm","118.53mm","5.82mm","3.18mm","月");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("16.14mm","123.03mm","5.03mm","2.65mm","d");
        LODOP.ADD_PRINT_TEXT("16.14mm","126.21mm","4.5mm","3.97mm","日");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("15.61mm","169.86mm","14.29mm","3.97mm","编号：");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("15.35mm","184.68mm","14.29mm","3.97mm","no");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("26.99mm","18.79mm","26.7mm","204.5mm",0,1);
        LODOP.ADD_PRINT_LINE("141.29mm","18.79mm","20.4mm","19.08mm",0,1);
        LODOP.ADD_PRINT_LINE("40.3mm","5.29mm","40.01mm","178.09mm",0,1);
        LODOP.ADD_PRINT_LINE("65.38mm","5.03mm","65.09mm","204.81mm",0,1);
        LODOP.ADD_PRINT_LINE("118.59mm","5.56mm","118.3mm","178.06mm",0,1);
        LODOP.ADD_PRINT_TEXT("28.58mm","8.47mm","9.53mm","5.29mm","登记");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("50.8mm","8.2mm","7.94mm","5.29mm","检验");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("84.4mm","9mm","8.73mm","5.29mm","检斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("125.94mm","5.29mm","126.23mm","204.28mm",0,1);
        LODOP.ADD_PRINT_LINE("133.88mm","4.76mm","134.17mm","205.05mm",0,1);
        LODOP.ADD_PRINT_TEXT("120.39mm","7.41mm","10.32mm","3.97mm","结算");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("128.06mm","5.82mm","13.23mm","5.29mm","开户行");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("136mm","7.14mm","10.05mm","3.97mm","入仓");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("125.99mm","178.06mm","27.81mm","178.36mm",0,1);
        LODOP.ADD_PRINT_LINE("33.34mm","19.05mm","33.63mm","178.04mm",0,1);
        LODOP.ADD_PRINT_LINE("71.7mm","19.05mm","71.99mm","178.04mm",0,1);
        LODOP.ADD_PRINT_LINE("76.33mm","19.05mm","76.62mm","177.85mm",0,1);
        LODOP.ADD_PRINT_LINE("81.99mm","16.06mm","81.2mm","177.96mm",0,1);
        LODOP.ADD_PRINT_LINE("89.09mm","19.58mm","89.59mm","178.57mm",0,1);
        LODOP.ADD_PRINT_LINE("95.44mm","18.79mm","95.73mm","204.79mm",0,1);
        LODOP.ADD_PRINT_LINE("102.29mm","19.31mm","102.58mm","178.12mm",0,1);
        LODOP.ADD_PRINT_LINE("106.31mm","19.31mm","106.6mm","178.12mm",0,1);
        LODOP.ADD_PRINT_LINE("112.18mm","18.79mm","111.89mm","177.77mm",0,1);
        LODOP.ADD_PRINT_LINE("125.89mm","45.51mm","65.59mm","45.8mm",0,1);
        LODOP.ADD_PRINT_LINE("26.99mm","92.08mm","71.49mm","92.37mm",0,1);
        LODOP.ADD_PRINT_LINE("65.11mm","145.52mm","26.51mm","145.81mm",0,1);
        LODOP.ADD_PRINT_LINE("55.59mm","18.79mm","55.3mm","177.59mm",0,1);
        LODOP.ADD_PRINT_LINE("20.11mm","60.85mm","26.7mm","61.15mm",0,1);
        LODOP.ADD_PRINT_LINE("26.38mm","126.21mm","19.79mm","126.5mm",0,1);
        LODOP.ADD_PRINT_TEXT("22.23mm","18.52mm","16.93mm","3.97mm","售粮人：");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("22.49mm","32.81mm","26.46mm","2.65mm","张三");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("22.49mm","60.85mm","25.14mm","3.97mm","身份证号码：");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("22.49mm","84.14mm","35.72mm","2.65mm","411425198808166015");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("22.49mm","127.53mm","14.02mm","3.97mm","地址：");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("22.49mm","139.96mm","61.38mm","3.44mm","河南省商丘市");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("28.84mm","46.04mm","26.46mm","3.97mm","到库时间");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("28.84mm","109.8mm","18.26mm","3.97mm","运输工具");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("29.37mm","153.19mm","18.26mm","2.65mm","车（船）号");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("35.19mm","43.39mm","26.46mm","3.97mm","到库时间Date");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("35.19mm","112.45mm","14.55mm","2.65mm","汽车");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("35.45mm","156.37mm","15.08mm","2.65mm","车船号");
        LODOP.ADD_PRINT_LINE("65.09mm","32.54mm","39.69mm","32.83mm",0,1);
        LODOP.ADD_PRINT_LINE("65.09mm","47.36mm","39.69mm","47.65mm",0,1);
        LODOP.ADD_PRINT_LINE("65.41mm","64.03mm","40.01mm","64.32mm",0,1);
        LODOP.ADD_PRINT_LINE("65.41mm","75.94mm","40.01mm","76.23mm",0,1);
        LODOP.ADD_PRINT_TEXT("46.04mm","17.99mm","16.67mm","5.29mm","  品种\r\n（代号）");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("47.1mm","35.72mm","9.53mm","5.29mm","产地");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("47.36mm","47.63mm","16.93mm","5.29mm","生产年度");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("47.36mm","65.88mm","10.85mm","3.97mm","等级");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("42.6mm","78.05mm","11.38mm","9mm","出糙率(%)");
        LODOP.ADD_PRINT_TEXT("40.75mm","95.51mm","10.05mm","12.44mm","整精米率（%）");
        LODOP.ADD_PRINT_TEXT("40.75mm","10.721cm","8.47mm","12.44mm","水分(%)");
        LODOP.ADD_PRINT_TEXT("40.22mm","115.15mm","8.73mm","13.76mm","杂质(%)");
        LODOP.ADD_PRINT_TEXT("41.54mm","125.94mm","8.47mm","12.44mm","黄粒米含量(%)");
        LODOP.ADD_PRINT_TEXT("42.33mm","134.94mm","10.85mm","9.79mm","谷外糙米含量(%)");
        LODOP.ADD_PRINT_TEXT("40.48mm","146.31mm","9.53mm","12.7mm","互混率(%)");
        LODOP.ADD_PRINT_TEXT("42.6mm","156.37mm","5.56mm","9.79mm","镉mg/k");
        LODOP.ADD_PRINT_TEXT("43.39mm","167.22mm","10.32mm","8.23mm","色泽气味");
        LODOP.ADD_PRINT_TEXT("58.74mm","18.79mm","17.2mm","5.29mm","混合小麦");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59mm","34.4mm","13.49mm","3.97mm","鹤壁市");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59.27mm","51.33mm","10.32mm","3.97mm","2016");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59.27mm","65.88mm","9.79mm","3.97mm","一级");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59.53mm","80.7mm","9mm","3.7mm","90");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59.53mm","96.57mm","11.11mm","3.97mm","12");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59.53mm","108.56mm","11.11mm","3.97mm","36");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59.53mm","119.57mm","11.11mm","3.97mm","68");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("65.09mm","107.55mm","39.69mm","107.84mm",0,1);
        LODOP.ADD_PRINT_TEXT("59.53mm","129.57mm","11.11mm","3.97mm","99");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("65.09mm","114.54mm","39.69mm","114.83mm",0,1);
        LODOP.ADD_PRINT_TEXT("59.53mm","139.57mm","11.11mm","3.97mm","150");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("65.09mm","135.55mm","39.69mm","135.84mm",0,1);
        LODOP.ADD_PRINT_TEXT("59.53mm","149.57mm","11.11mm","3.97mm","160");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("65.09mm","155.55mm","39.69mm","155.84mm",0,1);
        LODOP.ADD_PRINT_TEXT("59.53mm","157.56mm","11.11mm","3.97mm","170");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59.53mm","167.56mm","11.11mm","3.97mm","正常味道");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("66.94mm","25.14mm","16.14mm","3.97mm","包装类型");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("71.97mm","26.72mm","11.38mm","3.97mm","毛重");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("77.52mm","26.99mm","11.38mm","3.7mm","皮重");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("84.4mm","24.87mm","16.67mm","3.97mm","水分扣量");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("91.02mm","24.87mm","18.52mm","3.97mm","杂质扣量");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("97.9mm","24.34mm","18.26mm","3.97mm","整装米率扣量");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("102.39mm","21.43mm","23.81mm","3.97mm","黄粒米扣量");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("108.21mm","20.9mm","23.81mm","3.97mm","互混率扣量");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("113.51mm","28.58mm","9mm","3.97mm","净重");
        LODOP.ADD_PRINT_LINE("71.97mm","140.23mm","126.18mm","140.52mm",0,1);
        LODOP.ADD_PRINT_LINE("71.7mm","129.12mm","125.92mm","129.41mm",0,1);
        LODOP.ADD_PRINT_TEXT("72.23mm","129.91mm","10.32mm","3.97mm","小写");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("77.42mm","129.91mm","9.53mm","3.97mm","小写");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("83.24mm","130.18mm","9.53mm","3.97mm","小写");
        LODOP.ADD_PRINT_TEXT("90.41mm","130.7mm","9.53mm","3.97mm","小写");
        LODOP.ADD_PRINT_TEXT("96.28mm","130.7mm","9.53mm","3.97mm","小写");
        LODOP.ADD_PRINT_TEXT("102.9mm","130.7mm","9.53mm","3.97mm","小写");
        LODOP.ADD_PRINT_TEXT("108.77mm","130.44mm","9.53mm","3.97mm","小写");
        LODOP.ADD_PRINT_TEXT("113.64mm","130.6mm","9.53mm","3.97mm","小写");
        LODOP.ADD_PRINT_TEXT("113.64mm","130.44mm","9.53mm","3.97mm","小写");
        LODOP.ADD_PRINT_TEXT("71.97mm","149.23mm","13.23mm","3.97mm","  3940");
        LODOP.ADD_PRINT_TEXT("77.26mm","149.23mm","13.23mm","3.97mm","  1860");
        LODOP.ADD_PRINT_TEXT("82.84mm","150.28mm","13.23mm","3.97mm","   0");
        LODOP.ADD_PRINT_TEXT("90.41mm","149.49mm","13.23mm","3.97mm","   0");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("97.08mm","149.23mm","13.23mm","3.97mm","    0");
        LODOP.ADD_PRINT_TEXT("102.9mm","150.02mm","13.23mm","3.97mm","   10");
        LODOP.ADD_PRINT_TEXT("108.72mm","150.28mm","13.23mm","3.97mm","  2070");
        LODOP.ADD_PRINT_TEXT("113mm","150.5mm","13.23mm","3.97mm","  110");
        LODOP.ADD_PRINT_TEXT("120.91mm","148.96mm","15.88mm","3.97mm","   5050");
        LODOP.ADD_PRINT_TEXT("67.2mm","93.4mm","16.4mm","3.97mm","入库仓号");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("67.2mm","141.55mm","10.05mm","2.65mm","30");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("67.47mm","62.97mm","9.53mm","3.97mm","散装");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("72.5mm","111.65mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("77.26mm","111.65mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("83.98mm","111.92mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("90.75mm","111.65mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("97.37mm","111.65mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("102.92mm","111.92mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("108.06mm","110.86mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("113.72mm","111.65mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("72.23mm","62.44mm","34.4mm","3.97mm","    叁仟玖佰肆拾");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("77.26mm","62.44mm","34.4mm","3.97mm","     壹仟捌佰陆拾");
        LODOP.ADD_PRINT_TEXT("83.61mm","62.44mm","34.4mm","3.97mm","        零");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("90.22mm","62.71mm","34.4mm","3.97mm","        零");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("97.63mm","62.44mm","34.4mm","3.97mm","        零");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("102.39mm","62.44mm","34.4mm","3.97mm","        零");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("107.1mm","62.44mm","34.4mm","3.97mm","        零");
        LODOP.ADD_PRINT_TEXT("113.74mm","61.04mm","34.4mm","3.97mm","        零");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("120.65mm","50.8mm","10.85mm","3.97mm","2.44");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("121.18mm","19.05mm","26.46mm","3.44mm","单价(元/公斤)");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("126.21mm","61.65mm","118.3mm","61.94mm",0,1);
        LODOP.ADD_PRINT_TEXT("120.39mm","47.36mm","3.18mm","3.97mm","Y");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("118.27mm","75.14mm","126.18mm","75.43mm",0,1);
        LODOP.ADD_PRINT_LINE("118.27mm","86.25mm","134.17mm","86.55mm",0,1);
        LODOP.ADD_PRINT_TEXT("118.53mm","64.56mm","9.26mm","8.47mm","金额\r\n(元)");
        LODOP.ADD_PRINT_TEXT("121.18mm","76.46mm","9.53mm","3.97mm","大写");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("120.39mm","88.11mm","30.69mm","5.29mm","伍仟零伍拾元捌角");
        LODOP.ADD_PRINT_TEXT("128.85mm","37.57mm","26.46mm","3.97mm","中国银行");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("134.2mm","117.48mm","125.7mm","117.77mm",0,1);
        LODOP.ADD_PRINT_TEXT("129.12mm","92.87mm","16.4mm","3.7mm","银行卡号");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("136mm","20.64mm","32.28mm","3.97mm","保管员签字及意见：");
        LODOP.ADD_PRINT_TEXT("28.31mm","180.18mm","21.96mm","27.78mm","\r\n售粮人签字\r\n  (或印)");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("68.2mm","180.59mm","22.49mm","5.29mm","监管员签字");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("100.22mm","180.39mm","23.81mm","5.29mm","财务复核签字");
        LODOP.ADD_PRINT_LINE("40.48mm","125.15mm","65.09mm","125.41mm",0,1);
        LODOP.ADD_PRINT_LINE("39.95mm","161.93mm","65.35mm","162.22mm",0,1);
        LODOP.ADD_PRINT_TEXT("128.59mm","128.06mm","48.68mm","3.97mm","622225252232655");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("144.99mm","7.94mm","198.97mm","7.94mm","注：本表一式四联，一联委托收储库点留存（白联）、二联售粮人留存(绿联、售粮人凭此单据出门)、三联直属库监管科留存(黄联)、四联直属财务科留存(红联)");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
        LODOP.SET_PRINT_STYLEA(0,"Bold",1);
        LODOP.PRINT_SETUP();
    };


    var currDate = new Date();
    $scope.print_preview = function () {
        $scope.doding = false;
        $scope.cardno = $("#smart_card").val();
        $http({
            url: "/outin/loadOutinAll",
            method: 'POST',
            data: {cardno: $scope.cardno},
            async: true
        }).success(function (response) {
            if (response.success) {
                $scope.outinAll = response.data;
                $("#jsweight").val($scope.jsweight);
                $scope.print_preview_1();
            }
        });

    }
    $scope.print_preview_1 = function () {

        var jsweight = $("#jsweight").val();
        jsweight = parseInt(jsweight*1);
        var jsprice = $("#jsprice").val();
        var jsmoney = $("#jsmoney").val();

        var bankname = $("#bankname").val();
        var bankcard = $("#bankcard").val();

        //质检扣量
        var detailMap = eval("(" + $scope.outinAll.outinTare.memo + ")");
        var lldetail = eval("(" + $scope.outinAll.outinQualityResult.memo + ")");
        var lvDetail=lldetail.qualitys;
        LODOP = getLodop();
        var dyYear=$("#dydtt").val();
        if(dyYear==''){
            dyYear=currDate.getFullYear()+"年小麦最低收购价收购结算凭证";
        }
        LODOP.PRINT_INITA(10,9,800,600,"结算打印");
        LODOP.ADD_PRINT_RECT("20.37mm","5.29mm","200mm","120.99mm",0,1);
        // LODOP.ADD_PRINT_TEXT("","75.14mm","12.17mm","5.29mm",currDate.getFullYear());
        LODOP.SET_PRINT_STYLEA(0,"FontSize",12);
        LODOP.SET_PRINT_STYLEA(0,"Bold",1);
        LODOP.ADD_PRINT_TEXT("4.23mm","70.99mm","69.53mm","8.2mm",dyYear);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
        LODOP.ADD_PRINT_TEXT("14.82mm","6.88mm","70.12mm","5.29mm","填写单位：信阳山信恒盛粮油储备有限公司");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("15.08mm","105.83mm","3.18mm","3.97mm",currDate.getFullYear());
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("16.14mm","109.01mm","5.56mm","2.65mm","年");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("15.61mm","114.56mm","3.18mm","3.97mm",currDate.getMonth() + 1);
        LODOP.ADD_PRINT_TEXT("16.14mm","118.53mm","5.82mm","3.18mm","月");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("16.14mm","123.03mm","5.03mm","2.65mm",currDate.getDate());
        LODOP.ADD_PRINT_TEXT("16.14mm","126.21mm","4.5mm","3.97mm","日");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("15.61mm","169.86mm","14.29mm","3.97mm","编号：");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("15.35mm","184.68mm","14.29mm","3.97mm","");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("26.99mm","18.79mm","26.7mm","204.5mm",0,1);
        LODOP.ADD_PRINT_LINE("141.29mm","18.79mm","20.4mm","19.08mm",0,1);
        LODOP.ADD_PRINT_LINE("40.3mm","5.29mm","40.01mm","178.09mm",0,1);
        LODOP.ADD_PRINT_LINE("65.38mm","5.03mm","65.09mm","204.81mm",0,1);
        LODOP.ADD_PRINT_LINE("118.59mm","5.56mm","118.3mm","178.06mm",0,1);
        LODOP.ADD_PRINT_TEXT("28.58mm","8.47mm","9.53mm","5.29mm","登记");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("50.8mm","8.2mm","7.94mm","5.29mm","检验");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("84.4mm","9mm","8.73mm","5.29mm","检斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("125.94mm","5.29mm","126.23mm","204.28mm",0,1);
        LODOP.ADD_PRINT_LINE("133.88mm","4.76mm","134.17mm","205.05mm",0,1);
        LODOP.ADD_PRINT_TEXT("120.39mm","7.41mm","10.32mm","3.97mm","结算");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("128.06mm","5.82mm","13.23mm","5.29mm","开户行");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("136mm","7.14mm","10.05mm","3.97mm","入仓");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("125.99mm","178.06mm","27.81mm","178.36mm",0,1);
        LODOP.ADD_PRINT_LINE("33.34mm","19.05mm","33.63mm","178.04mm",0,1);
        LODOP.ADD_PRINT_LINE("71.7mm","19.05mm","71.99mm","178.04mm",0,1);
        LODOP.ADD_PRINT_LINE("76.33mm","19.05mm","76.62mm","177.85mm",0,1);
        LODOP.ADD_PRINT_LINE("81.99mm","16.06mm","81.2mm","177.96mm",0,1);
        LODOP.ADD_PRINT_LINE("89.09mm","19.58mm","89.59mm","178.57mm",0,1);
        LODOP.ADD_PRINT_LINE("95.44mm","18.79mm","95.73mm","204.79mm",0,1);
        LODOP.ADD_PRINT_LINE("102.29mm","19.31mm","102.58mm","178.12mm",0,1);
        LODOP.ADD_PRINT_LINE("106.31mm","19.31mm","106.6mm","178.12mm",0,1);
        LODOP.ADD_PRINT_LINE("112.18mm","18.79mm","111.89mm","177.77mm",0,1);
        LODOP.ADD_PRINT_LINE("125.89mm","45.51mm","65.59mm","45.8mm",0,1);
        LODOP.ADD_PRINT_LINE("26.99mm","92.08mm","71.49mm","92.37mm",0,1);
        LODOP.ADD_PRINT_LINE("65.11mm","145.52mm","26.51mm","145.81mm",0,1);
        LODOP.ADD_PRINT_LINE("55.59mm","18.79mm","55.3mm","177.59mm",0,1);
        LODOP.ADD_PRINT_LINE("20.11mm","60.85mm","26.7mm","61.15mm",0,1);
        LODOP.ADD_PRINT_LINE("26.38mm","126.21mm","19.79mm","126.5mm",0,1);
        LODOP.ADD_PRINT_TEXT("22.23mm","18.52mm","16.93mm","3.97mm","售粮人：");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("22.49mm","32.81mm","26.46mm","2.65mm",$scope.outinAll.carrier);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("22.49mm","60.85mm","25.14mm","3.97mm","身份证号码：");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("22.49mm","84.14mm","35.72mm","2.65mm",$scope.outinAll.indentitycard);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("22.49mm","127.53mm","14.02mm","3.97mm","地址：");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("22.49mm","139.96mm","61.38mm","3.44mm",$scope.outinAll.outinCarrier.fulladdress);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("28.84mm","46.04mm","26.46mm","3.97mm","到库时间");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("28.84mm","109.8mm","18.26mm","3.97mm","运输工具");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("29.37mm","153.19mm","18.26mm","2.65mm","车（船）号");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("35.19mm","43.39mm","26.46mm","3.97mm",toYMD($scope.outinAll.entrytime));
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("35.19mm","112.45mm","14.55mm","2.65mm","汽车");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("35.45mm","156.37mm","15.08mm","2.65mm",$scope.outinAll.vehicleno);
        LODOP.ADD_PRINT_LINE("65.09mm","32.54mm","39.69mm","32.83mm",0,1);
        LODOP.ADD_PRINT_LINE("65.09mm","47.36mm","39.69mm","47.65mm",0,1);
        LODOP.ADD_PRINT_LINE("65.41mm","64.03mm","40.01mm","64.32mm",0,1);
        LODOP.ADD_PRINT_LINE("65.41mm","75.94mm","40.01mm","76.23mm",0,1);
        LODOP.ADD_PRINT_TEXT("46.04mm","17.99mm","16.67mm","5.29mm","  品种\r\n（代号）");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("47.1mm","35.72mm","9.53mm","5.29mm","产地");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("47.36mm","47.63mm","16.93mm","5.29mm","生产年度");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("47.36mm","65.88mm","10.85mm","3.97mm","等级");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("42.6mm","78.05mm","11.38mm","9mm","出糙率(%)");
        LODOP.ADD_PRINT_TEXT("40.75mm","95.51mm","10.05mm","12.44mm","整精米率（%）");
        LODOP.ADD_PRINT_TEXT("40.75mm","10.721cm","8.47mm","12.44mm","水分(%)");
        LODOP.ADD_PRINT_TEXT("40.22mm","115.15mm","8.73mm","13.76mm","杂质(%)");
        LODOP.ADD_PRINT_TEXT("41.54mm","125.94mm","8.47mm","12.44mm","黄粒米含量(%)");
        LODOP.ADD_PRINT_TEXT("42.33mm","134.94mm","10.85mm","9.79mm","谷外糙米含量(%)");
        LODOP.ADD_PRINT_TEXT("40.48mm","146.31mm","9.53mm","12.7mm","互混率(%)");
        LODOP.ADD_PRINT_TEXT("42.6mm","156.37mm","5.56mm","9.79mm","镉mg/k");
        LODOP.ADD_PRINT_TEXT("43.39mm","167.22mm","10.32mm","8.23mm","色泽气味");
        LODOP.ADD_PRINT_TEXT("58.74mm","18.79mm","17.2mm","5.29mm",$scope.outinAll.varietyname);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59mm","34.4mm","13.49mm","3.97mm", $scope.outinAll.prodplace);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59.27mm","51.33mm","10.32mm","3.97mm", $scope.outinAll.grainyear);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59.27mm","65.88mm","9.79mm","3.97mm",$scope.outinAll.outinQualityResult.gradename);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59.53mm","80.7mm","9mm","3.7mm", lvDetail.出糙率);//出糙率
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59.53mm","96.57mm","11.11mm","3.97mm",lvDetail.整精米率);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59.53mm","108.56mm","11.11mm","3.97mm",lvDetail.水分);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59.53mm","119.57mm","11.11mm","3.97mm",lvDetail.杂质);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("65.09mm","107.55mm","39.69mm","107.84mm",0,1);
        LODOP.ADD_PRINT_TEXT("59.53mm","129.57mm","11.11mm","3.97mm",lvDetail.黄粒米);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("65.09mm","114.54mm","39.69mm","114.83mm",0,1);
        LODOP.ADD_PRINT_TEXT("59.53mm","139.57mm","11.11mm","3.97mm",lvDetail.谷外糙米);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("65.09mm","135.55mm","39.69mm","135.84mm",0,1);
        LODOP.ADD_PRINT_TEXT("59.53mm","149.57mm","11.11mm","3.97mm",lvDetail.互混率);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("65.09mm","155.55mm","39.69mm","155.84mm",0,1);
        LODOP.ADD_PRINT_TEXT("59.53mm","157.56mm","11.11mm","3.97mm",lvDetail.重金属镉);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("59.53mm","167.56mm","11.11mm","3.97mm","正常");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("66.94mm","25.14mm","16.14mm","3.97mm","包装类型");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("71.97mm","26.72mm","11.38mm","3.97mm","毛重");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("77.52mm","26.99mm","11.38mm","3.7mm","皮重");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("84.4mm","24.87mm","16.67mm","3.97mm","水分扣量");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("91.02mm","24.87mm","18.52mm","3.97mm","杂质扣量");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("97.9mm","24.34mm","18.26mm","3.97mm","整精米率扣量");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("102.39mm","21.43mm","23.81mm","3.97mm","黄粒米扣量");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("108.21mm","20.9mm","23.81mm","3.97mm","互混率扣量");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("113.51mm","28.58mm","9mm","3.97mm","净重");
        LODOP.ADD_PRINT_LINE("71.97mm","140.23mm","126.18mm","140.52mm",0,1);
        LODOP.ADD_PRINT_LINE("71.7mm","129.12mm","125.92mm","129.41mm",0,1);
        LODOP.ADD_PRINT_TEXT("72.23mm","129.91mm","10.32mm","3.97mm","小写");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("77.42mm","129.91mm","9.53mm","3.97mm","小写");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("83.24mm","130.18mm","9.53mm","3.97mm","小写");
        LODOP.ADD_PRINT_TEXT("90.41mm","130.7mm","9.53mm","3.97mm","小写");
        LODOP.ADD_PRINT_TEXT("96.28mm","130.7mm","9.53mm","3.97mm","小写");
        LODOP.ADD_PRINT_TEXT("102.9mm","130.7mm","9.53mm","3.97mm","小写");
        LODOP.ADD_PRINT_TEXT("108.77mm","130.44mm","9.53mm","3.97mm","小写");
        LODOP.ADD_PRINT_TEXT("113.64mm","130.6mm","9.53mm","3.97mm","小写");
        LODOP.ADD_PRINT_TEXT("113.64mm","130.44mm","9.53mm","3.97mm","小写");
        LODOP.ADD_PRINT_TEXT("71.97mm","149.23mm","13.23mm","3.97mm",$scope.outinAll.outinGross.grossweight);
        LODOP.ADD_PRINT_TEXT("77.26mm","149.23mm","13.23mm","3.97mm",$scope.outinAll.outinTare.tareweight);
        LODOP.ADD_PRINT_TEXT("82.84mm","150.28mm","13.23mm","3.97mm",detailMap.sf_num);
        LODOP.ADD_PRINT_TEXT("90.41mm","149.49mm","13.23mm","3.97mm",detailMap.zz_num);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("97.08mm","149.23mm","13.23mm","3.97mm",detailMap.zjml_num);
        LODOP.ADD_PRINT_TEXT("102.9mm","150.02mm","13.23mm","3.97mm",detailMap.hlm_num);
        LODOP.ADD_PRINT_TEXT("108.72mm","150.28mm","13.23mm","3.97mm",detailMap.hhl_num);
        LODOP.ADD_PRINT_TEXT("113mm","150.5mm","13.23mm","3.97mm",jsweight);
        LODOP.ADD_PRINT_TEXT("120.91mm","148.96mm","15.88mm","3.97mm",jsmoney);
        LODOP.ADD_PRINT_TEXT("67.2mm","93.4mm","16.4mm","3.97mm","入库仓号");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
        LODOP.ADD_PRINT_TEXT("67.2mm", "114.3mm", "29.1mm", "3.97mm", "信阳山信恒盛");
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
        LODOP.ADD_PRINT_TEXT("67.2mm", "141.55mm", "10.05mm", "2.65mm", $scope.outinAll.housename);
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
        LODOP.ADD_PRINT_TEXT("67.47mm", "62.97mm", "9.53mm", "3.97mm", $scope.outinAll.outinStore.packages);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("72.5mm","111.65mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("77.26mm","111.65mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("83.98mm","111.92mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("90.75mm","111.65mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("97.37mm","111.65mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("102.92mm","111.92mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("108.06mm","110.86mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("113.72mm","111.65mm","11.91mm","3.97mm","公斤");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("72.23mm","62.44mm","34.4mm","3.97mm",intToChinese($scope.outinAll.outinGross.grossweight));
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("77.26mm","62.44mm","34.4mm","3.97mm",intToChinese($scope.outinAll.outinTare.tareweight));
        LODOP.ADD_PRINT_TEXT("83.61mm","62.44mm","34.4mm","3.97mm",intToChinese(detailMap.sf_num));
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("90.22mm","62.71mm","34.4mm","3.97mm",intToChinese(detailMap.zz_num));
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("97.63mm","62.44mm","34.4mm","3.97mm",intToChinese(detailMap.zjml_num));
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("102.39mm","62.44mm","34.4mm","3.97mm",intToChinese(detailMap.hlm_num));
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("107.1mm","62.44mm","34.4mm","3.97mm",intToChinese(detailMap.hhl_num));
        LODOP.ADD_PRINT_TEXT("113.74mm","61.04mm","34.4mm","3.97mm",intToChinese($scope.outinAll.outinTare.netweight));
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("120.65mm","50.8mm","10.85mm","3.97mm",jsprice);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("120.65mm","19.05mm","26.46mm","3.44mm","单价(元/公斤)");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("126.21mm","61.65mm","118.3mm","61.94mm",0,1);
        LODOP.ADD_PRINT_TEXT("120.39mm","47.36mm","3.18mm","3.97mm","￥");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("118.27mm","75.14mm","126.18mm","75.43mm",0,1);
        LODOP.ADD_PRINT_LINE("118.27mm","86.25mm","134.17mm","86.55mm",0,1);
        LODOP.ADD_PRINT_TEXT("118.53mm","64.56mm","9.26mm","8.47mm","金额\r\n(元)");
        LODOP.ADD_PRINT_TEXT("121.18mm","76.46mm","9.53mm","3.97mm","大写");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("120.39mm","88.11mm","30.69mm","5.29mm",smalltoBIG(jsmoney));
        LODOP.ADD_PRINT_TEXT("128.85mm","37.57mm","26.46mm","3.97mm",bankname);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_LINE("134.2mm","117.48mm","125.7mm","117.77mm",0,1);
        LODOP.ADD_PRINT_TEXT("129.12mm","92.87mm","16.4mm","3.7mm","银行卡号");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("136mm","20.64mm","32.28mm","3.97mm","保管员签字及意见：");
        LODOP.ADD_PRINT_TEXT("28.31mm","180.18mm","21.96mm","27.78mm","\r\n售粮人签字\r\n  (或印)");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("68.2mm","180.59mm","22.49mm","5.29mm","监管员签字");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("100.22mm","180.39mm","23.81mm","5.29mm","财务复核签字");
        LODOP.ADD_PRINT_LINE("40.48mm","125.15mm","65.09mm","125.41mm",0,1);
        LODOP.ADD_PRINT_LINE("39.95mm","161.93mm","65.35mm","162.22mm",0,1);
        LODOP.ADD_PRINT_TEXT("128.59mm","128.06mm","48.68mm","3.97mm",bankcard);
        LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
        LODOP.ADD_PRINT_TEXT("144.99mm","7.94mm","198.97mm","7.94mm","注：本表一式四联，一联委托收储库点留存（白联）、二联售粮人留存(绿联、售粮人凭此单据出门)、三联直属库监管科留存(黄联)、四联直属财务科留存(红联)");
        LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
        LODOP.SET_PRINT_STYLEA(0,"Bold",1);
        LODOP.PREVIEW();

    }


    /** 数字金额大写转换(可以处理整数,小数,负数) */
    function smalltoBIG(n) {
        var fraction = ['角', '分'];
        var digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
        var unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']];
        var head = n < 0 ? '欠' : '';
        n = Math.abs(n);

        var s = '';

        for (var i = 0; i < fraction.length; i++) {
            s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
        }
        s = s || '整';
        n = Math.floor(n);

        for (var i = 0; i < unit[0].length && n > 0; i++) {
            var p = '';
            for (var j = 0; j < unit[1].length && n > 0; j++) {
                p = digit[n % 10] + unit[1][j] + p;
                n = Math.floor(n / 10);
            }
            s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
        }
        return head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
    }


    function toYMD(str) {
        var result;
        result = str.substring(0, 4) + "年"+str.substring(4, 6) + "月" + str.substring(6, 8) + "日" + str.substring(8, 10) + "时" + str.substring(10, 12) + "分";
        return result;

    }


    function intToChinese(str) {
        str = str + '';
        var len = str.length - 1;
        var idxs = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿'];
        var num = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
        if (str == '0') {
            return '零';
        } else {
            return str.replace(/([1-9]|0+)/g, function ($, $1, idx, full) {
                var pos = 0;
                if ($1[0] != '0') {
                    pos = len - idx;
                    if (idx == 0 && $1[0] == 1 && idxs[len - idx] == '十') {
                        return idxs[len - idx];
                    }
                    return num[$1[0]] + idxs[len - idx];
                } else {
                    var left = len - idx;
                    var right = len - idx + $1.length;
                    if (Math.floor(right / 4) - Math.floor(left / 4) > 0) {
                        pos = left - left % 4;
                    }
                    if (pos) {
                        return idxs[pos] + num[$1[0]];
                    } else if (idx + $1.length >= len) {
                        return '';
                    } else {
                        return num[$1[0]]
                    }
                }
            });
        }
    }


}]);


