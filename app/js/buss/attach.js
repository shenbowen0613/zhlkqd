/*
 * Copyright (c) 2016. .保留所有权利.
 *                       
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

App.controller('attachController', ['$scope', '$http',"$stateParams", "ngDialog", function ($scope, $http, $stateParams,ngDialog) {
    if($stateParams.type==null){
        rzhdialog(ngDialog,"参数错误！","error");
        return;
    }
    if($stateParams.code==null){
        rzhdialog(ngDialog,"参数错误！","error");
        return;
    }
    //判断参数合法性
    $scope.type=$stateParams.type;//类型编码
    $scope.precode=$stateParams.code;//上级编码

    $scope.gridtableid="attachTableGrids";
    var base_levels = "";
    var levels = null;
    var pData = { code: moduleId}; //设置模块id（用以查询模块对应的操作按钮）
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
    //设定权限
    var oprHtml= getHtmlInfos("app/views/base/to_delete.html", "删除附件", "todelete")
        +getHtmlInfos("app/views/base/to_update.html", "修改附件", "toupdate")
        + getHtmlInfos("app/views/base/to_add.html", "添加附件", "toadd")
        +getHtmlInfos("app/views/base/to_back.html", "返回", "toback");
    angular.element("#topBar").append(oprHtml); //添加功能按钮

    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/app/buss/attach/"+$scope.type+"/"+$scope.precode;
    }
    //绑定topbar操作
    //添加
    $("#toadd").click(function () {
        window.location.href = "#/app/buss/attach/"+$scope.type+"/"+$scope.precode+"/add";
    });

    //修改
    $("#toupdate").click(function () {
        //获得table
        var table=$('#'+$scope.gridtableid).DataTable();
        var attach=getTableData(table);
        if(attach==null){
            rzhdialog(ngDialog,"请先选择一条要修改的数据！","error");
            return;
        }
        $scope.attach=attach;
        window.location.href = "#/app/buss/attach/"+$scope.type+"/"+$scope.precode+"/update";
    });

    //删除
    $("#todelete").click(function () {
        //获得table
        var table=$('#'+$scope.gridtableid).DataTable();
        var attach=getTableData(table);
        if(attach==null){
            rzhdialog(ngDialog,"请先选择一条要删除的数据！","error");
            return;
        }
        ngDialog.openConfirm({
            template: 'delattachDialogId',
            className: 'ngdialog-theme-default'
        }).then(function (value) { //用户点击确认
           $http({
                url: GserverURL+'/buss/attach/delete',
                method: 'POST',
                data: {id: attach.id}
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

    //返回上级
    $("#toback").click(function () {
        window.location.href = "#/app/buss/"+$scope.type;
    });

}]);


//列表信息处理
App.controller('attachGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData),"precode":$scope.precode}, //以json格式传递
            async: false,
            "success": function (resp) {
                fnCallback(resp.data); //服务器端返回的对象的returnObject部分是要求的格式
            }
        });
    }

    var operatehtml = getHtmlInfos("app/views/base/grid_details.html","详情查看","toview")
                    +"&nbsp;"
                    + getHtmlInfos("app/views/base/grid_download.html","文件下载","todownload");
    //数据列表信息
    var table = $('#'+$scope.gridtableid).DataTable({
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(1).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "/buss/attach/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            //{mDataProp: "id", sTitle: "id"},
            {mDataProp: "name", sTitle: "名称"},
            {mDataProp: "summary", sTitle: "摘要"},
            {
                mDataProp: "crtime",
                sTitle: "创建日期",
                render: function (data, type, full, meta) {
                    return data == null ? '' : formatDate(data);
                }
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
        window.location.href = "#/app/buss/attach/"+$scope.type+"/"+$scope.precode+"/view/"+data.id;
    });
    //文件下载
    $("#"+$scope.gridtableid+" tbody").on('click', 'tr td button.todownload', function () {
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        openfile(ngDialog,data.fileurl);
    });
}]);
// 查看详情
App.controller("viewattachController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/buss/attach/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.attach = response.data;
            $scope.attach.crtime=formatDate( $scope.attach.crtime);
            $scope.attach.uptime=formatDate( $scope.attach.uptime);
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
});

//添加信息
App.controller("addattachController",["$scope","$http","ngDialog","FileUploader",function ($scope, $http, ngDialog,FileUploader) {
    $scope.attach = null;
    ////上传文件处理 begin
    var uploader = $scope.uploader = new FileUploader({
        url: '/buss/attach/add'
    });
    $scope.clearItems = function(){ //重新选择文件时，清空队列，达到覆盖文件的效果
        uploader.clearQueue();
    }
    //定义callback函数
    uploader.onBeforeUploadItem = function(item) {
        var formData = [{
            paras: JSON.stringify($scope.attach),
        }];
        Array.prototype.push.apply(item.formData, formData);
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) { //上传成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.attach = null;
            var table = $('#'+$scope.gridtableid).DataTable();
            table.draw(); //重新加载数据
            ckClickTr($scope.gridtableid); //单击行，选中复选框
            rzhdialog(ngDialog,response.info,"success");
            $scope.toRemove();
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
        $scope.clearItems();
    };
    uploader.onErrorItem = function (fileItem, response, status, headers) {
        $scope.clearItems();
        rzhdialog(ngDialog,"文件上次失败！","error");
    };
    ////上传文件处理 end
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            //增加分类属性
            $scope.attach.typecode=$scope.type;
            $scope.attach.precode=$scope.precode;
            //上传文件
            uploader.uploadAll();
        }
    }
}]);

//修改信息
App.controller("updateattachController",["$scope","$http","ngDialog","FileUploader",function ($scope, $http, ngDialog,FileUploader) {
    ////上传文件处理 begin
    var uploader = $scope.uploader = new FileUploader({
        url: '/buss/attach/update'
    });
    $scope.clearItems = function(){ //重新选择文件时，清空队列，达到覆盖文件的效果
        uploader.clearQueue();
    }
    //定义callback函数
    uploader.onBeforeUploadItem = function(item) {
        var formData = [{
            paras: JSON.stringify($scope.attach),
        }];
        Array.prototype.push.apply(item.formData, formData);
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) { //上传成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.attach = null;
            var table = $('#'+$scope.gridtableid).DataTable();
            table.draw(); //重新加载数据
            ckClickTr($scope.gridtableid); //单击行，选中复选框
            rzhdialog(ngDialog,response.info,"success");
            $scope.toRemove();
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
        $scope.clearItems();
    };
    uploader.onErrorItem = function (fileItem, response, status, headers) {
        $scope.clearItems();
        rzhdialog(ngDialog,"文件上次失败！","error");
    };
    ////上传文件处理 end
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            //上传文件
            uploader.uploadAll();
        }
    }
}]);
