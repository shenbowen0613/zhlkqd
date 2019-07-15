/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('tempViewController', ['$scope', '$http', '$stateParams', function ($scope, $http, $stateParams) {
    $("#houseName").html($stateParams.name); //设置仓名
    $("#inspectionTime").html($stateParams.time == null ? '' : formatDate($stateParams.time)); //设置检测时间
    $scope.tempId = $stateParams.id; //获取检测编码
    $scope.backurl = $stateParams.backurl;//返回路径
    angular.element("#topBar").append(getHtmlInfos("app/views/base/to_back.html", "返回", "goGrain")); //添加功能按钮
    $("#goGrain").click(function () {
        window.location.href = "#/grain/" + $scope.backurl;
    });
    var fengcengxinxi = [0];

    $scope.rowData;
    var cengShuJuS = [];
    // var hangShuJuS = [];

    // var showArr = [];
    // var data1 = [];
    // var data2 = [];
    // var data3 = [];
    // var data4 = [];

    // var gridData1 = [{},{},{},{},{},{},{},{},{},{}];
    // var gridData2 = [{},{},{},{},{},{},{},{},{},{}];
    // var gridData3 = [{},{},{},{},{},{},{},{},{},{}];
    // var gridData4 = [{},{},{},{},{},{},{},{},{},{}];
    //var color = ['#1710c0', '#0b9df0', '#00fea8', '#00ff0d', '#f5f811', '#f09a09', '#fe0300'];
    $scope.data;
    $scope.xzb;
    $scope.getTempData = function (num) {
        $.ajax({
            type: "POST",
            url: '/grain/inspectionMultiStorey',
            dataType: 'json',
            data: {
                code: $stateParams.housecode,
                checkkind: 2,
                storey: num,
                date: $stateParams.time.substr(0, 8)
            },
            async: false,
            "success": function (result) {
                if (result.data != null) {
                    var xyzlist = [];

                    var wdmax = $scope.arraymax(result.data.list);
                    var wdmix = $scope.arraymix(result.data.list);
                    $scope.xzb = Number(result.data.maxXY.maxx) + 1;
                     var xzb = Number(result.data.maxXY.maxx) + 1;
                    for (var i = 0; i < result.data.list.length; i++) {
                        var wddata = result.data.list[i];
                        // xyzlist[i] = [wddata.xaxis,wddata.yaxis-1,num,Number(wddata.data)]
                        var clo = Math.floor(Number(wddata.data) / 5);
                        if (clo > 6) {
                            clo = 6;
                        } else if (clo < 0) {
                            clo = 0;
                        }
                        if (wdmax == Number(wddata.data)) {
                            xyzlist[i] = {
                                name: '温度',
                                value: [xzb - wddata.xaxis, wddata.yaxis - 1, 5 - wddata.storey, Number(wddata.data)],
                                itemStyle: {color: "#FF0000"}
                            };
                        } else if (wdmix == Number(wddata.data)) {
                            xyzlist[i] = {
                                name: '温度',
                                value: [xzb - wddata.xaxis, wddata.yaxis - 1, 5 - wddata.storey, Number(wddata.data)],
                                itemStyle: {color: "#0000FF"}
                            };
                        } else {
                            xyzlist[i] = {
                                name: '温度',
                                value: [xzb - wddata.xaxis, wddata.yaxis - 1, 5 - wddata.storey, Number(wddata.data)],
                                itemStyle: {color: "#00ff0d"}
                            };
                        }
                    }
                    $scope.maxMin = result.data.maxMin;
                    $scope.showTempData(Number(result.data.maxXY.maxx), Number(result.data.maxXY.maxy), xyzlist);

                    //$scope.getPrintData(result.data.list);
                    $scope.data = result.data.list;
                }
            }
        })
    };


    $scope.print_page = function () {
        //铺设页面
        $scope.getPrintData($scope.data, $stateParams.housecode, $stateParams.time);
        $("#showData1").hide();
        $("#showData2").hide();
        $("#showData").hide();
        $("#printPage").show();

        // var newstr = document.getElementById("printPage").innerHTML;
        // var oldstr = document.body.innerHTML;
        // document.body.innerHTML = newstr;
        // window.print();
        // document.body.innerHTML = oldstr;
        // document.body.innerHTML = "";
        // window.location.reload();
        $("#printPage").hide();
        $("#showData1").show();
        $("#showData2").show();
        $("#showData").show();
        // return false;
    }


    var row = [];
    $scope.getPrintData = function (data, housecode, time) {
        for (var n = 1; n < 6; n++) {
            var storey = [];
            var col1 = [];
            var col2 = [];
            var col3 = [];
            var col4 = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].yaxis == n) {
                    //判断属于第几ceng的数据
                    if (data[i].storey == 1) {
                        col1[data[i].xaxis] = data[i].data;
                        storey[data[i].storey] = col1;
                    }
                    if (data[i].storey == 2) {
                        col2[data[i].xaxis] = data[i].data;
                        storey[data[i].storey] = col2;
                    }
                    if (data[i].storey == 3) {
                        col3[data[i].xaxis] = data[i].data;
                        storey[data[i].storey] = col3;
                    }
                    if (data[i].storey == 4) {
                        col4[data[i].xaxis] = data[i].data;
                        storey[data[i].storey] = col4;
                    }
                }
                if (i == data.length - 1) {
                    row[n] = storey;
                }
            }
        }
        //获取每一层的最高、最低、周均、内均及平均温度等信息
        $scope.loadStorey(housecode, time, 1);
        $scope.loadStorey(housecode, time, 2);
        $scope.loadStorey(housecode, time, 3);
        $scope.loadStorey(housecode, time, 4);

        //获整仓的最高与最低 平均
        var houseMax;
        var houseMin;
        for (var i = 1, n = $scope.fencengshuju.length; i < n; i++) {
            if (i == 1) {
                houseMax = $scope.fencengshuju[1].maxData;
                houseMin = $scope.fencengshuju[1].minData;
                houseAvge = parseFloat("0.0");
            } else {
                if (Number(houseMax) < Number($scope.fencengshuju[i].maxData)) {
                    houseMax = $scope.fencengshuju[i].maxData
                }
                if (Number(houseMin) > Number($scope.fencengshuju[i].minData)) {
                    houseMin = $scope.fencengshuju[i].minData;
                }
            }
        }
        var houseAvge = $scope.arrayavge(data);

        var html01="";
        var housename=$stateParams.name;
        if(housename.length>10){
            housename = "x号仓";
        }
        for(var curx=1;curx<$scope.xzb;curx++){
            html01 += "                    <td class=\"xl101\">第 "+curx+" 列</td>\n";
        }
        var html = "<table width=\"1082\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style='width:811.50pt;border-collapse:collapse;table-layout:fixed;'>\n" +
            "                <col width=\"72\" span=\"2\" class=\"xl93\" style='mso-width-source:userset;mso-width-alt:2304;'/>\n" +
            "                <col width=\"93\" span=\"9\" style='mso-width-source:userset;mso-width-alt:2976;'/>\n" +
            "                <col width=\"101\" style='mso-width-source:userset;mso-width-alt:3232;'/>\n" +
            "                <tr height=\"43\" style='height:32.25pt;'>\n" +
            "                    <td class=\"xl94\" height=\"43\" width=\"1082\" colspan=\"12\" style='height:32.25pt;width:811.50pt;border-right:none;border-bottom:2.0pt double;text-align: center;font-size: 24px;' >信阳山信恒盛粮油储备有限公司</td>\n" +
            "                </tr>\n" +
            "                <tr height=\"35\" style='height:26.25pt;'>\n" +
            "                    <td class=\"xl95\" height=\"35\" colspan=\"12\" style='height:26.25pt;border-right:none;border-bottom:none;text-align: center' >" + housename + "<span style='mso-spacerun:yes;'>&nbsp;&nbsp; </span>粮情报表</td>\n" +
            "                </tr>\n" +
            "                <tr height=\"30\" style='height:22.50pt;'>\n" +
            "                    <td class=\"xl96\" height=\"30\" colspan=\"2\" style='height:22.50pt;border-right:none;border-bottom:.5pt solid windowtext;' >天气：晴</td>\n" +
            "                    <td class=\"xl97\" >西</td>\n" +
            "                    <td class=\"xl98\" colspan=\"9\" style='border-right:none;border-bottom:.5pt solid;text-align: right' >检测时间：" + formatDate($stateParams.time) + "<span style='mso-spacerun:yes;'>&nbsp;</span></td>\n" +
            "                </tr>\n" +
            "\n" +
            "                <tr height=\"30\" style='height:22.50pt;'>\n" +
            "                    <td class=\"xl99\" height=\"30\" style='height:22.50pt;'></td>\n" +
            "                    <td class=\"xl100\"></td>\n" +
            html01+
            "                </tr>\n";
        for (var d = 1; d < row.length; d++) {
            var html02="";
            for(var curx=1;curx<$scope.xzb;curx++){
                html02 +="     <td class=\"xl100\">-" + d + "-</td>\n";
            }
            html += " <tr height=\"30\" class=\"xl93\" style='height:22.50pt;'>\n" +
                "     <td class=\"xl99\" height=\"30\" style='height:22.50pt;'></td>\n" +
                "     <td class=\"xl100\"></td>\n" +
                html02 +
                "    </tr>";


            for (var f = 1; f < 5; f++) {
                var html2 = "";
                for (var curx = 1; curx < $scope.xzb; curx++) {
                    html2 += "     <td class=\"xl104\" x:str>" + row[d][f][curx] + "</td>\n";
                }
                if (f == 1) {
                    html += "<tr height=\"30\" style='height:22.50pt;'>\n" +
                        "     <td class=\"xl102\" height=\"120\" rowspan=\"4\" style='height:90.00pt;border-right:none;border-bottom:none;' x:str>" + d + "行</td>\n" +
                        "     <td class=\"xl103\" x:str>" + f + "层</td>\n" +
                        html2 +
                        "    </tr>";
                } else {
                    html += "<tr height=\"30\" style='height:22.50pt;'>\n" +
                        "     <td class=\"xl103\" x:str>" + f + "层</td>\n" +
                        html2 +
                        "    </tr>";
                }
            }

        }
        html += "<tr height=\"30\" style='height:22.50pt;'>\n" +
            "     <td class=\"xl106\" height=\"30\" colspan=\"2\" style='height:22.50pt;border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>粮情分析:</td>\n" +
            "     <td class=\"xl106\" colspan=\"10\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str></td>\n" +
            "    </tr>\n" +
            "    <tr height=\"30\" style='height:22.50pt;'>\n" +
            "     <td class=\"xl106\" height=\"30\" colspan=\"2\" style='height:22.50pt;border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str></td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>最高</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>最低</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>平均</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>周均</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>内均</td>\n" +
            "    </tr>\n" +
            "    <tr height=\"30\" style='height:22.50pt;'>\n" +
            "     <td class=\"xl106\" height=\"30\" colspan=\"2\" style='height:22.50pt;border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>1层</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[1].maxData + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[1].minData + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[1].avgData + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[1].zhouAvg + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[1].inAvg + "</td>\n" +
            "    </tr>\n" +
            "    <tr height=\"30\" style='height:22.50pt;'>\n" +
            "     <td class=\"xl106\" height=\"30\" colspan=\"2\" style='height:22.50pt;border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>2层</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[2].maxData + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[2].minData + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[2].avgData + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[2].zhouAvg + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[2].inAvg + "</td>\n" +
            "    </tr>\n" +
            "    <tr height=\"30\" style='height:22.50pt;'>\n" +
            "     <td class=\"xl106\" height=\"30\" colspan=\"2\" style='height:22.50pt;border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>3层</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[3].maxData + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[3].minData + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[3].avgData + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[3].zhouAvg + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[3].inAvg + "</td>\n" +
            "    </tr>\n" +
            "    <tr height=\"30\" style='height:22.50pt;'>\n" +
            "     <td class=\"xl106\" height=\"30\" colspan=\"2\" style='height:22.50pt;border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>4层</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[4].maxData + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[4].minData + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[4].avgData + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[4].zhouAvg + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + $scope.fencengshuju[4].inAvg + "</td>\n" +
            "    </tr>\n" +
            "    <tr height=\"30\" style='height:22.50pt;'>\n" +
            "     <td class=\"xl106\" height=\"30\" colspan=\"2\" style='height:22.50pt;border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>整仓</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + houseMax + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + houseMin + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>" + houseAvge.toFixed(1) + "</td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str><span style='mso-spacerun:yes;'>&nbsp;</span></td>\n" +
            "     <td class=\"xl106\" colspan=\"2\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str><span style='mso-spacerun:yes;'>&nbsp;</span></td>\n" +
            "    </tr>\n" +
            "    <tr height=\"30\" style='height:22.50pt;'>\n" +
            "     <td class=\"xl106\" height=\"30\" colspan=\"3\" style='height:22.50pt;border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>仓温<span style='mso-spacerun:yes;'>&nbsp;&nbsp;&nbsp; </span>25.9</td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>仓湿<span style='mso-spacerun:yes;'>&nbsp;&nbsp;&nbsp; </span>56.4</td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>气温<span style='mso-spacerun:yes;'>&nbsp;&nbsp;&nbsp; </span>0.0</td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>气湿<span style='mso-spacerun:yes;'>&nbsp;&nbsp;&nbsp; </span>0.0</td>\n" +
            "    </tr>\n" +
            "    <tr height=\"30\" style='height:22.50pt;'>\n" +
            "     <td class=\"xl106\" height=\"30\" colspan=\"3\" style='height:22.50pt;border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>仓库类型</td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>/</td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>/</td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>/</td>\n" +
            "    </tr>\n" +
            "    <tr height=\"30\" style='height:22.50pt;'>\n" +
            "     <td class=\"xl106\" height=\"30\" colspan=\"3\" style='height:22.50pt;border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>粮食品种</td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>/</td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>/</td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>/</td>\n" +
            "    </tr>\n" +
            "    <tr height=\"30\" style='height:22.50pt;'>\n" +
            "     <td class=\"xl106\" height=\"30\" colspan=\"3\" style='height:22.50pt;border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>入仓水份</td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str></td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>当前水份</td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str></td>\n" +
            "    </tr>\n" +
            "    <tr height=\"30\" style='height:22.50pt;'>\n" +
            "     <td class=\"xl106\" height=\"30\" colspan=\"3\" style='height:22.50pt;border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>检测人</td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>/</td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>保管员</td>\n" +
            "     <td class=\"xl106\" colspan=\"3\" style='border-right:.5pt solid #000000;border-bottom:.5pt solid #000000;' x:str>/</td>\n" +
            "    </tr>\n" +
            "    <tr height=\"18\" style='height:13.50pt;'>\n" +
            "     <td class=\"xl109\" height=\"72\" colspan=\"6\" rowspan=\"4\" style='height:54.00pt;border-right:.5pt solid windowtext;border-bottom:.5pt solid windowtext;' x:str>储粮安危及虫害处理情况：</td>\n" +
            "     <td class=\"xl109\" colspan=\"6\" rowspan=\"4\" style='border-right:.5pt solid windowtext;border-bottom:.5pt solid windowtext;' x:str>“一符四无”粮食鉴定意见：</td>\n" +
            "    </tr>\n" +
            "    <tr height=\"18\" style='height:13.50pt;'/>\n" +
            "    <tr height=\"18\" style='height:13.50pt;'/>\n" +
            "    <tr height=\"18\" style='height:13.50pt;'/>\n" +
            "    <tr height=\"30\" style='height:22.50pt;'>\n" +
            "     <td class=\"xl110\" height=\"30\" colspan=\"4\" style='height:22.50pt;border-right:none;border-bottom:none;' x:str>注：#表示层最低温<span style='mso-spacerun:yes;'>&nbsp; </span>*表示层<span style='display:none;'>最高温</span></td>\n" +
            "     <td class=\"xl118\" colspan=\"8\" style='border-right:none;border-bottom:none;' x:str>制表时间：2019-05-30 17:11:44<span style='mso-spacerun:yes;'>&nbsp;&nbsp;&nbsp;</span></td>\n" +
            "    </tr>\n" +
            "    <![if supportMisalignedColumns]>\n" +
            "     <tr width=\"0\" style='display:none;'>\n" +
            "      <td width=\"72\" style='width:54;'></td>\n" +
            "      <td width=\"93\" style='width:70;'></td>\n" +
            "      <td width=\"101\" style='width:76;'></td>\n" +
            "     </tr>\n" +
            "    <![endif]>\n" +
            "   </table>";

        document.getElementById("printPage").innerHTML = html;
    }


    $scope.arraymax = function (data) {
        var max = Number(data[0].data);
        for (var i = 1; i < data.length; i++) {
            if (Number(data[i].data) > max) {
                max = Number(data[i].data);
            }
        }
        return max;
    };


    $scope.arrayavge = function (data) {
        var avge = parseFloat(data[0].data);
        for (var i = 1; i < data.length; i++) {
            avge += parseFloat(data[i].data);
        }
        return avge / data.length;
    };

    $scope.loadStorey = function (hourseCode, time, storeyCode) {
        $.ajax({
            type: "POST",
            url: '/grain/loadStorey',
            dataType: 'json',
            data: {
                code: hourseCode,
                storey: storeyCode,
                time: time
            },
            async: false,
            "success": function (result) {
                if (result.data != null && result.success == true) {
                    fengcengxinxi.push(result.data);
                    $scope.fencengshuju = fengcengxinxi;
                }
            }
        })
    }

    $scope.arraymix = function (data) {
        var mix = Number(data[0].data);
        for (var i = 1; i < data.length; i++) {
            if (Number(data[i].data) < mix) {
                mix = Number(data[i].data);
            }
        }
        return mix;
    };
    $scope.showTempData = function (x, y, data) {
        var myChart = echarts.init(document.getElementById('showData'));
        var option = {
            tooltip: {},
            // visualMap: [{
            //     max: 30,
            //     inRange: {
            //         color: ['#1710c0', '#0b9df0', '#00fea8', '#00ff0d', '#f5f811', '#f09a09', '#fe0300']
            //     },
            //     textStyle: {
            //         color: '#fff'
            //     }
            // }],
            grid3D: {
                top: -70,
                left: 70,
                boxWidth: 280,
                boxHeight: 85,
                boxDepth: 100,
                viewControl: {
                    distance: 210,
                    alpha: 30,
                    zoomSensitivity: 0,
                    panSensitivity: 0,
                    rotateSensitivity: 0,
                    beta: 0
                }
            },
            xAxis3D: {
                type: 'value',
                interval: 1,
                max: x
            },
            yAxis3D: {
                type: 'value',
                interval: 1,
                max: y
            },
            zAxis3D: {
                type: 'value',
                interval: 1,
                max: 4
            },
            series: [
                {
                    type: 'scatter3D',
                    dimensions: [
                        "x",
                        "z",
                        "y",
                        "温度"
                    ],
                    label: {
                        show: true
                    },
                    symbolSize: 25,
                    data: data
                }
            ]
        };
        myChart.setOption(option);
    };

    // for (var i = 0; i < 4; i++) {
    //     getTodayData(i + 1);
    // }

    $scope.getTempData();

    $scope.getPrintData($scope.data, $stateParams.housecode, $stateParams.time);
    //
    // $scope.tempOption = function () {
    //     $scope.temp_view_option = {
    //         backgroundColor: '#fcfcfc',//背景色
    //         title: {
    //             text: '检测仪器布点坐标',
    //             x: 'center',
    //             y: 0
    //         },
    //         tooltip: {
    //             trigger: 'item',
    //             formatter: function (params, ticket, callback) {
    //                 var res;
    //
    //                 res = params.seriesName + "<br/>" + "位置：" + params.data[0] + "-" + params.data[1] + "<br/>" + "温度：" + params.data[2] + "°C";
    //                 setTimeout(function () {
    //                     callback(ticket, res);
    //                 }, 100)
    //                 return 'loading';
    //             }
    //         },
    //         visualMap: {
    //             min: 25,
    //             max: 45,
    //             show: false,
    //             calculable: true,
    //             realtime: false,
    //             inRange: {
    //                 color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
    //                 opacity: "1",
    //                 colorLightness: "0.5",
    //                 colorSaturation: "0.5"
    //
    //             }
    //         },
    //         xAxis: [{gridIndex: 0, min: 0, max: 10, interval: 1}],
    //         yAxis: [{gridIndex: 0, min: 0, max: 4}],
    //         series: [
    //             {
    //                 name: '当前信息',
    //                 type: 'scatter',
    //                 symbolSize: 30,
    //                 itemStyle: {
    //                     normal: {
    //                         color: "green",
    //                         label: {show: true}
    //                     }
    //                 },
    //                 data: $scope.tmep_data
    //             }
    //         ]
    //     }
    // }
    //
    //
    // $scope.tempOption();
    // // relodetable(gridData1);
    //
    // //切换显示层温
    // $scope.showTemp = function (val) {
    //
    //     if (val == 1) {
    //         $scope.tmep_data = data1;
    //         $scope.tempOption();
    //         // relodetable(gridData1);
    //     } else if (val == 2) {
    //         $scope.tmep_data = data2;
    //         $scope.tempOption();
    //         // relodetable(gridData2);
    //     } else if (val == 3) {
    //         $scope.tmep_data = data3;
    //         $scope.tempOption();
    //         // relodetable(gridData3);
    //     } else if (val == 4) {
    //         $scope.tmep_data = data4;
    //         $scope.tempOption();
    //         // relodetable(gridData4);
    //     }
    // }


    //
    // function formetDu(data) {
    //     if(data!=null&&data!=""){
    //         return data + "°C";
    //     }else{
    //         return "";
    //     }
    // }


    //重置表格数据
    // var table;
    // function relodetable(data){
    //     var html = '<table id="tempViewTableGrids" class="row-border hover"></table>';
    //     $("#gridDiv").html(html);
    //     table = $('#tempViewTableGrids').DataTable({
    //         searching: false,                      //不显示搜索框
    //         processing: true,                    //加载数据时显示正在加载信息
    //         showRowNumber: true,
    //         bPaginate:false,                     //不显示分页
    //         sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(0).nodes().each(function(cell, i) {if (i>3){ return; }else {cell.innerHTML =  i + 1; }});},
    //         bPaginate:false,pageLength: 9999,                    //每页显示20条数据
    //         data: data,
    //         aoColumns: [
    //             //{mDataProp: "id", sTitle: "id"},
    //             {sTitle: "", width: "5%"},
    //             {mDataProp: "x1", sTitle: "X1",orderable:false,render:formetDu},
    //             {mDataProp: "x2", sTitle: "X2",orderable:false,render:formetDu},
    //             {mDataProp: "x3", sTitle: "X3",orderable:false,render:formetDu},
    //             {mDataProp: "x4", sTitle: "X4",orderable:false,render:formetDu},
    //             {mDataProp: "x5", sTitle: "X5",orderable:false,render:formetDu},
    //             {mDataProp: "x6", sTitle: "X6",orderable:false,render:formetDu},
    //             {mDataProp: "x7", sTitle: "X7",orderable:false,render:formetDu},
    //             {mDataProp: "x8", sTitle: "X8",orderable:false,render:formetDu},
    //             {mDataProp: "x9", sTitle: "X9",orderable:false,render:formetDu},
    //             {mDataProp: "x10", sTitle: "X10",orderable:false,render:formetDu},
    //             // {mDataProp: "x11", sTitle: "X11",orderable:false,render:formetDu},
    //             // {mDataProp: "x12", sTitle: "X12",orderable:false,render:formetDu},
    //             // {mDataProp: "x13", sTitle: "X13",orderable:false,render:formetDu},
    //             // {mDataProp: "x14", sTitle: "X14",orderable:false,render:formetDu},
    //             // {mDataProp: "x15", sTitle: "X15",orderable:false,render:formetDu},
    //             // {mDataProp: "x16", sTitle: "X16",orderable:false,render:formetDu},
    //             // {mDataProp: "x17", sTitle: "X17",orderable:false,render:formetDu},
    //             // {mDataProp: "x18", sTitle: "X18",orderable:false,render:formetDu},
    //             // {mDataProp: "x19", sTitle: "X19",orderable:false,render:formetDu},
    //             // {mDataProp: "x20", sTitle: "X20",orderable:false,render:formetDu}
    //
    //         ],
    //         aoColumnDefs: [//设置列的属性
    //             {
    //                 bSortable: false,
    //                 data: null,
    //                 targets: 0
    //             }
    //         ]
    //     });
    //     table.draw();
    //     //添加序号
    // }


}]);

