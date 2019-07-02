/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

var global_type_code = null;
App.controller('resRecController', ['$scope', '$http',"$stateParams", "ngDialog", function ($scope, $http,$stateParams, ngDialog) {
    $scope.medcode = $stateParams.medcode;
    $scope.medname = $stateParams.medname;
    global_type_code = null;
    $scope.global_type=1;//默认为进库
    $scope.gridtableid="resRecTableGrids";
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
    var oprHtml= getHtmlInfos("app/views/base/to_back.html", "返回", "toback");
    angular.element("#topBar").append(oprHtml); //添加功能按钮

    $("#toback").click(function () {
        window.location.href = "#/app/buss/res";
    });

    //增加事件
    $scope.tolistByType = function(val){
        $scope.global_type=val;
        //获得table
        var table=$('#'+$scope.gridtableid).DataTable();
        table.draw();
        ckClickTr($scope.gridtableid); //单击行，选中复选框
        $scope.toRemove();
    }

    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/app/buss/res_rec/"+$scope.medcode+"/"+$scope.medname;
    }

}]);

//列表信息处理
App.controller('resRecGridController', ['$scope', "$http", "ngDialog", function ($scope,$stateParams, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {medcode: $scope.medcode,type:$scope.global_type},
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
        ajaxSource: "/buss/res/recList",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            //{sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {sTitle: "名称",render:function(data) { return data=$scope.medname}},
            {mDataProp: "manufacturer", sTitle: "设备厂商"},
            {mDataProp: "innum", sTitle: "收入数量"},
            {mDataProp: "outnum", sTitle: "支出数量"},
            {mDataProp: "price", sTitle: "价格"},
            {mDataProp: "storenum", sTitle: "保管员"},
            {
                mDataProp: "reportdate",
                sTitle: "填表日期",
                render: function (data) {
                    return data == null ? '' : formatDay(data);
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
    //行内查看
    $("#"+$scope.gridtableid+" tbody").on('click', 'tr td button.toview', function () {
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        window.location.href = "#/app/buss/res_rec/"+$scope.medcode+"/"+$scope.medname+"/view/"+data.id;
    });
}]);
// 查看详情
App.controller("viewresRecController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/buss/res/recView',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.resRec = response.data;
            //$scope.resRec.reportdate=formatDay( $scope.resRec.reportdate);
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })

});


