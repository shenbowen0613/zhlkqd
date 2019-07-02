/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

var global_type_code = null;
App.controller('vehicleController', ['$scope', '$http',"$stateParams", "ngDialog", function ($scope, $http,$stateParams, ngDialog) {
    global_type_code = null;
    $scope.gridtableid="vehicleTableGrids";
    angularParamString($http); //解决post提交接收问题，json方式改为string方式

}]);

//列表信息处理
App.controller('vehicleGridController', ['$scope', "$http", "ngDialog", function ($scope,$stateParams, $http, ngDialog) {
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

    // var operatehtml=getHtmlInfos("app/views/base/grid_details.html","详情查看","toview");
    var operateblacklist=getHtmlInfos("app/views/base/grid_stop.html","加入黑名单","updateBlack");
    var operatenormal=getHtmlInfos("app/views/base/grid_start.html","移出黑名单","updateBlack");

    //数据列表信息
    var table = $('#'+$scope.gridtableid).DataTable({
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(0).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "outin/vehicle/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            //{sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {mDataProp: "vehicle", sTitle: "车船种类"},
            {mDataProp: "vehicleno", sTitle: "车船号"},
            {mDataProp: "istempno", sTitle: "是否为临时牌照" ,render: function (data) {
                // NORMAL("正常"), DISABLE("否"),BLACKLIST("黑名单");
                return data == 0 ? '否' : '是';
            }},
            {mDataProp: "dtstate", sTitle: "是否为黑名单",
                render: function (data) {
                return data == 'BLACKLIST' ? '黑名单' : '正常';
            }},
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
                mDataProp: "dtstate",
                render: function (data) {
                    // NORMAL("正常"), DISABLE("否"),BLACKLIST("黑名单");
                    return data == 'BLACKLIST' ? operatenormal : operateblacklist;
                }
            }
        ]
    });
    //添加序号
    table.draw();
    //选项框
    gridInfoCheckAll($scope.gridtableid); // 全选/全不选
    ckClickTr($scope.gridtableid); //单击行，选中复选框
    //行内查看
    $("#"+$scope.gridtableid+" tbody").on('click', 'tr td button.updateBlack', function () {
        var table=$('#'+$scope.gridtableid).DataTable();
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        var dtstate = "";
        if(data.dtstate=="BLACKLIST"){
            dtstate="NORMAL";
        }else{
            dtstate="BLACKLIST";
        }
        $.ajax({
            url: GserverURL+"outin/vehicle/updateState",
            type: "post",
            dataType: 'json',
            data: {id:data.id,dtstate:dtstate},
            success: function (response) {
                if(response.success){
                    // rzhdialog(ngDialog,response.info,"success");
                    table.order([[1, 'asc']]).draw(false); //刷新表格并维持当前分页
                }else{
                    // rzhdialog(ngDialog,response.info,"error");
                }
            },error: function (e) {
                rzhdialog(ngDialog,"操作失败","error");
            }
        });
        // var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        // windows.location.href = "#/outin/blacklist_vehicle/"+data.id+"/"+data.vehicleno;
    });
}]);



// 查看详情
/*
App.controller("upVehicleController", function ($scope, $stateParams,$http, ngDialog) {
    $scope.id = $stateParams.id;
    $scope.vehicleno = $stateParams.vehicleno;
    $http({
            url: GserverURL+ '',
        method: 'POST',
        data: {id: $stateParams.id,reson:$("#reson").val(),memo:$("#memo").val()}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.vehicle = response.data;
            $scope.vehicle.starttime=formatDate( $scope.vehicle.starttime);
            $scope.vehicle.endtime=formatDate( $scope.vehicle.endtime);
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })

});
*/
