/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

var global_type_code = null;
App.controller('deviceUseController', ['$scope', '$http',"$stateParams", "ngDialog", function ($scope, $http,$stateParams, ngDialog) {
    $scope.no = $stateParams.no;
    $scope.devicename= $stateParams.devicename;
    global_type_code = null;
    $scope.gridtableid="deviceUseTableGrids";
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
    var oprHtml= getHtmlInfos("app/views/base/to_add.html", "添加", "toadd")
                +getHtmlInfos("app/views/base/to_back.html", "返回", "toback");
    angular.element("#topBar").append(oprHtml); //添加功能按钮

    $("#toadd").click(function () {
        window.location.href = "#/app/la/device_use/"+$scope.no+"/"+$scope.devicename+"/add";
    });

    $("#toback").click(function () {
        window.location.href = "#/app/la/device";
    });

    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/app/la/device_use/"+$scope.no+"/"+$scope.devicename;
    }

}]);

//列表信息处理
App.controller('deviceUseGridController', ['$scope', "$http", "ngDialog", function ($scope,$stateParams, $http, ngDialog) {
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
    var table = $('#'+$scope.gridtableid).DataTable({
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(0).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "la/device/useList",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            //{sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {
                sTitle: "设备名称",
                render: function (data) {
                    return data=$scope.devicename;
                }
            },
            {
                mDataProp: "starttime",
                sTitle: "使用开始时间",
                render: function (data, type, full, meta) {
                    return data == null ? '' : formatDate(data);
                }

            },
            {
                mDataProp: "endtime",
                sTitle: "使用结束时间",
                render: function (data, type, full, meta) {
                    return data == null ? '' : formatDate(data);
                }

            },
            {mDataProp: "powerconsumption", sTitle: "耗电量"},
            {mDataProp: "fee", sTitle: "费用"},
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
    //行内查看
    $("#"+$scope.gridtableid+" tbody").on('click', 'tr td button.toview', function () {
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        window.location.href = "#/app/la/device_use/"+$scope.no+"/"+$scope.devicename+"/view/"+data.id;
    });
}]);
// 查看详情
App.controller("viewdeviceUseController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/la/device/useView',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.deviceUse = response.data;
            $scope.deviceUse.starttime=formatDate( $scope.deviceUse.starttime);
            $scope.deviceUse.endtime=formatDate( $scope.deviceUse.endtime);
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })

});

//添加信息
App.controller("adddeviceUseController", function ($scope,$filter, $http, ngDialog) {
    $scope.deviceUse = null;
    $('#starttime,#endtime').datetimepicker({ //加载日期插件
        todayBtn:  1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        todayHighlight: 1 //今天日期高亮
    });
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            $scope.deviceUse.devno= $scope.no;

            $scope.deviceUse.starttime = formatDateNum14($scope.deviceUse.starttime); //格式化开始日期
            $scope.deviceUse.endtime = formatDateNum14($scope.deviceUse.endtime); //格式化结束日期

            if($scope.deviceUse.endtime-$scope.deviceUse.starttime<0){
                rzhdialog(ngDialog,"结束时间早于开始时间","error");
                return ;
            }
            var pData = {
                paras: JSON.stringify($scope.deviceUse)
            };
           $http({
                url: GserverURL+'/la/device/useAdd',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.deviceUse = null;
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
