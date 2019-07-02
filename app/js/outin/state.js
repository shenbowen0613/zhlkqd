/*
 * Copyright (c) 2016. .保留所有权利.
 *                       
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

var global_type_code = null;
App.controller('stateController', ['$scope', '$http', "$stateParams", "ngDialog", function ($scope, $http, $stateParams, ngDialog) {
    global_type_code = null;
    $scope.gridtableid = "stateTableGrids";
    angularParamString($http); //解决post提交接收问题，json方式改为string方式


    var base_levels = "";
    var levels = null;
    var pData = {code: moduleId}; //设置模块id（用以查询模块对应的操作按钮）
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
    $http({ //查询按钮权限
        url: GserverURL + '/sys/user/queryOperate',
        method: 'POST',
        data: pData
    }).success(function (response) {
        if (response.success) {
            var operate = response.data;
            if (operate != null && operate != "") levels = JSON.parse(operate);
            angular.forEach(levels, function (data, index, array) {
                base_levels += getHtmlInfos("app/views/base/to_" + data.operatecode + ".html", data.operatename, data.method) + " ";
            });
            angular.element("#topBar").append(base_levels); //添加功能按钮
            topbar_bind_operate(ngDialog);//绑定topbar操作
        } else {
            rzhdialog(ngDialog, response.info, "error");
        }
    }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        }
    );

    //绑定topbar操作
    function topbar_bind_operate(ngDialog) {
        //导出
        $("#toreport").click(function () {

        });
    }
}]);

//列表信息处理
App.controller('stateGridController', ['$scope', "$http", "ngDialog", function ($scope, $stateParams, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData), no: $scope.no},
            async: false,
            "success": function (resp) {
                fnCallback(resp.data); //服务器端返回的对象的returnObject部分是要求的格式
            }
        });
    }

    function retCheck(dtstate, curstate, time) {
        if (dtstate >= curstate) {
            time = time == null ? '' : formatDate(time);
            // return "<div class='checkbox c-checkbox' style='display: table;margin-top:-30px'><label><input type='checkbox' checked><span class='fa fa-check'></span></label></div>";
            return "<input type='radio' checked disabled/><span>" + time + "</span>";
        } else {
            // return "<div class='checkbox c-checkbox' style='display: table;margin-top:-30px'><label><input type='checkbox'><span class='fa fa-check'></span></label></div>";
            return "<input type='radio' disabled />";
        }
    }

    var operatehtml = getHtmlInfos("app/views/base/grid_details.html", "详情查看", "toview");

    //数据列表信息
    var table = $('#' + $scope.gridtableid).DataTable({
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType: "full_numbers", fnDrawCallback: function () {
            this.api().column(0).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        },
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "outin/statelist",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            //{sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "3%"},
            {sTitle: "车船号", mDataProp: "vehicleno"},
            {sTitle: "承运人", mDataProp: "carrier"},
            {sTitle: "出入库", mDataProp: "iotypename"},

            {sTitle: "联系方式", mDataProp: "cellphone"},
            // {
            //     mDataProp: "outtime",
            //     sTitle: "出库时间",
            //     render: function (data) {
            //         return data == null ? '' : formatDate(data);
            //     }
            //
            // },
            // {
            //     mDataProp: "entrytime",
            //     sTitle: "入库时间",
            //     render: function (data) {
            //         return data == null ? '' : formatDate(data);
            //     }
            // },
            {
                mDataProp: "dtstate",
                sTitle: "入库登记",
                render: function (data, display, obj) {
                    return retCheck(data, 1, obj.entrytime)
                }
            },
            {
                mDataProp: "dtstate",
                sTitle: "扦样",
                render: function (data, display, obj) {
                    return retCheck(data, 2, obj.qytime)
                }
            },
            {
                mDataProp: "dtstate",
                sTitle: "质检",
                render: function (data, display, obj) {
                    return retCheck(data, 3, obj.zjtime)
                }

            },
            {
                mDataProp: "dtstate",
                sTitle: "毛重检斤",
                render: function (data, display, obj) {
                    return retCheck(data, 4, obj.grosstime)
                }
            },
            {
                mDataProp: "dtstate",
                sTitle: "值仓",
                render: function (data, display, obj) {
                    return retCheck(data, 5, obj.stotime)
                }
            },
            {
                mDataProp: "dtstate",
                sTitle: "回皮检斤",
                render: function (data, display, obj) {
                    return retCheck(data, 6, obj.taretime)
                }
            },
            {
                mDataProp: "dtstate",
                sTitle: "结算",
                render: function (data, display, obj) {
                    return retCheck(data, 7, obj.settletime)
                }
            }
            // ,
            // {sTitle: "操作"}
        ],
        aoColumnDefs: [//设置列的属性
            //{
            //    bSortable: false,
            //    targets: 0,
            //    defaultContent: getHtmlInfos("app/views/base/check.html")
            //},
            {
                bSortable: false,
                data: null,
                targets: 0
            }
            // ,
            // {
            //     targets: -1, //最后一列
            //     data: null,//数据为空
            //     bSortable: false,//不排序
            //     defaultContent: operatehtml
            // }
        ]
    });
    //添加序号
    table.draw();
    //选项框
    gridInfoCheckAll($scope.gridtableid); // 全选/全不选
    ckClickTr($scope.gridtableid); //单击行，选中复选框
    //行内查看
    $("#" + $scope.gridtableid + " tbody").on('click', 'tr td button.toview', function () {
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        window.location.href = "#/app/la/device_use/" + $scope.no + "/" + $scope.devicename + "/view/" + data.id;
    });
}]);
// 查看详情
App.controller("viewstateController", function ($scope, $stateParams, $http, ngDialog) {
    $http({
        url: GserverURL + '/la/device/useView',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.state = response.data;
            $scope.state.starttime = formatDate($scope.state.starttime);
            $scope.state.endtime = formatDate($scope.state.endtime);
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog, response.info, "error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog, "操作失败", "error");
    })

});

