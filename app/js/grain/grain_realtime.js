/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
var selHouseCode;
var selHouseName;
var inspectionType = "temp";
var table;
App.controller('grainRealtimeBarController', ['$scope', '$http', 'ngDialog', function ($scope, $http, ngDialog) {
    $scope.menus = menuItems;
}]);
App.controller('grainRealtimeController', ['$scope', '$http', 'ngDialog', function ($scope, $http, ngDialog) {
    $scope.gridtableid = "grainRealtimeTableGrids"; //数据列表id
    $scope.opt_title = "温度检测";
    $.ajax({
        url: '/la/house/tree',
        method: 'POST',
        async: false
    }).success(function (result) {
        if (result.success) {
            $scope.houseItems = result.data;
            if ($scope.houseItems.length > 0) {
                selHouseCode = $scope.houseItems[0].code; //设置当前仓房编码
                selHouseName = $scope.houseItems[0].label;
                $("#houseName").html("- " + selHouseName); //设置选中的当前仓房名
            }
        }
    });

    var pData = {code: selHouseCode};
    $.ajax({
        url: '/grain/inspectionTemp',
        method: 'POST',
        data: pData,
        async: false
    }).success(function (result) {
        if (result.success) {
            $scope.tempData = result.data;
        }
    });

    //点击切换温、湿、气、虫查看
    $scope.toInspection = function (typeCode) {
        if (typeCode == "temp") {
            inspectionType = "temp";
            //重绘图表
            $scope.opt_title = "温度检测";
            $scope.opt_legend = ['仓内温', '仓外温', '平均温', '最低温', '最高温'];
            var pData = {code: selHouseCode};
            $http({ //首次进入，获取温度信息
                url: '/grain/inspectionTemp',
                method: 'POST',
                data: pData
            }).success(function (result) {
                if (result.success) {
                    $scope.tempData = result.data;

                    //数据列表信息重绘
                    if ($scope.tempData.aaData == null || $scope.tempData.aaData == "") {
                        table.clear().draw();
                        $('#' + $scope.gridtableid).hide();
                    } else {
                        $('#' + $scope.gridtableid).show();
                        table.destroy();
                        $('#' + $scope.gridtableid).empty();
                        var operatehtml = getHtmlInfos("app/views/base/grid_details.html", "查看详情", "toViewTemp");
                        table = $('#' + $scope.gridtableid).DataTable({
                            searching: false,                      //不显示搜索框
                            processing: true,                    //加载数据时显示正在加载信息
                            showRowNumber: true,
                            sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(0).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
                            bPaginate:false,
                            pageLength: 20,                    //每页显示20条数据
                            data: $scope.tempData.aaData,
                            aoColumns: [
                                //{mDataProp: "id", sTitle: "id"},
                                {sTitle: "序号", width: "8%"},
                                {
                                    mDataProp: "checktime", sTitle: "时间", render: function (data) {
                                    return data == null ? '' : formatDate(data);
                                }
                                },
                                {
                                    mDataProp: "innert", sTitle: "仓内温", render: function (data) {
                                    return data + "°C";
                                }
                                },
                                {
                                    mDataProp: "outt", sTitle: "仓外温", render: function (data) {
                                    return data + "°C";
                                }
                                },
                                {
                                    mDataProp: "hight", sTitle: "最高温", render: function (data) {
                                    return data + "°C";
                                }
                                },
                                {
                                    mDataProp: "lowt", sTitle: "最低温", render: function (data) {
                                    return data + "°C";
                                }
                                },
                                {
                                    mDataProp: "avgt", sTitle: "平均温", render: function (data) {
                                    return data + "°C";
                                }
                                },
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
                        //温度检测数据详情
                        $("#" + $scope.gridtableid + " tbody").on('click', 'tr td button.toViewTemp', function () {
                            var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
                            window.location.href = "#/grain/temp_view/" + data.id + "/" + selHouseName + "/" + data.checktime +"/" + data.housecode+"/realtime";
                        });
                    }
                }
            });
        } else if (typeCode == "humrity") {
            inspectionType = "humrity";
            //重绘图表
            //重绘图表
            $scope.opt_title = "湿度检测";
            $scope.opt_legend = ['仓内湿','仓内温','仓外湿','仓外温'];
            $http({ //首次进入，获取温度信息
                url: '/grain/inspectionTempHumrity',
                method: 'POST',
                data: pData
            }).success(function (result) {
                if (result.success) {
                    $scope.tempData = result.data;
                    //数据列表信息重绘
                    if ($scope.tempData.aaData == null || $scope.tempData.aaData == "") {
                        table.clear().draw();
                        $('#' + $scope.gridtableid).hide();
                    } else {
                        $('#' + $scope.gridtableid).show();
                        table.destroy();
                        $('#' + $scope.gridtableid).empty();
                        var operatehtml = getHtmlInfos("app/views/base/grid_details.html", "查看详情", "toViewHumrity");
                        table = $('#' + $scope.gridtableid).DataTable({
                            searching: false,                      //不显示搜索框
                            processing: true,                    //加载数据时显示正在加载信息
                            showRowNumber: true,
                            sPaginationType: "full_numbers", fnDrawCallback: function () {
                                this.api().column(0).nodes().each(function (cell, i) {
                                    cell.innerHTML = i + 1;
                                });
                            },
                            bPaginate: false,
                            pageLength: 20,                    //每页显示20条数据
                            data: $scope.tempData.aaData,
                            aoColumns: [
                                //{mDataProp: "id", sTitle: "id"},
                                {sTitle: "序号", width: "8%"},
                                {
                                    mDataProp: "crtime", sTitle: "时间", render: function (data) {
                                        return data == null ? '' : formatDate(data);
                                    }
                                },
                                {
                                    mDataProp: "inh", sTitle: "仓内湿", render: function (data) {
                                        return data + "%";
                                    }
                                },
                                {
                                    mDataProp: "innert", sTitle: "仓内温", render: function (data) {
                                        return data + "°C";
                                    }
                                },
                                {
                                    mDataProp: "outh", sTitle: "仓外湿", render: function (data) {
                                        return data + "%";
                                    }
                                },
                                {
                                    mDataProp: "outt", sTitle: "仓外温", render: function (data) {
                                        return data + "°C";
                                    }
                                },
                                {mDataProp: "resultname", sTitle: "测湿结果"},
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
                        table.on('order.dt search.dt', function () { //添加序号
                            table.column(0, {search: 'applied', order: 'applied'}).nodes().each(function (cell, i) {
                                cell.innerHTML = i + 1;
                            });
                        }).draw();
                        //湿度检测数据详情
                        $("#" + $scope.gridtableid + " tbody").on('click', 'tr td button.toViewHumrity', function () {
                            var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
                            window.location.href = "#/grain/humrity_view/"+data.id+"/"+selHouseName+"/"+data.checktime+"/realtime";
                        });
                    }
                }
            });
        } else if (typeCode == "gas") {
            inspectionType = "gas";
            //重绘图表
            $scope.opt_title = "气体浓度检测";
            $scope.opt_legend = ['磷化氢', '氮气', '氧气', '二氧化碳'];
            var pData = {code: selHouseCode};
            $http({ //首次进入，获取温度信息
                url: '/grain/inspectionGas',
                method: 'POST',
                data: pData
            }).success(function (result) {
                if (result.success) {
                    $scope.tempData = result.data;

                    //数据列表信息重绘
                    if ($scope.tempData.aaData == null || $scope.tempData.aaData == "") {
                        table.clear().draw();
                        $('#' + $scope.gridtableid).hide();
                    } else {
                        $('#' + $scope.gridtableid).show();
                        table.destroy();
                        $('#' + $scope.gridtableid).empty();
                        var operatehtml = getHtmlInfos("app/views/base/grid_details.html", "查看详情", "toViewGas");
                        table = $('#' + $scope.gridtableid).DataTable({
                            searching: false,                      //不显示搜索框
                            processing: true,                    //加载数据时显示正在加载信息
                            showRowNumber: true,
                            sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(0).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
                            bPaginate:false,pageLength: 9999,                    //每页显示20条数据
                            data: $scope.tempData.aaData,
                            aoColumns: [
                                //{mDataProp: "id", sTitle: "id"},
                                {sTitle: "序号", width: "8%"},
                                {
                                    mDataProp: "checktime", sTitle: "时间", render: function (data) {
                                    return data == null ? '' : formatDate(data);
                                }
                                },
                                {
                                    mDataProp: "phosphineconcentration", sTitle: "磷化氢", render: function (data) {
                                    return data + "ppm";
                                }
                                },
                                {
                                    mDataProp: "nitrogenconcentration", sTitle: "氮气", render: function (data) {
                                    return data + "ppm";
                                }
                                },
                                {
                                    mDataProp: "oxygenconcentration", sTitle: "氧气", render: function (data) {
                                    return data + "ppm";
                                }
                                },
                                {
                                    mDataProp: "co2concentration", sTitle: "二氧化碳", render: function (data) {
                                    return data + "ppm";
                                }
                                },
                                {mDataProp: "resultname", sTitle: "测湿结果"},
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
                        table.on('order.dt search.dt', function () { //添加序号
                            table.column(0, {search: 'applied', order: 'applied'}).nodes().each(function (cell, i) {
                                cell.innerHTML = i + 1;
                            });
                        }).draw();
                        //气体浓度检测数据详情
                        $("#" + $scope.gridtableid + " tbody").on('click', 'tr td button.toViewGas', function () {
                            var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
                            window.location.href = "#/grain/gas_view/"+data.id+"/"+selHouseName+"/"+data.checktime+"/realtime";
                        });
                    }
                }
            });
        } else if (typeCode == "pest") {
            inspectionType = "pest";
            //重绘图表
            $scope.opt_title = "虫害检测";
            $scope.opt_legend = ['虫害', '主要虫害'];
            var pData = {code: selHouseCode};
            $http({ //首次进入，获取温度信息
                url: '/grain/inspectionPest',
                method: 'POST',
                data: pData
            }).success(function (result) {
                if (result.success) {
                    $scope.tempData = result.data;
                    //数据列表信息重绘
                    if ($scope.tempData.aaData == null || $scope.tempData.aaData == "") {
                        table.clear().draw();
                        $('#' + $scope.gridtableid).hide();
                    } else {
                        $('#' + $scope.gridtableid).show();
                        table.destroy();
                        $('#' + $scope.gridtableid).empty();
                        var operatehtml = getHtmlInfos("app/views/base/grid_details.html", "查看详情", "toViewPest");
                        table = $('#' + $scope.gridtableid).DataTable({
                            searching: false,                      //不显示搜索框
                            processing: true,                    //加载数据时显示正在加载信息
                            showRowNumber: true,
                            sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(0).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
                            bPaginate:false,
                            pageLength: 20,                    //每页显示20条数据
                            data: $scope.tempData.aaData,
                            aoColumns: [
                                //{mDataProp: "id", sTitle: "id"},
                                {sTitle: "序号", width: "8%"},
                                {
                                    mDataProp: "checktime", sTitle: "时间", render: function (data) {
                                    return data == null ? '' : formatDate(data);
                                }
                                },
                                {mDataProp: "pestkind", sTitle: "虫害种类"},
                                {
                                    mDataProp: "pestdensity", sTitle: "虫害密度", render: function (data) {
                                    return data + " 头/公斤";
                                }
                                },
                                {mDataProp: "mainpestname", sTitle: "主虫害种类"},
                                {
                                    mDataProp: "mainpestdensity", sTitle: "主虫害密度", render: function (data) {
                                    return data + " 头/公斤";
                                }
                                },
                                {mDataProp: "resultname", sTitle: "测湿结果"},
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
                        table.on('order.dt search.dt', function () { //添加序号
                            table.column(0, {search: 'applied', order: 'applied'}).nodes().each(function (cell, i) {
                                cell.innerHTML = i + 1;
                            });
                        }).draw();
                        //湿度检测数据详情
                        $("#" + $scope.gridtableid + " tbody").on('click', 'tr td button.toViewPest', function () {
                            var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
                            window.location.href = "#/grain/pest_view/"+data.id+"/"+selHouseName+"//"+data.housecode+"/realtime";
                        });
                    }
                }
            });
        }
    }

    //点击仓房，加载信息
    $scope.houseInspectionInfo = function (code, name, $event) {
        $("#all_house > button").removeClass("btn-primary"); //剔除其他选中样式
        $($event.target).addClass("btn-primary"); //添加样式
        selHouseCode = code;
        selHouseName = selHouseCode;
        $("#houseName").html("- " + name); //设置选中的当前仓房名
        $scope.toInspection(inspectionType);
    }

    //实时数据检测
    $scope.inspectionInfo = function (code) {
        if (code == "temp") {//温度检测
            window.location.href = "#/grain/inspection_temp/" + selHouseCode + "/" + selHouseName;
        } else if (code == "humrity") {//湿度检测
            window.location.href = "#/grain/inspection_humrity/" + selHouseCode + "/" + selHouseName;
        } else if (code == "gas") {//湿度检测
            window.location.href = "#/grain/inspection_gas/" + selHouseCode + "/" + selHouseName;
        } else if (code == "pest") {//湿度检测
            window.location.href = "#/grain/inspection_pest/" + selHouseCode + "/" + selHouseName;
        } else if (code == "all") {//湿度检测
            window.location.href = "#/grain/inspection_all/" + selHouseCode + "/" + selHouseName;
        }
    }

    //实时数据采集
    $scope.collectionInfo = function(code){
        if (code == "temp") {//温度检测
            rzhdialog(ngDialog,"实时温度采集成功","success");
        } else if (code == "humrity") {//湿度检测
            rzhdialog(ngDialog,"实时湿度采集成功","success");
        } else if (code == "gas") {//湿度检测
            rzhdialog(ngDialog,"实时气体信息采集成功","success");
        } else if (code == "pest") {//湿度检测
            rzhdialog(ngDialog,"实时虫害采集成功","success");
        }
    }
}]);

//列表信息处理
App.controller('grainRealtimeGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    var operatehtml = getHtmlInfos("app/views/base/grid_details.html", "查看详情", "toViewTemp");
    //数据列表信息
    table = $('#' + $scope.gridtableid).DataTable({
        searching: false,                      //不显示搜索框
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(0).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        bPaginate:false,
        pageLength: 20,                    //每页显示20条数据
        data: $scope.tempData.aaData,
        aoColumns: [
            //{mDataProp: "id", sTitle: "id"},
            {sTitle: "序号", width: "8%"},
            {
                mDataProp: "checktime", sTitle: "时间", render: function (data) {
                return data == null ? '' : formatDate(data);
            }
            },
            {
                mDataProp: "innert", sTitle: "仓内温", render: function (data) {
                return data + "°C";
            }
            },
            {
                mDataProp: "outt", sTitle: "仓外温", render: function (data) {
                return data + "°C";
            }
            },
            {
                mDataProp: "hight", sTitle: "最高温", render: function (data) {
                return data + "°C";
            }
            },
            {
                mDataProp: "lowt", sTitle: "最低温", render: function (data) {
                return data + "°C";
            }
            },
            {
                mDataProp: "avgt", sTitle: "平均温", render: function (data) {
                return data + "°C";
            }
            },
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
    table.on('order.dt search.dt', function () { //添加序号
        table.column(0, {search: 'applied', order: 'applied'}).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1;
        });
    }).draw();
    //温度检测数据详情
    $("#" + $scope.gridtableid + " tbody").on('click', 'tr td button.toViewTemp', function () {
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        window.location.href = "#/grain/temp_view/" + data.id + "/" + selHouseName + "/" + data.checktime +"/" + data.housecode+"/realtime";
    });
}]);
