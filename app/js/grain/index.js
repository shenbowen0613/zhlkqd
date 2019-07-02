/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
var selHouseCode;
var selHouseName;
var table;
App.controller('grainBarController', ['$scope', '$http', 'ngDialog', function ($scope) {
    $scope.menus = menuItems;
}]);
//温度控制器
App.controller('tempController', ['$scope', '$http', 'ngDialog', function ($scope) {
    $scope.tempInspection();
}]);
//湿度控制器
App.controller('humrityController', ['$scope', '$http', 'ngDialog', function ($scope) {
    $scope.humrityInspection();
}]);
// //气体浓度控制器
// App.controller('gasController', ['$scope', '$http', 'ngDialog', function ($scope) {
//     $scope.gasInspection();
// }]);
// //虫害控制器
// App.controller('pestController', ['$scope', '$http', 'ngDialog', function ($scope) {
//     $scope.pestInspection();
// }]);

App.controller('grainController', ['$scope', '$http', 'ngDialog', '$rootScope', function ($scope, $http, ngDialog, $rootScope) {
    $rootScope.app.navbarTitle = "粮情检测系统"; //设置头部提示信息
    $scope.gridtableid = "grainTableGrids"; //数据列表id

    $('#starttime').datetimepicker({ //加载日期插件
        todayBtn: 1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        minView: 2, //最小显示单位  2 代表到天
        todayHighlight: 1 //今天日期高亮
    });
    $('#endtime').datetimepicker({ //加载日期插件
        todayBtn: 1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        minView: 2, //最小显示单位  2 代表到天
        todayHighlight: 1 //今天日期高亮
    });


    //点击仓房，加载信息
    $scope.toDateSerach = function () {
        $scope.tempInspection();
        $scope.humrityInspection();
        $('#' + $scope.gridtableid).DataTable().draw();
    }


    $.ajax({ //获取仓房信息
        url: '/la/house/tree',
        method: 'POST',
        async: false
    }).success(function (result) {
        if (result.success) {
            angular.forEach(result.data, function (data, index, array) {
                if (index == 5 || index == 9 || index == 14) {
                    // data.stl = "btn-danger";
                    data.stl = "btn-default";
                } else {
                    data.stl = "btn-default";
                }
            });
            $scope.houseItems = result.data;

            if ($scope.houseItems.length > 0) {
                selHouseCode = $scope.houseItems[0].code; //设置当前仓房编码
                selHouseName = $scope.houseItems[0].label;
                $("#houseName").html("- " + selHouseName); //设置选中的当前仓房名
            }
        }
    });
    $scope.tempInspection = function () { //温度图表
        $scope.opt_title = "温度";
        $scope.opt_legend = ['仓内温', '仓外温', '平均温', '最低温', '最高温'];
        var pData = {
            code: selHouseCode,
            starttime: $scope.starttime,
            endtime: $scope.endtime
        };
        $.ajax({ //首次进入，获取温度信息
            url: '/grain/inspectionTempChars',
            method: 'POST',
            data: pData,
            async: false
        }).success(function (result) {
            if (result.success && result.data.aaData.length > 0) {
                var axisObj = [];
                var dataObj1 = [];
                var dataObj2 = [];
                var dataObj3 = [];
                var dataObj4 = [];
                var dataObj5 = [];
                angular.forEach(result.data.aaData, function (data) {
                    axisObj.push(formatDate(data.checktime));
                    dataObj1.push(data.innert);
                    dataObj2.push(data.outt);
                    dataObj3.push(data.avgt);
                    dataObj4.push(data.lowt);
                    dataObj5.push(data.hight);
                });
                $scope.opt_xAxis = axisObj;
                $scope.data1 = dataObj1;
                $scope.data2 = dataObj2;
                $scope.data3 = dataObj3;
                $scope.data4 = dataObj4;
                $scope.data5 = dataObj5;
            }
        });
        $scope.temp_option = {
            backgroundColor: '#EEE5DE',//背景色
            title: {
                text: $scope.opt_title
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params, ticket, callback) {

                    var res;
                    if (typeof(params[0]) == "undefined") {
                        res = params.name + "<br/>" + params.seriesName + " : " + params.data.value + "°C"
                    } else {
                        res = params[0].name;
                        for (var i = 0, l = params.length; i < l; i++) {
                            res += '<br/>' + params[i].seriesName + ' : ' + params[i].value + "°C";
                        }
                    }
                    setTimeout(function () {
                        callback(ticket, res);
                    }, 100)
                    return 'loading';
                }
            },
            legend: {
                data: $scope.opt_legend
            },
            toolbox: {
                show: false,
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    dataView: {readOnly: false},
                    magicType: {type: ['line', 'bar']},
                    restore: {},
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: $scope.opt_xAxis
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} °C'
                }
            },
            series: [
                {
                    name: $scope.opt_legend[0],
                    type: 'line',
                    data: $scope.data1,
                    itemStyle: {
                        normal: {
                            color: '#707038',
                            lineStyle: {
                                color: '#707038'
                            }
                        }
                    }
                }
                ,
                {
                    name: $scope.opt_legend[1],
                    type: 'line',
                    data: $scope.data2,
                    itemStyle: {
                        normal: {
                            color: '#3D7878',
                            lineStyle: {
                                color: '#3D7878'
                            }
                        }
                    }
                },
                {
                    name: $scope.opt_legend[2],
                    type: 'line',
                    data: $scope.data3,
                    itemStyle: {
                        normal: {
                            color: '#01814A',
                            lineStyle: {
                                color: '#01814A'
                            }
                        }
                    }
                },
                {
                    name: $scope.opt_legend[3],
                    type: 'line',
                    data: $scope.data4,
                    itemStyle: {
                        normal: {
                            color: '#796400',
                            lineStyle: {
                                color: '#796400'
                            }
                        }
                    }
                },
                {
                    name: $scope.opt_legend[4],
                    type: 'line',
                    data: $scope.data5,
                    itemStyle: {
                        normal: {
                            color: '#003D79',
                            lineStyle: {
                                color: '#003D79'
                            }
                        }
                    }
                }
            ]
        }; //图表数据
    }
    $scope.humrityInspection = function () {
        //重绘图表
        $scope.opt_title = "湿度";
        $scope.opt_legend = ['仓内湿', '仓外湿'];
        var pData = {
            code: selHouseCode,
            starttime: $scope.starttime,
            endtime: $scope.endtime
        };
        $.ajax({ //首次进入，获取温度信息
            url: GserverURL + '/grain/inspectionHumrityChars',
            method: 'POST',
            data: pData,
            async: false
        }).success(function (result) {
            if (result.success && result.data.aaData.length > 0) {
                var axisObj1 = [];
                var dataObj11 = [];
                var dataObj21 = [];
                angular.forEach(result.data.aaData, function (data) {
                    axisObj1.push(formatDate(data.checktime));
                    dataObj11.push(data.inh);
                    dataObj21.push(data.outh);
                });
                $scope.opt_xAxis1 = axisObj1;
                $scope.data11 = dataObj11;
                $scope.data21 = dataObj21;

            }
        });
        $scope.humrity_option = {
            backgroundColor: '#D1EEEE',//背景色
            title: {
                text: $scope.opt_title
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params, ticket, callback) {

                    var res;
                    if (typeof(params[0]) == "undefined") {
                        res = params.name + "<br/>" + params.seriesName + " : " + params.data.value + "%"
                    } else {
                        res = params[0].name;
                        for (var i = 0, l = params.length; i < l; i++) {
                            res += '<br/>' + params[i].seriesName + ' : ' + params[i].value + "%";
                        }
                    }
                    setTimeout(function () {
                        callback(ticket, res);
                    }, 100)
                    return 'loading';
                }
            },
            legend: {
                data: $scope.opt_legend
            },
            toolbox: {
                show: false,
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    dataView: {readOnly: false},
                    magicType: {type: ['line', 'bar']},
                    restore: {},
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: $scope.opt_xAxis1
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} %'
                }
            },
            series: [
                {
                    name: $scope.opt_legend[0],
                    type: 'line',
                    data: $scope.data11,
                    formatter: '{a} %'
                }
                ,
                {
                    name: $scope.opt_legend[1],
                    type: 'line',
                    data: $scope.data21
                }

            ]
        }; //图表数据
    }
    // $scope.gasInspection = function () {
    //     //重绘图表
    //     $scope.opt_title = "气体浓度";
    //     $scope.opt_legend = ['磷化氢', '氮气', '氧气', '二氧化碳'];
    //     var pData = {
    //         code: selHouseCode,
    //         pageSize: 10
    //     };
    //     $.ajax({ //首次进入，获取温度信息
    //         url: GserverURL + '/grain/inspectionGas',
    //         method: 'POST',
    //         data: pData,
    //         async: false
    //     }).success(function (result) {
    //         if (result.success && result.data.aaData.length > 0) {
    //             var axisObj = [];
    //             var dataObj1 = [];
    //             var dataObj2 = [];
    //             var dataObj3 = [];
    //             var dataObj4 = [];
    //             angular.forEach(result.data.aaData, function (data) {
    //                 axisObj.push(data.checktime.substr(8, 2) + ":" + data.checktime.substr(10, 2));
    //                 dataObj1.push(data.phosphineconcentration);
    //                 dataObj2.push(data.nitrogenconcentration);
    //                 dataObj3.push(data.oxygenconcentration);
    //                 dataObj4.push(data.co2concentration);
    //             });
    //             $scope.opt_xAxis = axisObj;
    //             $scope.data1 = dataObj1;
    //             $scope.data2 = dataObj2;
    //             $scope.data3 = dataObj3;
    //             $scope.data4 = dataObj4;
    //         }
    //     });
    //     $scope.gas_option = {
    //         backgroundColor: '#EEE9E9',//背景色
    //         title: {
    //             text: $scope.opt_title
    //         },
    //         tooltip: {
    //             trigger: 'axis',
    //             formatter: function (params, ticket, callback) {
    //
    //                 var res;
    //                 if (typeof(params[0]) == "undefined") {
    //                     res = params.name + "<br/>" + params.seriesName + " : " + params.data.value + "ppm"
    //                 } else {
    //                     res = params[0].name;
    //                     for (var i = 0, l = params.length; i < l; i++) {
    //                         res += '<br/>' + params[i].seriesName + ' : ' + params[i].value + "ppm";
    //                     }
    //                 }
    //                 setTimeout(function () {
    //                     callback(ticket, res);
    //                 }, 100)
    //                 return 'loading';
    //             }
    //         },
    //         legend: {
    //             data: $scope.opt_legend
    //         },
    //         toolbox: {
    //             show: false,
    //             feature: {
    //                 dataZoom: {
    //                     yAxisIndex: 'none'
    //                 },
    //                 dataView: {readOnly: false},
    //                 magicType: {type: ['line', 'bar']},
    //                 restore: {},
    //                 saveAsImage: {}
    //             }
    //         },
    //         xAxis: {
    //             type: 'category',
    //             boundaryGap: false,
    //             data: $scope.opt_xAxis
    //         },
    //         yAxis: {
    //             type: 'value',
    //             axisLabel: {
    //                 formatter: '{value}'
    //             }
    //         },
    //         series: [
    //             {
    //                 name: $scope.opt_legend[0],
    //                 type: 'line',
    //                 data: $scope.data1,
    //                 formatter: '{a} ppm',
    //                 stack: '总量',
    //                 areaStyle: {normal: {}},
    //                 itemStyle: {
    //                     normal: {
    //                         color: '#E1C4C4',
    //                         lineStyle: {
    //                             color: '#E1C4C4'
    //                         }
    //                     }
    //                 }
    //             }
    //             ,
    //             {
    //                 name: $scope.opt_legend[1],
    //                 type: 'line',
    //                 data: $scope.data2,
    //                 stack: '总量',
    //                 areaStyle: {normal: {}},
    //                 itemStyle: {
    //                     normal: {
    //                         color: '#A6A6D2',
    //                         lineStyle: {
    //                             color: '#A6A6D2'
    //                         }
    //                     }
    //                 }
    //             },
    //             {
    //                 name: $scope.opt_legend[2],
    //                 type: 'line',
    //                 data: $scope.data3,
    //                 stack: '总量',
    //                 areaStyle: {normal: {}},
    //                 itemStyle: {
    //                     normal: {
    //                         color: '#81C0C0',
    //                         lineStyle: {
    //                             color: '#81C0C0'
    //                         }
    //                     }
    //                 }
    //             },
    //             {
    //                 name: $scope.opt_legend[3],
    //                 type: 'line',
    //                 data: $scope.data4,
    //                 stack: '总量',
    //                 areaStyle: {normal: {}},
    //                 itemStyle: {
    //                     normal: {
    //                         color: '#B9B973',
    //                         lineStyle: {
    //                             color: '#B9B973'
    //                         }
    //                     }
    //                 }
    //             }
    //         ]
    //     }; //图表数据
    // }
    // $scope.pestInspection = function () {
    //     //重绘图表
    //     $scope.opt_title = "虫害";
    //     $scope.opt_legend = ['虫害', '主要虫害'];
    //     var pData = {
    //         code: selHouseCode,
    //         pageSize: 10
    //     };
    //     $.ajax({ //首次进入，获取温度信息
    //         url: '/grain/inspectionPest',
    //         method: 'POST',
    //         data: pData,
    //         async: false
    //     }).success(function (result) {
    //         if (result.success && result.data.aaData.length > 0) {
    //             var axisObj = [];
    //             var dataObj1 = [];
    //             var dataObj2 = [];
    //             angular.forEach(result.data.aaData, function (data) {
    //                 axisObj.push(data.checktime.substr(8, 2) + ":" + data.checktime.substr(10, 2));
    //                 dataObj1.push(data.pestdensity);
    //                 dataObj2.push(data.mainpestdensity);
    //             });
    //             $scope.opt_xAxis = axisObj;
    //             $scope.data1 = dataObj1;
    //             $scope.data2 = dataObj2;
    //         }
    //     });
    //     $scope.pest_option = {
    //         backgroundColor: '#E0EEE0',//背景色
    //         title: {
    //             text: $scope.opt_title
    //         },
    //         tooltip: {
    //             trigger: 'axis',
    //             formatter: function (params, ticket, callback) {
    //
    //                 var res;
    //                 if (typeof(params[0]) == "undefined") {
    //                     res = params.name + "<br/>" + params.seriesName + " : " + params.data.value + " 头/公斤"
    //                 } else {
    //                     res = params[0].name;
    //                     for (var i = 0, l = params.length; i < l; i++) {
    //                         res += '<br/>' + params[i].seriesName + ' : ' + params[i].value + " 头/公斤";
    //                     }
    //                 }
    //                 setTimeout(function () {
    //                     callback(ticket, res);
    //                 }, 100)
    //                 return 'loading';
    //             }
    //         },
    //         legend: {
    //             data: $scope.opt_legend
    //         },
    //         toolbox: {
    //             show: false,
    //             feature: {
    //                 dataZoom: {
    //                     yAxisIndex: 'none'
    //                 },
    //                 dataView: {readOnly: false},
    //                 magicType: {type: ['line', 'bar']},
    //                 restore: {},
    //                 saveAsImage: {}
    //             }
    //         },
    //         xAxis: {
    //             type: 'category',
    //             boundaryGap: false,
    //             data: $scope.opt_xAxis
    //         },
    //         yAxis: {
    //             type: 'value',
    //             axisLabel: {
    //                 formatter: '{value}'
    //             }
    //         },
    //         series: [
    //             {
    //                 name: $scope.opt_legend[0],
    //                 type: 'line',
    //                 barWidth: 10,
    //                 data: $scope.data1,
    //                 formatter: '{a} 头/公斤',
    //                 //itemStyle:{
    //                 //    normal:{
    //                 //        color:'#ADADAD',
    //                 //        lineStyle:{
    //                 //            color:'#ADADAD'
    //                 //        }
    //                 //    }
    //                 //}
    //             }
    //             ,
    //             {
    //                 name: $scope.opt_legend[1],
    //                 type: 'line',
    //                 barWidth: 10,
    //                 data: $scope.data2,
    //                 //itemStyle:{
    //                 //    normal:{
    //                 //        color:'#ADADAD',
    //                 //        lineStyle:{
    //                 //            color:'#ADADAD'
    //                 //        }
    //                 //    }
    //                 //}
    //             }
    //         ]
    //     }; //图表数据
    // }

    //点击仓房，加载信息
    $scope.houseInspectionInfo = function (code, name, $event) {
        $("#all_house > button").removeClass("btn-primary"); //剔除其他选中样式
        $($event.target).addClass("btn-primary"); //添加样式
        selHouseCode = code;
        selHouseName = name;
        $("#houseName").html("- " + name); //设置选中的当前仓房名
        $scope.starttime = null;
        $scope.endtime = null;
        $scope.tempInspection();
        $scope.humrityInspection();
        // $scope.gasInspection();
        // $scope.pestInspection();
        $('#' + $scope.gridtableid).DataTable().draw();
    }

    $scope.sleep = function (n) {
        var start = new Date().getTime();
        //  console.log('休眠前：' + start);
        while (true) {
            if (new Date().getTime() - start > n) {
                break;
            }
        }
        // console.log('休眠后：' + new Date().getTime());
    }

    //实时数据检测
    $scope.inspectionInfo = function () {
        // if (code == "temp") {//温度检测
        //     window.location.href = "#/grain/inspection_temp/" + selHouseCode + "/" + selHouseName;
        // } else if (code == "humrity") {//湿度检测
        //     window.location.href = "#/grain/inspection_humrity/" + selHouseCode + "/" + selHouseName;
        // } else if (code == "gas") {//气体检测
        //     window.location.href = "#/grain/inspection_gas/" + selHouseCode + "/" + selHouseName;
        // } else if (code == "pest") {//虫害检测
        //     window.location.href = "#/grain/inspection_pest/" + selHouseCode + "/" + selHouseName;
        // } else if (code == "all") {//全部检测
        //     window.location.href = "#/grain/inspection_all/" + selHouseCode + "/" + selHouseName;
        // }
         //只取仓号
        var code = selHouseName.replace(/[^0-9]/ig,"");
        $.ajax({
            type: "POST",
            async: true,
            beforeSend: function () {
                //两分钟
                rzhdialogTime(ngDialog, "正在执行采集数据...请耐心等待...", "success", 100000);
            },
            url: "/grain/renew",
            dataType: 'json',
            data: {
                "code": code
            },
            "success": function () {
                ngDialog.close();
                $('#' + $scope.gridtableid).DataTable().draw();
            }
        });

    }

    //实时数据采集
    $scope.collectionInfo = function (code) {
        if (code == "temp") {//温度检测
            rzhdialog(ngDialog, "实时温度采集成功", "success");
        } else if (code == "humrity") {//湿度检测
            rzhdialog(ngDialog, "实时湿度采集成功", "success");
        } else if (code == "gas") {//湿度检测
            rzhdialog(ngDialog, "实时气体信息采集成功", "success");
        } else if (code == "pest") {//湿度检测
            rzhdialog(ngDialog, "实时虫害采集成功", "success");
        }
    }
}]);

//列表信息处理
App.controller('grainGridController', ['$scope', function ($scope) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {
                "code": selHouseCode,
                "pageSize": 20
            },
            async: false,
            "success": function (resp) {
                fnCallback(resp.data); //服务器端返回的对象的returnObject部分是要求的格式
            }
        });
    }

    var operatehtml = getHtmlInfos("app/views/base/grid_details.html", "查看详情", "toViewGrain");
    //数据列表信息
    table = $('#' + $scope.gridtableid).DataTable({
        searching: false,                      //不显示搜索框
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        bPaginate: false,                     //不显示分页
        sPaginationType: "full_numbers", fnDrawCallback: function () {
            this.api().column(0).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        },
        pageLength: 20,                    //每页显示20条数据
        ajaxSource: "/grain/query",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            //{mDataProp: "id", sTitle: "id"},
            {sTitle: "序号", width: "8%"},
            {
                mDataProp: "crtime", sTitle: "时间", render: function (data) {
                    return data == null ? '' : formatDate(data);
                }
            },
            {
                mDataProp: "avgt", sTitle: "粮堆均温", render: function (data) {
                    return data + "°C";
                }
            },
            {
                mDataProp: "hight", sTitle: "粮堆最高温", render: function (data) {
                    return data + "°C";
                }
            },
            {
                mDataProp: "lowt", sTitle: "粮堆最低温", render: function (data) {
                    return data + "°C";
                }
            },
            {
                mDataProp: "outt", sTitle: "仓外温", render: function (data) {
                    return data + "°C";
                }
            },
            // {
            //     mDataProp: "avgh", sTitle: "粮堆均湿", render: function (data) {
            //         return data + "%";
            //     }
            // },
            // {
            //     mDataProp: "phosphineconcentration", sTitle: "磷化氢", render: function (data) {
            //         return data + "ppm";
            //     }
            // },
            // {
            //     mDataProp: "nitrogenconcentration", sTitle: "氮气", render: function (data) {
            //         return data + "ppm";
            //     }
            // },
            // {
            //     mDataProp: "pestdensity", sTitle: "虫害", render: function (data) {
            //         return data + "头/公斤";
            //     }
            // },
            {mDataProp: "resultname", sTitle: "测温结果"},
            {mDataProp: "statusname", sTitle: "分析结果"},
            {sTitle: "操作"}
        ],
        aoColumnDefs: [//设置列的属性
            {
                bSortable: false,
                data: null,
                targets: 0
            },
            {
                targets: -1, //最后一列
                data: null,//数据为空
                bSortable: false,//不排序
                defaultContent: operatehtml
            }
        ]
    });
    //添加序号
    table.draw();
    //检测数据详情
    $("#" + $scope.gridtableid + " tbody").on('click', 'tr td button.toViewGrain', function () {
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        window.location.href = "#/grain/grain_view/" + data.id + "/" + selHouseName + "/" + data.crtime;
    });
}]);
