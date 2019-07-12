/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */


var global_type_code = null;
App.controller('rsgainreportController', ['$scope', '$http',"$stateParams", "ngDialog", function ($scope, $http,$stateParams, ngDialog) {
    global_type_code = null;
    $scope.gridtableid="rsgainreportTableGrids";
    $scope.global_type="day";//默认为日报表
    $scope.global_redirect_path="/";
    $scope.rsgainreport_treeshow=true;
    if(typeof($stateParams.path)!="undefined"&&$stateParams.path!=''){
        $scope.rsgainreport_treeshow=false;
        $scope.global_redirect_path="/"+$stateParams.path;
        if($stateParams.path.indexOf("rsplan")>-1){
            global_type_code="rsplan";
        }else
        if($stateParams.path.indexOf("rscustody")>-1){
            global_type_code="rscustody";
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
    // var oprHtml= getHtmlInfos("app/views/base/to_add.html", "生成报表", "toadd");
    var oprHtml= "";
    if(!$scope.rsgainreport_treeshow){
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
        url: GserverURL+"/sys/dict/list?typecode=rsgainreport",
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
                window.location.href = "#/app/report/rsgain"+$scope.global_redirect_path+"/add";
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog,response.info,"error");
            }
        }).error(function (response) { //提交失败
            rzhdialog(ngDialog,"操作失败","error");
        })
    });
    //返回
    $("#toback").click(function () {
        if($scope.rsgainreport_treeshow){
            return;
        }
        window.location.href = "#"+$scope.global_redirect_path.replace(/-/g,"/");//替换返回路径
    });


}]);



//类型树信息处理
App.controller('rsgainreportTypeController', ['$scope', "$http", function ($scope, $http) {
    $scope.show_all_info = true;
    $scope.all_info = "报表类型";
    $scope.showAllInfo = function(){
        global_type_code=null;
        $scope.toRemove();
        $("#rsgainreportTypePanel").find("li").removeClass("active"); //清除已选中
        var table = $('#'+$scope.gridtableid).DataTable();
        table.draw();
        ckClickTr($scope.gridtableid); //单击行，选中复选框
    }
    //选择信息
    $scope.my_tree_handler = function (branch) {
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
App.controller('rsgainreportGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData),"typelike":"rs","typecode":global_type_code,"type":$scope.global_type}, //以json格式传递
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
        window.location.href = "#/app/report/rsgain"+$scope.global_redirect_path+"/view/"+data.id;
    });
    //文件下载
    $("#"+$scope.gridtableid+" tbody").on('click', 'tr td button.todownload', function () {
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        openfile(ngDialog,data.fileurl);
    });
}]);
// 查看详情
App.controller("viewrsgainreportController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
        url: GserverURL+ '/buss/reports/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.rsgainreport = response.data;
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
});

//添加信息
App.controller("addrsgainreportController", function ($scope, $http, $filter, ngDialog) {
    $.ajax({ //获取仓房信息
        url: GserverURL + "/la/house/houseList",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.houseItems = response.data;
        }

    });
    $scope.rsgainreport = {};
    //开启开始日期弹框
    $scope.reporttimeOpen = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.reporttimeIsOpen = true;
    };
    //开启开始日期弹框
    $scope.starttimeOpen = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.starttimeIsOpen = true;
    };
    //开启开始日期弹框
    $scope.endtimeOpen = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.endtimeIsOpen = true;
    };
    //显示显示
    if($scope.global_type=="all"){
        $scope.reporttime_show=true;
        $scope.starttime_show=false;
        $scope.endtime_show=false;
    }else{
        $scope.reporttime_show=false;
        $scope.starttime_show=true;
        $scope.endtime_show=true;
    }
    //关闭弹出窗口操作
    $scope.toRemove=function(){
        $scope.rsgainreport.starttime=null;
        $scope.starttime=null;
        $scope.rsgainreport.endtime=null;
        $scope.endtime=null;
        $scope.housecode=null;
    }
    //添加数据
    $scope.save = function () {
        if(global_type_code==null){
            rzhdialog(ngDialog,"您还没有选择报表类型！","error");
            return;
        }
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
                if($scope.reporttime!=null&&$scope.reporttime!=''){
                    $scope.rsgainreport.starttime = $filter('date')($scope.reporttime, 'yyyyMMddHHmmss'); //格式化开始日期
                }else{
                    rzhdialog(ngDialog,"统计时间不能为空！","error");
                    return;
                }
            }else{
                var isallselect=true;
                $scope.rsgainreport.starttime=null;
                $scope.rsgainreport.endtime=null;
                if(typeof($scope.starttime)!="undefined"&&$scope.starttime!=null&&$scope.starttime!=''){
                    $scope.rsgainreport.starttime = $filter('date')($scope.starttime, 'yyyyMMddHHmmss'); //格式化开始日期
                }else{
                    isallselect=false;
                }
                if(typeof($scope.endtime)!="undefined"&&$scope.endtime!=null&&$scope.endtime!=''){
                    $scope.rsgainreport.endtime = $filter('date')($scope.endtime, 'yyyyMMddHHmmss'); //格式化开始日期
                }else{
                    isallselect=false;
                }
                if(isallselect&&$scope.starttime>$scope.endtime){
                    rzhdialog(ngDialog,"开始时间不能早于结束时间！","error");
                    return;
                }

            }
            //增加分类属性
            // $scope.rsgainreport.typecode=global_type_code;
            // $scope.rsgainreport.type=$scope.global_type;
            // var pData = {
            //     paras: JSON.stringify($scope.rsgainreport),
            //     type:$scope.type
            // };
            var typeName="";
            angular.forEach($scope.treeInfos, function (data) {
                if(global_type_code==data.code){
                    typeName=data.label;
                }
            });
            var houseCode;
            if( $scope.housecode==undefined){
                houseCode='';
            }else{
                houseCode=$scope.housecode;
            }
            window.location.href= GserverURL+'/buss/reports/add?housecode='+ houseCode+'&typeName='+typeName+'&typecode='+global_type_code+"&starttime="+$scope.rsgainreport.starttime+"&endtime="+$scope.rsgainreport.endtime;
            // $http({
            //      url: GserverURL+'/buss/reports/add',
            //      method: 'POST',
            //      data: pData
            //  }).success(function (response) { //提交成功
            //      console.log(response);
            //     window.location.href=response;
            //     // console.log(response.info);
            //      // if (response.success) { //信息处理成功，进入用户中心页面
            //      //     $scope.rsgainreport = null;
            //      //     table.draw(); //重新加载数据
            //      //     ckClickTr($scope.gridtableid); //单击行，选中复选框
            //      //     rzhdialog(ngDialog,response.info,"success");
            //      //     $scope.toRemove();
            //      // } else { //信息处理失败，提示错误信息
            //      //     rzhdialog(ngDialog,response.info,"error");
            //      // }
            //  }).error(function (response) { //提交失败
            //      rzhdialog(ngDialog,"操作失败","error");
            //  })
        }
    }
});
