/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

var global_type_code = null;
App.controller('imagesListController', ['$scope', '$http',"$stateParams", "ngDialog", function ($scope, $http,$stateParams, ngDialog) {
    global_type_code = null;
    $scope.gridtableid="imagesListTableGrids";
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
}]);

//列表信息处理
App.controller('imagesListGridController', ['$scope', "$http", "ngDialog", function ($scope,$stateParams, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            url: sSource,
            type: "POST",
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
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(0).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource:"camera/photo/list",
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            //{sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {sTitle: "拍照编号",mDataProp: "no"},
            {sTitle: "拍照类型",mDataProp: "taketypename"},
            {sTitle: "拍照方式",mDataProp: "capturmodename"},
            {sTitle: "硬盘录像机名称",mDataProp: "dvrname"},
            {sTitle: "摄像机名称",mDataProp: "cameraname"},
            {sTitle: "照片名称",mDataProp: "filename"},
            {sTitle: "拍摄时间",mDataProp: "time"},
            {sTitle: "存放地址",mDataProp: "filepath"},
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
        window.location.href = "#/camera/images_detail/"+data.id;
    });
}]);


// 查看详情
App.controller("viewimagesListController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/camera/photo/load',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.imagesInfo = response.data;
            var dvrno = response.data.dvrno;
            var cameraNo = response.data.cameracode;
            //硬盘录像机信息

            //设备类型
            $.ajax({
                url: "/camera/dvr/loadByNo",
                method: 'POST',
                async: false,
                data: {no: dvrno}
            }).success(function (dvrRes) {
                if (dvrRes.success) {
                    $scope.dvrInfo = dvrRes.data;
                }
            });

            //硬盘录像机序号
            $.ajax({
                url: "/camera/info/loadByNo",
                method: 'POST',
                async: false,
                data: {no: cameraNo}
            }).success(function (camRes) {
                if (camRes.success) {
                    $scope.camera = camRes.data;
                    //增加这句用来显示按钮是否选择
                    $scope.camera.ishourse=$scope.camera.ishourse==1?"是":"否";
                    // $scope.camera.islight=$scope.camera.islight==1?true:false;
                }
            });
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })

});
