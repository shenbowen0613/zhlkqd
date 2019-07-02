/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
var global_type_code = null;
App.controller('fumigationcfgController', ['$scope', '$http',"$stateParams", "ngDialog", function ($scope, $http, $stateParams, ngDialog) {
    if(typeof($stateParams.id)=="undefined"){
        rzhdialog(ngDialog,"您还没有选中正确的模板数据！","error");
        return;
    }
    global_type_code = null;
    $scope.tplid=$stateParams.id;
    $scope.gridtableid="fumigationcfgTableGrids";
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url: GserverURL+"/sys/dict/list?typecode=xztaskparas",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.treeInfos = response.data;
        }
    });
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url: "/buss/res/tree?type=1",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.restreeInfos = response.data;
        }
    });
    var base_levels = "";
    var levels = null;
    var pData = { code: moduleId}; //设置模块id（用以查询模块对应的操作按钮）
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
    //设定权限
    var oprHtml= getHtmlInfos("app/views/base/to_delete.html", "删除参数", "todelete")
        + getHtmlInfos("app/views/base/to_add.html", "添加参数", "toadd")
        +getHtmlInfos("app/views/base/to_back.html", "返回", "toback");
    angular.element("#topBar").append(oprHtml); //添加功能按钮



    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/app/tpl/fumigationcfg/"+$scope.tplid;
    }
    //绑定topbar操作
    //添加
    $("#toadd").click(function () {
        window.location.href = "#/app/tpl/fumigationcfg/"+$scope.tplid+"/add";
    });

    //修改
    $("#toupdate").click(function () {
        //获得table
        var table=$('#'+$scope.gridtableid).DataTable();
        var fumigationcfg=getTableData(table);
        if(fumigationcfg==null){
            rzhdialog(ngDialog,"请先选择一条要修改的数据！","error");
            return;
        }
        $scope.fumigationcfg=fumigationcfg;
        $scope.oldno=fumigationcfg.no;
        window.location.href = "#/app/tpl/fumigationcfg/"+$scope.tplid+"/update";
        $("#user").val(fumigationcfg.user);
    });

    //删除
    $("#todelete").click(function () {
        //获得table
        var table=$('#'+$scope.gridtableid).DataTable();
        var fumigationcfg=getTableData(table);
        if(fumigationcfg==null){
            rzhdialog(ngDialog,"请先选择一条要删除的数据！","error");
            return;
        }
        ngDialog.openConfirm({
            template: 'delfumigationcfgDialogId',
            className: 'ngdialog-theme-default'
        }).then(function (value) { //用户点击确认
           $http({
                url: GserverURL+'/tpl/fumigation/paradelete',
                method: 'POST',
                data: {id:$scope.tplid ,no: fumigationcfg.no}
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
        window.location.href = "#/app/tpl/fumigation";
    });

}]);


//类型树信息处理
App.controller('fumigationcfgTypeController', ['$scope', "$http", function ($scope, $http) {
    $scope.show_all_info = true;
    $scope.all_info = "全部类型";
    $scope.showAllInfo = function(){
        global_type_code=null;
        $scope.toRemove();
        $("#contractTypePanel").find("li").removeClass("active"); //清除已选中
        var table = $('#'+$scope.gridtableid).DataTable();
        table.draw();
        ckClickTr($scope.gridtableid); //单击行，选中复选框
    }
    //选择信息
    $scope.my_tree_handler = function (branch) {
        $scope.toRemove();
        $scope.output = branch.code;
        if (branch.children && branch.children.code) {
            $scope.output += '(' + branch.children.code + ')';
            return $scope.output;
        }
        global_type_code = $scope.output;
        var table = $('#'+$scope.gridtableid).DataTable();
        table.draw();
        ckClickTr($scope.gridtableid); //单击行，选中复选框
    };
}]);

//列表信息处理
App.controller('fumigationcfgGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData),"id":$scope.tplid,"type":global_type_code}, //以json格式传递
            async: false,
            "success": function (resp) {
                fnCallback(resp.data); //服务器端返回的对象的returnObject部分是要求的格式
            }
        });
    }

    //数据列表信息
    var table = $('#'+$scope.gridtableid).DataTable({
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(1).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "/tpl/fumigation/paralist",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            //{mDataProp: "id", sTitle: "id"},
            {mDataProp: "name", sTitle: "参数类型"},
            {mDataProp: "code", sTitle: "药剂编号"},
            {mDataProp: "codename", sTitle: "药剂名称"},
            {mDataProp: "num", sTitle: "药剂用量"}
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
            }
        ]
    });
    //添加序号
    table.draw();
    //选项框
    gridInfoCheckAll($scope.gridtableid); // 全选/全不选
    ckClickTr($scope.gridtableid); //单击行，选中复选框
}]);



//添加信息
App.controller("addfumigationcfgController", function ($scope, $http, ngDialog) {
    $scope.fumigationcfg = null;
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{

            //封装来源名称
            angular.forEach($scope.treeInfos, function (data, index, array) {
                if($scope.fumigationcfg.type==data.code){
                    $scope.fumigationcfg.name=data.label;
                }
            });
            //封装来源名称
            angular.forEach($scope.restreeInfos, function (data, index, array) {
                if($scope.fumigationcfg.code==data.code){
                    $scope.fumigationcfg.codename=data.label;
                }
            });
            var pData = {
                id:$scope.tplid,
                paras: JSON.stringify($scope.fumigationcfg)
            };
           $http({
                url: GserverURL+'/tpl/fumigation/paraadd',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.fumigationcfg = null;
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

