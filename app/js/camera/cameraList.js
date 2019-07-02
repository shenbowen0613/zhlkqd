/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

App.controller('cameraListController', ['$scope', '$http',"$stateParams", "ngDialog", function ($scope, $http,$stateParams, ngDialog) {
    $scope.gridtableid="cameraListTableGrids";
    angularParamString($http); //解决post提交接收问题，json方式改为string方式

    var base_levels = "";
    var levels = null;
    var pData = { code: moduleId}; //设置模块id（用以查询模块对应的操作按钮）
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
    $http({ //查询按钮权限
        url: GserverURL+'/sys/user/queryOperate',
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
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
            rzhdialog(ngDialog,"操作失败","error");
        }
    );

    //绑定topbar操作
    function topbar_bind_operate(ngDialog){
        //添加
        $("#toadd").click(function () {
            window.location.href = "#/camera/cameraAdd";
        });


        //修改
        $("#toupdate").click(function () {
            var table=$('#'+$scope.gridtableid).DataTable();
            var camera=getTableData(table);
            if(camera==null){
                rzhdialog(ngDialog,"请先选择一条要修改的数据！","error");
                return;
            }
            $scope.camera=camera;
            window.location.href = "#/camera/cameramanage/"+$scope.camera.id;
        });


        //删除
        $("#todelete").click(function () {
            var table=$('#'+$scope.gridtableid).DataTable();
            var device=getTableData(table);
            if(device==null){
                rzhdialog(ngDialog,"请先选择一条要删除的数据！","error");
                return;
            }
            ngDialog.openConfirm({
                template: 'delCameraDialogId',
                className: 'ngdialog-theme-default'
            }).then(function (value) { //用户点击确认
                $.ajax({
                    url: GserverURL+'/camera/info/delete',
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

    }

}]);


//列表信息处理
App.controller('cameraListGridController', ['$scope', "$http", "ngDialog", function ($scope,$stateParams, $http, ngDialog) {
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

    //获取仓房列表
    $.ajax({ //查询按钮权限
        url: GserverURL+"/la/house/houseList",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.houseInfos = response.data;
        }
    });

    function renderHouse(houseid){
        var housename;
        angular.forEach($scope.houseInfos, function(data){
            if(houseid-data.id==0){
                housename=data.housename;
            }
        });
        return housename;
    }

    var operatehtml=getHtmlInfos("app/views/base/grid_details.html","详情查看","toview");

    //数据列表信息
    var table = $('#'+$scope.gridtableid).DataTable({
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(1).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "camera/info/cameralist",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "3%"},
            {sTitle: "序号", width: "5%"},
            // {sTitle: "仓房编码",mDataProp: "houseid",render:function(data){return renderHouse(data)}},
            {sTitle: "安装位置",mDataProp: "location"},
            // {sTitle: "名称",mDataProp: "cameraname"},
            // {sTitle: "通道",mDataProp: "channelname"},
            // {sTitle: "类型",mDataProp: "cameratypename"},
            // {sTitle: "厂商",mDataProp: "dvrmanufacturer"},
            // {sTitle: "型号",mDataProp: "dvrmodel"},
            // {sTitle: "照射区域",mDataProp: "jurisdiction"},
            {sTitle: "设备IP",mDataProp: "cameraip"},
            {sTitle: "设备端口",mDataProp: "cameraport"},
            {sTitle: "登录账号",mDataProp: "logincode"},
            // {sTitle: "硬盘录像机",mDataProp: "dvrname"},
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
        window.location.href = "#/camera/cameraView/"+data.id;
    });
}]);


//添加信息
App.controller("addCameraController", function ($scope, $http, ngDialog) {
    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/camera/cameralist";
    }

    //硬盘录像机序号
    $.ajax({
        url: GserverURL+ "/camera/dvr/getAllList",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.dvrInfo = response.data;
        }
    });

    //获取仓房列表
    $.ajax({ //查询按钮权限
        url: GserverURL+"/la/house/houseList",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.houseInfos = response.data;
        }
    });

    //摄像机类型
    $.ajax({
        url: GserverURL+ "/camera/dvr/typeList",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.dvrType = response.data;
        }
    });


    //添加数据
    $scope.save = function () {
        var table=$('#'+$scope.gridtableid).DataTable();
        //还需要转换回来数字
        $scope.camera.ishourse=$scope.camera.ishourse?1:0;
        $scope.camera.islight=$scope.camera.islight?1:0;
        var pData = {
            paras: JSON.stringify($scope.camera)
        };
        $.ajax({
            url: GserverURL+'/camera/info/save',
            method: 'POST',
            data: pData
        }).success(function (response) { //提交成功
            var success = response.success;
            var msg = response.info;
            if(success){
                // alert(msg);
                table.draw(); //重新加载数据
                rzhdialog(ngDialog,response.info,"success");
                $scope.toRemove();
            }else{
                // alert(msg);
                rzhdialog(ngDialog,response.info,"error");
            }
        }).error(function (response) { //提交失败

        });

    }
});




//修改信息
App.controller("updateCameraController", function ($scope, $http, $stateParams,ngDialog) {
    $scope.toRemove=function(){
        window.location.href = "#/camera/cameralist";
    }

    //硬盘录像机序号
    $.ajax({
        url: GserverURL+ "/camera/dvr/getAllList",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.dvrInfo = response.data;
        }
    });

    //获取仓房列表
    $.ajax({ //查询按钮权限
        url:GserverURL+"/la/house/houseList",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.houseInfos = response.data;
        }
    });
    //摄像机类型
    $.ajax({
        url: GserverURL+ "/camera/dvr/typeList",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.dvrType = response.data;
        }
    });


    //硬盘录像机序号
    $.ajax({
        url: GserverURL+ "/camera/info/loadById",
        method: 'POST',
        async: false,
        data: {id: $stateParams.id}
    }).success(function (response) {
        if (response.success) {
            $scope.camera = response.data;
            if(response.data!=null&&response.data.houseid!=null&&response.data.houseid!=''){

            }
            $scope.camera.houseid = parseInt(response.data.houseid);
            //增加这句用来显示按钮是否选择
            $scope.camera.ishourse=$scope.camera.ishourse==1?true:false;
            $scope.camera.islight=$scope.camera.islight==1?true:false;
        }
    });

    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //还需要转换回来数字
        $scope.camera.ishourse=$scope.camera.ishourse?1:0;
        $scope.camera.islight=$scope.camera.islight?1:0;
        var pData = {
            paras: JSON.stringify($scope.camera)
        };
        $.ajax({
            url:GserverURL+ '/camera/info/updateCamera',
            method: 'POST',
            data: pData
        }).success(function (response) { //提交成功
            var success = response.success;
            var msg = response.info;
            if(success){
                table.draw(); //重新加载数据
                rzhdialog(ngDialog,response.info,"success");
                $scope.toRemove();
            }else{
                // alert(msg);
                rzhdialog(ngDialog,response.info,"error");
            }
        }).error(function (response) { //提交失败

        });
    }
});

// 查看详情
App.controller("viewCameraController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/camera/info/loadById',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.camera = response.data;
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
    //取消操作
    $scope.toRemove = function () {
        window.location.href = "#/app/la/device";
    }
});


