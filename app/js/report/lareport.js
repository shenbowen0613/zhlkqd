/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */


var global_type_code = null;
App.controller('lareportController', ['$scope', '$http',"$stateParams", "ngDialog", function ($scope, $http,$stateParams, ngDialog) {
    global_type_code = null;
    $scope.gridtableid="lareportTableGrids";
    $scope.global_type="day";//默认为日报表
    $scope.global_redirect_path="/";
    $scope.lareport_treeshow=true;
    if(typeof($stateParams.path)!="undefined"&&$stateParams.path!=''){
        $scope.lareport_treeshow=false;
        $scope.global_redirect_path="/"+$stateParams.path;
        if($stateParams.path.indexOf("custody")>-1){
            global_type_code="lacustody";
        }else
        if($stateParams.path.indexOf("latask")>-1){
            global_type_code="latask";
        }else
        if($stateParams.path.indexOf("operation")>-1){
            global_type_code="laoperation";
        }else
        if($stateParams.path.indexOf("device")>-1){
            global_type_code="ladevice";
        }else
        if($stateParams.path.indexOf("res")>-1){
            global_type_code="lares";
        }
    }
    //获取类型树信息
    //$.ajax({ //查询按钮权限
    //    url: GserverURL+"/sys/dict/list?typecode=reporttimes",
    //    method: 'POST',
    //    async: false
    //}).success(function (response) {
    //    if (response.success) {
    //        $scope.codetimestreeInfos = response.data;
    //    }
    //});
    var base_levels = "";
    var levels = null;
    var pData = { code: moduleId}; //设置模块id（用以查询模块对应的操作按钮）
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
    var oprHtml= getHtmlInfos("app/views/base/to_add.html", "生成报表", "toadd");
    if(!$scope.lareport_treeshow){
        oprHtml+= getHtmlInfos("app/views/base/to_back.html", "返回", "toback");
    }
    angular.element("#topBar").append(oprHtml); //添加功能按钮
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
        url: GserverURL+"/sys/dict/list?typecode=lareport",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.treeInfos = response.data;
        }
    });

    //添加
    $("#toadd").click(function () {
        if(global_type_code==null){
            rzhdialog(ngDialog,"您还没有选择一个分类！","error");
            return;
        }
        //拼装模板code
        var pData={
            code:global_type_code+ $scope.global_type
        };
        $http({
            url: GserverURL+'/tpl/reports/tree',
            method: 'POST',
            data: pData
        }).success(function (response) { //提交成功
            if (response.success) { //信息处理成功，进入用户中心页面
                $scope.tplcodetreeInfos=response.data;
                window.location.href = "#/app/report/la"+$scope.global_redirect_path+"/add";
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog,response.info,"error");
            }
        }).error(function (response) { //提交失败
            rzhdialog(ngDialog,"操作失败","error");
        })
    });
    //返回
    $("#toback").click(function () {
        if($scope.lareport_treeshow){
            return;
        }
        window.location.href = "#"+$scope.global_redirect_path.replace(/-/g,"/");//替换返回路径
    });
    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/app/report/la"+$scope.global_redirect_path;
    }

}]);



//类型树信息处理
App.controller('lareportTypeController', ['$scope', "$http", function ($scope, $http) {
    $scope.show_all_info = true;
    $scope.all_info = "全部类型";
    $scope.showAllInfo = function(){
        global_type_code=null;
        $scope.toRemove();
        $("#lareportTypePanel").find("li").removeClass("active"); //清除已选中
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
App.controller('lareportGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData),"typelike":"la","typecode":global_type_code,"type":$scope.global_type}, //以json格式传递
            async: false,
            "success": function (resp) {
                fnCallback(resp.data); //服务器端返回的对象的returnObject部分是要求的格式
            }
        });
    }

    //var operatehtml=getHtmlInfos("app/views/base/grid_details.html","详情查看","toview")+"&nbsp;"+getHtmlInfos("app/views/base/grid_download.html","文件下载","todownload");
    var operatehtml=getHtmlInfos("app/views/base/grid_download.html","文件下载","todownload");
    //数据列表信息
    var table = $('#'+$scope.gridtableid).DataTable({
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(1).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "/buss/reports/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {
                mDataProp: "typecode", sTitle: "类型",
                render: function (typecode, type, full, meta) {
                    //封装来源名称
                    angular.forEach($scope.treeInfos, function (data, index, array) {
                        if(typecode==data.code){
                            typecode=data.label;
                        }
                    });
                    return typecode;
                }
            },
            {mDataProp: "name", sTitle: "名称"},
            //{mDataProp: "fileurl", sTitle: "文件"},
            {mDataProp: "summary", sTitle: "摘要"},
            {
                mDataProp: "starttime",
                sTitle: "开始时间",
                render: function (data, type, full, meta) {
                    return data == null ? '' : formatDay(data);
                }
            },
            {
                mDataProp: "endtime",
                sTitle: "结束时间",
                render: function (data, type, full, meta) {
                    return data == null ? '' : formatDay(data);
                }
            },
            {mDataProp: "operator", sTitle: "操作员"},
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
        window.location.href = "#/app/report/la"+$scope.global_redirect_path+"/view/"+data.id;
    });
    //文件下载
    $("#"+$scope.gridtableid+" tbody").on('click', 'tr td button.todownload', function () {
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        openfile(ngDialog,data.fileurl);
    });
}]);
// 查看详情
App.controller("viewlareportController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/buss/reports/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.lareport = response.data;
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
});

//添加信息
App.controller("addlareportController", function ($scope, $http, $filter, ngDialog) {
    $scope.lareport = {};

    $('#reporttime,#endtime,#starttime').datetimepicker({ //加载日期插件
        todayBtn:  1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        minView: 2, //最小显示单位  2 代表到天
        todayHighlight: 1 //今天日期高亮
    });

    //显示显示
    if($scope.global_type=="all"){
        $scope.reporttime_show=false;
        $scope.starttime_show=true;
        $scope.endtime_show=true;
    }else{
        $scope.reporttime_show=true;
        $scope.starttime_show=false;
        $scope.endtime_show=false;
    }
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //编码输入不合法
        //if ($scope.form.code.$invalid) {
        //    rzhdialog(ngDialog,"请按要求填写编码","error");
        //}
        if($scope.type==null||$scope.type=="undefined"){
            //rzhdialog(ngDialog,"请选择一个生成的文件类型！","error"); return;
            $scope.type="xls";
        }
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            if($scope.global_type=="all"){
                var isallselect=true;
                if($scope.starttime!=null&&$scope.starttime!=''){
                    $scope.lareport.starttime =formatDayNum8($scope.starttime); //格式化开始日期
                }else{
                    isallselect=false;
                }
                if($scope.endtime!=null&&$scope.endtime!=''){
                    $scope.lareport.endtime = formatDayNum8($scope.endtime); //格式化开始日期
                }else{
                    isallselect=false;
                }
                if(isallselect&&$scope.starttime>$scope.endtime){
                    rzhdialog(ngDialog,"开始时间不能早于结束时间！","error");
                    return;
                }
            }else{
                if($scope.reporttime!=null&&$scope.reporttime!=''){
                    $scope.lareport.starttime =formatDayNum8($scope.reporttime); //格式化开始日期
                }else{
                    rzhdialog(ngDialog,"统计时间不能为空！","error");
                    return;
                }
            }
            //增加分类属性
            $scope.lareport.typecode=global_type_code;
            $scope.lareport.type=$scope.global_type;
            var pData = {
                paras: JSON.stringify($scope.lareport),
                type:$scope.type
            };
           $http({
                url: GserverURL+'/buss/reports/add',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.lareport = null;
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
