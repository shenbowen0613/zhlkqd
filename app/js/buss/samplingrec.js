/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
var table=null;
App.controller('samplingrecController', ['$scope', '$http',"$stateParams", "ngDialog", function ($scope, $http, $stateParams,ngDialog) {
    $scope.sno = $stateParams.sno;
    $scope.sname = $stateParams.sname;
    $scope.gridtableid="samplingrecTableGrids";
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
    var oprHtml=
        getHtmlInfos("app/views/base/to_delete.html", "删除", "todelete")
        +getHtmlInfos("app/views/base/to_update.html", "修改", "toupdate")
        +getHtmlInfos("app/views/base/to_add.html", "添加", "toadd")
        +getHtmlInfos("app/views/base/to_back.html", "返回", "toback");

    angular.element("#topBar").append(oprHtml); //添加功能按钮
    topbar_bind_operate(ngDialog);
    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/app/buss/samplingrec/"+$scope.sno+"/"+$scope.sname;
    }

    function topbar_bind_operate(ngDialog) {

        $("#toback").click(function () {
            window.location.href = "#/app/buss/sampling";
        });

        $("#toadd").click(function () {
            window.location.href = "#/app/buss/samplingrec/" + $scope.sno + "/" + $scope.sname + "/add";
        });

        //修改检验单
        $("#toupdate").click(function () {
            var samplingrec = getTableData(table);
            if (samplingrec == null) {
                rzhdialog(ngDialog, "请先选择一条检验单！", "error");
                return;
            }
            $scope.samplingrec = samplingrec;
            window.location.href = "#/app/buss/samplingrec/" + $scope.sno + "/" + $scope.sname + "/update";
        });

        //删除
        $("#todelete").click(function () {
            var samplingrec = getTableData(table);
            if (samplingrec == null) {
                rzhdialog(ngDialog, "请先选择一条要删除的数据！", "error");
                return;
            }
            ngDialog.openConfirm({
                template: 'delsamplingrecDialogId',
                className: 'ngdialog-theme-default'
            }).then(function (value) { //用户点击确认
                $http({
                    url: '/buss/samplingrec/delete',
                    method: 'POST',
                    data: {id: samplingrec.id}
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
            }, function (response) {
                //用户点击取消
            });
        });
    }

}]);

//列表信息处理
App.controller('samplingrecGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData),"precode":$scope.sno}, //以json格式传递
            async: false,
            "success": function (resp) {
                fnCallback(resp.data); //服务器端返回的对象的returnObject部分是要求的格式
            }
        });
    }
    var operatehtml=getHtmlInfos("app/views/base/grid_details.html","详情查看","toview");
    //数据列表信息
    table = $('#'+$scope.gridtableid).DataTable({
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从likun服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(1).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "/buss/samplingrec/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {mDataProp: "bussinessno", sTitle: "单号"},
            {sTitle: "扦样名称", render: function (data) {return data=$scope.sname}},
            {mDataProp: "name", sTitle: "样品名称"},
            {mDataProp: "keeploc", sTitle: "保管位置"},
            {mDataProp: "results", sTitle: "样品鉴定结果"},
            {mDataProp: "operator", sTitle: "操作员"},
            {sTitle: "操作"}
        ],
        aoColumnDefs: [//设置列的属性
            {
                bSortable: false,
                targets: 0,
                defaultContent: getHtmlInfos("app/views/base/check.html")
            },
            {
                bSortable: false,
                data: null,
                targets: 1
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
    //行内查看
    $("#"+$scope.gridtableid+" tbody").on('click', 'tr td button.toview', function () {
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        window.location.href = "#/app/buss/samplingrec/"+$scope.sno+"/"+$scope.sname+"/view/"+data.id;
    });
}]);
// 查看详情
App.controller("viewsamplingrecController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/buss/samplingrec/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.samplingrec = response.data;
            $scope.samplingrec.crtime = formatDate($scope.samplingrec.crtime);
            $("#erweima").qrcode({
                render : "canvas",    //设置渲染方式，有table和canvas，使用canvas方式渲染性能相对来说比较好
                text :  $scope.samplingrec.bussinessno,    //扫描二维码后显示的内容,可以直接填一个网址，扫描二维码后自动跳向该链接
                width : "150",               //二维码的宽度
                height : "150",              //二维码的高度
                background : "#ffffff",       //二维码的后景色
                foreground : "#000000"       //二维码的前景色
            });

            $("#tiaoxingma").empty().barcode(
                $scope.samplingrec.bussinessno,
                "code128",
                {
                    barWidth:2,
                    barHeight:50,
                    showHRI:false
                }
            );

        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
});

//添加信息
App.controller("updatesamplingrecController", function ($scope,$filter, $http, ngDialog) {
    //修改数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            var pData = {
                paras: JSON.stringify($scope.samplingrec)
            };
           $http({
                url: GserverURL+'/buss/samplingrec/update',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.samplingrec = null;
                    table.draw(); //重新加载数据
                    ckClickTr($scope.gridtableid); //单击行，选中复选框
                    rzhdialog(ngDialog,response.info,"success");
                    $scope.toRemove();
                } else { //信息处理失败，提示错误信息
                    rzhdialog(ngDialog,response.info,"error");
                }
            }).error(function (response) { //提交失败
                rzhdialog(ngDialog,"操作失败","error");
            })
        }
    }
});

//添加信息
App.controller("addsamplingrecController", function ($scope,$filter, $http, ngDialog) {
    $scope.samplingrec = null;
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            $scope.samplingrec.precode=$scope.sno;
            var pData = {
                paras: JSON.stringify($scope.samplingrec)
            };
           $http({
                url: GserverURL+'/buss/samplingrec/add',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.samplingrecRec = null;
                    table.draw(); //重新加载数据
                    ckClickTr($scope.gridtableid); //单击行，选中复选框
                    rzhdialog(ngDialog,response.info,"success");
                    $scope.toRemove();
                } else { //信息处理失败，提示错误信息
                    rzhdialog(ngDialog,response.info,"error");
                }
            }).error(function (response) { //提交失败
                rzhdialog(ngDialog,"操作失败","error");
            })
        }
    }
});