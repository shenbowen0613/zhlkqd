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

     $scope.getTempData=function(num) {
        $.ajax({
            type: "POST",
            url: '/grain/inspectionMultiStorey',
            dataType: 'json',
            data: {
                code: $stateParams.housecode,
                checkkind: 2,
                storey: num,
                date: $stateParams.time.substr(0,8)
            },
            async: false,
            "success": function (result) {
                if (result.data != null) {
                    var listData = result.data.list;
                    $scope.maxxy = result.data.maxXY;
                    $scope.maxMin = result.data.maxMin;
                    // hangShuJuS=[maxxy.maxx];
                    // cengShuJuS=[maxxy.maxy];
                    for (var i = 0; i < listData.length; i++) {
                        var oneData = listData[i];
                        if (cengShuJuS[oneData.yaxis - 1] === undefined) {
                            cengShuJuS[oneData.yaxis - 1] = [];
                        }
                        cengShuJuS[oneData.yaxis - 1][oneData.xaxis - 1] = oneData.data;
                        // showArr = [oneData.xaxis,oneData.yaxis,oneData.data];
                        // dataArrs.push(showArr);
                    }
                    console.log(cengShuJuS);
                    $scope.showTempData(cengShuJuS);
                    // console.log("dataArrs",dataArrs);
                    // if(num==1){
                    //     data1=dataArrs;
                    //     // gridData1[parseInt(showArr[1])-1]['x'+showArr[0]] = showArr[2];
                    // }else if(num==2){
                    //     data2=dataArrs;
                    //     // gridData2[parseInt(showArr[1])-1]['x'+showArr[0]] = showArr[2];
                    // }else if(num==3){
                    //     data3=dataArrs;
                    //     // gridData3[parseInt(showArr[1])-1]['x'+showArr[0]] = showArr[2];
                    // }else{
                    //     data4=dataArrs;
                    //     // gridData4[parseInt(showArr[1])-1]['x'+showArr[0]] = showArr[2];
                    // }
                }
            }
        })
    }

    $scope.showTempData=function(showData){
            var maxx=$scope.maxxy.maxx;
            var maxy=$scope.maxxy.maxy;
            var maxD=$scope.maxMin.maxD;
            var minD=$scope.maxMin.minD;
            var htmlStr = "<div style='margin-left: 20px;margin-bottom:15px'><a style='background-color: red'>&nbsp;&nbsp;最高温度："+maxD+"&nbsp;&nbsp;</a><a style='margin-left: 20px;background-color: blue'>&nbsp;&nbsp;最低温度："+minD+"&nbsp;&nbsp;</a></div>";
            while (maxy>0){
                htmlStr += "<div style='margin-bottom:15px'>";
                for (var i=0;i<maxy;i++){
                    htmlStr += "&nbsp;";
                }
                htmlStr += "第"+maxy+"行:"
                for (var j=0;j<=maxx;j++){
                    htmlStr += "&nbsp;&nbsp;&nbsp;&nbsp;";
                    var curD=showData[maxy-1][j];
                    // while (curD.length<4){
                    //     curD = curD +"0";
                    // }
                    if (maxD*1==curD*1) {
                        htmlStr += "<a style='background-color: red'>&nbsp;"+curD+"&nbsp;</a>";
                    }else if (minD*1==curD*1) {
                        htmlStr += "<a style='background-color: blue'>&nbsp;"+curD+"&nbsp;</a>";
                    }else{
                        htmlStr += "<a style='background-color: gainsboro'>&nbsp;"+curD+"&nbsp;</a>";
                    }
                }
                htmlStr += "</div>";
                maxy--;
            }
            $("#showData").html(htmlStr);
    }

    // for (var i = 0; i < 4; i++) {
    //     getTodayData(i + 1);
    // }

    $scope.getTempData(1);

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

