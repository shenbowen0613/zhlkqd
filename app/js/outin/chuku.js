/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

var global_type_code = null;
App.controller('chukuController', ['$scope', '$http', "$stateParams", "ngDialog", function ($scope, $http, $stateParams, ngDialog) {
    global_type_code = null;
    $scope.gridtableid = "chukuTableGrids";
    angularParamString($http); //解决post提交接收问题，json方式改为string方式



    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=xiaokaer_list",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.xiaokaerList = response.data;
        }
    });

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
        //生成报表
        $("#toreport").click(function () {
            window.location.href = "#/app/report/la" + "/app-la-device";
            return;
        });
    }
}]);


//列表信息处理
App.controller('chukuGridController', ['$scope', "$http", "ngDialog", function ($scope, $stateParams, $http, ngDialog) {
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


    //数据列表信息
    var operatehtml = getHtmlInfos("app/views/base/grid_download.html", "文件下载", "todownload");
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
        ajaxSource: "outin/pinCardlist",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            //{sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {mDataProp: "iotypename", sTitle: "出入库类型"},
            {mDataProp: "busno", sTitle: "业务单号"},
            {mDataProp: "cardno", sTitle: "智能卡号"},
            {mDataProp: "vehicleno", sTitle: "车牌号"},
            {mDataProp: "grossweight", sTitle: "毛重(KG)"},
            {mDataProp: "tareweight", sTitle: "皮重(KG)"},
            {mDataProp: "netweight", sTitle: "净重(KG)"},
            {
                mDataProp: "crtime", sTitle: "入库时间",
                render: function (data) {
                    return data == null ? '' : formatDate(data);
                    // return data == null ? '' : data;
                }
            },
            {
                mDataProp: "outtime", sTitle: "销卡时间",
                render: function (data) {
                    return data == null ? '' : formatDate(data);
                    // return data == null ? '' : data;
                }
            },
            {sTitle: "操作"}
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
    //选项框
    gridInfoCheckAll($scope.gridtableid); // 全选/全不选
    ckClickTr($scope.gridtableid); //单击行，选中复选框
    //文件下载
    $("#" + $scope.gridtableid + " tbody").on('click', 'tr td button.todownload', function () {
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        $.ajax({
            type: "POST",
            url: GserverURL + '/outin/genPinCardReports',
            dataType: 'json',
            data: {busno: data.busno},
            async: false,
            "success": function (resp) {
                if (resp.success) {
                    var fileUrl = resp.data;
                    openfile(ngDialog, fileUrl);
                } else {
                    rzhdialog(ngDialog, resp.info, "error");
                }
            },
            "error":function (response) { //提交失败
                rzhdialog(ngDialog, "操作失败", "error");
            }
        });
    });
}]);


// 查看详情
App.controller("viewchukuController", function ($scope, $stateParams, $http, ngDialog) {
    $http({
        url: GserverURL + '/la/device/useView',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.chuku = response.data;
            $scope.chuku.starttime = formatDate($scope.chuku.starttime);
            $scope.chuku.endtime = formatDate($scope.chuku.endtime);
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog, response.info, "error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog, "操作失败", "error");
    })

});


// 销卡
App.controller("xiaokaController", function ($scope, $stateParams, $http, ngDialog) {

    $scope.toRemove = function () {
        window.location.href = "#/outin/xiaoka_chuku";
    }

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
                    $("#cardno").val(result);
                    var result = mcard.closeReader();
                }

            }
        }
        catch (e) {
            console.log(e.Message);
        }
    }

    $("#xksub").click(function () {
        var table = $('#' + $scope.gridtableid).DataTable();
        $.ajax({
            url: GserverURL + '/outin/pinCard',
            method: 'POST',
            data: $("#subForm").serialize()
        }).success(function (response) { //提交成功
            if (response.success) { //信息处理成功，进入用户中心页面
                table.order([[1, 'asc']]).draw(false); //刷新表格并维持当前分页
                ckClickTr($scope.gridtableid); //单击行，选中复选框
                rzhdialog(ngDialog, response.info, "success");
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog, response.info, "error");
            }
        }).error(function (response) { //提交失败
            rzhdialog(ngDialog, "操作失败", "error");
        })

    });

});




