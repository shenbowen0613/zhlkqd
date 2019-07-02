/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */


var global_type_code = null;
App.controller('custodyController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {
    global_type_code = null;
    $scope.gridtableid="custodyTableGrids";
    $scope.global_type=1;//默认为入库

    var base_levels = "";
    var levels = null;
    var pData = { code: moduleId}; //设置模块id（用以查询模块对应的操作按钮）
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
    $http({ //查询按钮权限
        url: GserverURL+ '/sys/user/queryOperate',
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
    //增加事件
    $scope.tolistByType = function(val){
        $scope.global_type=val;
        //获得table
        var table=$('#'+$scope.gridtableid).DataTable();
        table.draw();
        ckClickTr($scope.gridtableid); //单击行，选中复选框
        $scope.toRemove();
    }
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url:GserverURL+"/la/house/tree",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.treeInfos = response.data;
        }
    });

    //绑定topbar操作
    function topbar_bind_operate(ngDialog){
        //获得table
        var table=$('#'+$scope.gridtableid).DataTable();
        //查看详情
        $("#todetails").click(function(){
            if(global_type_code==null){
                rzhdialog(ngDialog,"您还没有选择一个仓房！","error");
                return;
            }
            window.location.href = "#/app/la/custody/grain/"+global_type_code;
        });

        //生成报表
        $("#toreport").click(function(){
            window.location.href = "#/app/report/la"+"/app-la-custody";
            return;
        });
    }
    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/app/la/custody";
    }

}]);



//类型树信息处理
App.controller('custodyTypeController', ['$scope', "$http", function ($scope, $http) {
    $scope.show_all_info = true;
    $scope.all_info = "全部仓房";
    $scope.showAllInfo = function(){
        global_type_code=null;
        $scope.toRemove();
        $("#custodyTypePanel").find("li").removeClass("active"); //清除已选中
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
App.controller('custodyGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData),"housecode":global_type_code,"type":$scope.global_type}, //以json格式传递
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
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(1).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: GserverURL+"/la/custody/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {mDataProp: "varietyname", sTitle: "品种"},
            {mDataProp: "gradename", sTitle: "等级"},
            {mDataProp: "innum", sTitle: "入库量"},
            {mDataProp: "outnum", sTitle: "出库量"},
            {
                mDataProp: "isrs",
                sTitle: "类别",
                render: function (data, type, full, meta) {
                    return data ? '<font color="red">储备粮</font>' : '托市粮';
                }
            },
            {
                mDataProp: "warehousetime",
                sTitle: "入仓时间"
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
        window.location.href = "#/app/la/custody/view/"+data.id;
    });
}]);
// 查看详情
App.controller("viewcustodyController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/la/custody/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.custody = response.data;
            if($scope.custody!=null){
                if($scope.custody.isrs)$scope.custody.isrs="储备粮";
                else $scope.custody.isrs="托市粮";
            }
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
});
// 查看详情
App.controller("viewgrainController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/la/grain/view',
        method: 'POST',
        data: {housecode: $stateParams.housecode}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.grain = response.data;
            if($scope.grain!=null){
                if($scope.grain.isfile)$scope.grain.isfile="已归档";
                else $scope.grain.isfile="未归档";
                if($scope.grain.isrs)$scope.grain.isrs="储备粮";
                else $scope.grain.isrs="托市粮";
            }
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
});
