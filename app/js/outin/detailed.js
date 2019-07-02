/*
 * Copyright (c) 2016. .保留所有权利.
 *                       
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

var global_type_code = null;
App.controller('detailedController', ['$scope', '$http',"$stateParams", "ngDialog", function ($scope, $http,$stateParams, ngDialog) {
    global_type_code = null;
    $scope.gridtableid="detailedTableGrids";
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
}]);

//列表信息处理
App.controller('detailedGridController', ['$scope', "$http", "ngDialog", function ($scope,$stateParams, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: GserverURL+sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData),no: $scope.no},
            async: false,
            "success": function (resp) {
                fnCallback(resp.data); //服务器端返回的对象的returnObject部分是要求的格式
            }
        });
    }


    var operatehtml=getHtmlInfos("app/views/base/grid_details.html","详情查看","toview");

    //数据列表信息
    var table = $('#'+$scope.gridtableid).DataTable({
        // processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(0).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "outin/detailedlist",//获取数据的url
        fnServerData: retrieveData,         //获取数据的处理函数
        aoColumns: [
            //{sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号"},
            {sTitle: "日期",mDataProp: "busdate"},
            {sTitle: "车船号",mDataProp: "vehicleno"},
            {sTitle: "供货单位",mDataProp: "customername"},
            {sTitle: "粮食品种",mDataProp: "varietyname"},
            {sTitle: "出入库类型",mDataProp: "iotypename"},
            {sTitle: "毛重（千克）",mDataProp: "grossweight"},
            {sTitle: "皮重（千克）",mDataProp: "tareweight"},
            {sTitle: "净重（千克）",mDataProp: "netweight"},
            {sTitle: "包装方式",mDataProp: "packages"},
            {sTitle: "结算重量（千克）",mDataProp: "jsweight"},
            {sTitle: "单价（元/千克）",mDataProp: "jsprice"},
            {sTitle: "金额（元）",mDataProp: "jsmoney"}
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
    $("#"+$scope.gridtableid+" tbody").on('click', 'tr td button.toview', function () {
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        window.location.href = "#/app/la/device_use/"+$scope.no+"/"+$scope.devicename+"/view/"+data.id;
    });
}]);

