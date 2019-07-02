/*
 * Copyright (c) 2016. .保留所有权利.
 *                        
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

var table=null;
App.controller('deviceGrainController', ['$scope', '$http',"$stateParams", "ngDialog", function ($scope, $http,$stateParams, ngDialog) {
    $scope.no = $stateParams.no;
    $scope.devicename= $stateParams.devicename;
    $scope.typecode= $stateParams.typecode;
    $scope.gridtableid="deviceGrainTableGrids";
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
    var oprHtml= getHtmlInfos("app/views/base/to_delete.html", "删除", "todelete")
                +getHtmlInfos("app/views/base/to_update.html", "修改", "toupdate")
                + getHtmlInfos("app/views/base/to_add.html", "添加", "toadd")
                +getHtmlInfos("app/views/base/to_back.html", "返回", "toback");
    angular.element("#topBar").append(oprHtml); //添加功能按钮

    //获取类型树信息
    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=grainrunstates",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.grainrunstates = response.data;
        }
    });


    //获取节点配置的信息
    $.ajax({
        url: GserverURL+ "/la/device/remark?typecode="+$scope.typecode,
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.devicetyperemarks = response.data;
            $scope.layercount= $scope.devicetyperemarks.indexOf("layercount")>-1?true:false;
            $scope.locindex= $scope.devicetyperemarks.indexOf("locindex")>-1?true:false;
            $scope.rowindex= $scope.devicetyperemarks.indexOf("rowindex")>-1?true:false;
            $scope.colindex= $scope.devicetyperemarks.indexOf("colindex")>-1?true:false;
            $scope.layercountname=$scope.layercount?$scope.devicetyperemarks.split(",")[0]:"";
        }
    });


    $("#toadd").click(function () {
        window.location.href = "#/app/la/device_grain/"+$scope.no+"/"+$scope.devicename+"/"+$scope.typecode+"/add";
    });

    //修改
    $("#toupdate").click(function () {
        var deviceGrain=getTableData(table);
        if(deviceGrain==null){
            rzhdialog(ngDialog,"请先选择一条要修改的数据！","error");
            return;
        }
        $scope.deviceGrain=deviceGrain;
        window.location.href = "#/app/la/device_grain/"+$scope.no+"/"+$scope.devicename+"/"+$scope.typecode+"/update";
    });

    $("#todelete").click(function () {
        var deviceGrain=getTableData(table);
        if(deviceGrain==null){
            rzhdialog(ngDialog,"请先选择一条要删除的数据！","error");
            return;
        }
        ngDialog.openConfirm({
            template: 'deldeviceGrainDialogId',
            className: 'ngdialog-theme-default'
        }).then(function (value) { //用户点击确认
            $.ajax({
                url: GserverURL+'/la/device/deleteGrain',
                method: 'POST',
                data: {id: device.id}
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    table.order([[1, 'asc']]).draw(false); //刷新表格并维持当前分页
                    ckClickTr($scope.gridtableid); //单击行，选中复选框
                    rzhdialog(ngDialog,response.info,"success");
                } else { //信息处理失败，提示错误信息
                    rzhdialog(ngDialog,response.info,"error");
                }
            }).error(function (response) { //提交失败
                rzhdialog(ngDialog,"操作失败","error");
            })
        }, function (response) {
            //用户点击取消
        });
    });

    $("#toback").click(function () {
        window.location.href = "#/app/la/device";
    });


    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/app/la/device_grain/"+$scope.no+"/"+$scope.devicename+"/"+$scope.typecode;
    }

}]);

//列表信息处理
App.controller('deviceGrainGridController', ['$scope', "$http", "ngDialog", function ($scope,$stateParams, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {no: $scope.no},
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
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(1).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: GserverURL+"la/device/grainList",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {
                sTitle: "设备名称",
                render: function (data) {
                    return data=$scope.devicename;
                }
            },
            {
                mDataProp: "layercount",
                bVisible: $scope.layercount,
                sTitle: $scope.layercountname+'号'
            },
            {
                mDataProp: "locindex",
                bVisible: $scope.locindex,
                sTitle: "序号"
            },
            {
                mDataProp: "rowindex",
                bVisible: $scope.rowindex,
                sTitle: "行号"
            },
            {
                mDataProp: "colindex",
                bVisible: $scope.colindex,
                sTitle: "列号"
            },
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
        window.location.href = "#/app/la/device_grain/"+$scope.no+"/"+$scope.devicename+"/"+$scope.typecode+"/view/"+data.id;
    });
}]);
// 查看详情
App.controller("viewdeviceGrainController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/la/device/grainView',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.deviceGrain = response.data;
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })

});

//添加信息
App.controller("adddeviceGrainController", function ($scope,$filter, $http, ngDialog) {
    $scope.deviceGrain = null;
    //添加数据
    $scope.save = function () {
        $scope.deviceGrain.devno= $scope.no;
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            var pData = {
                paras: JSON.stringify($scope.deviceGrain)
            };
           $http({
                url: GserverURL+'/la/device/grainAdd',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.deviceGrain = null;
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

App.controller("updatedeviceGrainController", function ($scope,$filter, $http, ngDialog) {
    //update数据
    $scope.save = function () {
        $scope.deviceGrain.devno= $scope.no;
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            var pData = {
                paras: JSON.stringify($scope.deviceGrain)
            };
           $http({
                url: GserverURL+'/la/device/grainUpdate',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.deviceGrain = null;
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


