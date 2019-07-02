/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
var global_isagree_show=true;
App.controller('approvaldoController', ['$scope', '$http','$stateParams', "ngDialog", function ($scope, $http,$stateParams, ngDialog) {
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

    $scope.gridtableid="approvaldoTableGrids";
    var base_levels = "";
    var levels = null;
    var pData = { code: moduleId}; //设置模块id（用以查询模块对应的操作按钮）
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
    //设定权限
    var oprHtml= getHtmlInfos("app/views/base/to_back.html", "返回", "toback");
    angular.element("#topBar").append(oprHtml); //添加功能按钮

    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/app/buss/approval/"+$scope.type+"/"+$scope.precode;
    }
    //返回上级
    $("#toback").click(function () {
        if($scope.type=="index"){
            window.location.href = "#/app/index";
        }else{
            window.location.href = "#/app/buss/"+$scope.type;
        }
    });

    //封装名称
    $scope.cursteplist=function(steps){
        var arrlist=[];
        steps=steps.split(",");
        for(var i=0;i<steps.length;i++){
            if(steps[i]==0){
                arrlist.push({code:steps[i],name:"结束审批"});
            }else{
                arrlist.push({code:steps[i],name:"第"+steps[i]+"步"});
            }
        }
        return arrlist;
    }
    //封装名称
    $scope.curstepobj=function(stepsjson,curstepcode){
        var steps=eval(stepsjson);
        for(var i=0;i<steps.length;i++){
            if(steps[i].no==curstepcode){
               return steps[i];
            }
        }
        return null;
    }
}]);


//列表信息处理
App.controller('approvaldoGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
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

    //数据列表信息
    var table = $('#'+$scope.gridtableid).DataTable({
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(1).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "/buss/approval/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {mDataProp: "curstepcode", sTitle: "步骤",
                render: function (data, type, full, meta) {
                    return '第'+data+'步';
                }
            },
            {mDataProp: "curstep", sTitle: "步骤名"},
            {mDataProp: "operator", sTitle: "审批人"},
            {
                mDataProp: "appstate",
                sTitle: "审批状态",
                render: function (data, type, full, meta) {
                    if(data==0){
                        return '<font class="text-warning">'+full.appresult+'</font>';
                    }else if(data==1){
                        return '<font class="text-success">'+full.appresult+'</font>';
                    }else if(data==-1){
                        return '<font class="text-danger">'+full.appresult+'</font>';
                    }
                    return '未知';
                }
            },

            {
                mDataProp: "uptime",
                sTitle: "更新日期",
                render: function (data, type, full, meta) {
                    return data == null ? '' : formatDate(data);
                }
            },

            {
                mDataProp: "id",sTitle: "操作",
                render: function (data, type, full, meta) {
                    //当前状态未审批，而且登陆用户为审批用户
                    if(full.appstate==0&&loginUsercode==full.operator){
                        return getHtmlInfos("app/views/base/grid_agree.html","审批通过","toagree")+" "+getHtmlInfos("app/views/base/grid_reject.html","审批驳回","toreject");
                    }else{
                        return getHtmlInfos("app/views/base/grid_details.html","查看","toview");
                    }
                    return '';
                }
            }
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
    //行内查看
    $("#"+$scope.gridtableid+" tbody").on('click', 'tr td button.toagree', function () {
        var approval = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        //获得table
        global_isagree_show=true;
        window.location.href = "#/app/buss/approval/"+$scope.type+"/"+$scope.precode+"/update/"+approval.id;

    });
    //行内查看
    $("#"+$scope.gridtableid+" tbody").on('click', 'tr td button.toreject', function () {
        var approval = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        //获得table
        global_isagree_show=false;
        window.location.href = "#/app/buss/approval/"+$scope.type+"/"+$scope.precode+"/update/"+approval.id;
    });
    //行内查看
    $("#"+$scope.gridtableid+" tbody").on('click', 'tr td button.toview', function () {
        var approval = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        //获得table
        window.location.href = "#/app/buss/approval/"+$scope.type+"/"+$scope.precode+"/view/"+approval.id;
    });
}]);
// 查看详情
App.controller("viewapprovaldoController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/buss/approval/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.approval = response.data;
            $scope.approval.crtime=formatDate( $scope.approval.crtime);
            $scope.approval.uptime=formatDate( $scope.approval.uptime);
            var curstep=$scope.curstepobj($scope.approval.steps,$scope.approval.curstepcode);
            if(curstep==null){ rzhdialog(ngDialog,"操作非法","error");return;}
            $scope.agreelist=$scope.cursteplist(curstep.agree);
            $scope.rejectlist=$scope.cursteplist(curstep.reject);
            //判断
            var appstate=$scope.approval.appstate;
            if(appstate==0){
                $scope.approval.appresult='<font class="text-warning">'+$scope.approval.appresult+'</font>';
            }else if(appstate==1){
                $scope.approval.appresult='<font class="text-success">'+$scope.approval.appresult+'</font>';
            }else if(appstate==-1){
                $scope.approval.appresult= '<font class="text-danger">'+$scope.approval.appresult+'</font>';
            }
            //跳转步骤
            if( $scope.approval.tostepcode==null|| $scope.approval.tostepcode==''){
                $scope.approval.tostepcode="无"
            }else if($scope.approval.tostepcode==0){
                $scope.approval.tostepcode="结束审批"
            }else{
                $scope.approval.tostepcode="第"+$scope.approval.tostepcode+"步";
            }
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
});

//修改信息
App.controller("updateapprovaldoController", function ($scope, $stateParams, $http, ngDialog) {
    //是否显示
    if(global_isagree_show){
        $scope.agree_show=true;
        $scope.reject_show=false;
    }else{
        $scope.agree_show=false;
        $scope.reject_show=true;
    }
    // 查看详情
    $http({
            url: GserverURL+ '/buss/approval/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.approval = response.data;
            if(global_isagree_show){
            	$scope.approval.content="同意审批";
            }else{
            	$scope.approval.content="驳回审批";
            }
            //
            var curstep=$scope.curstepobj($scope.approval.steps,$scope.approval.curstepcode);
            if(curstep==null){ rzhdialog(ngDialog,"操作非法","error");return;}
            $scope.agreelist=$scope.cursteplist(curstep.agree);
            $scope.rejectlist=$scope.cursteplist(curstep.reject);
            if(global_isagree_show){
                if($scope.agreelist.length>0){
                    $scope.approval.tostepcode=$scope.agreelist[0].code;
                }
            }else{
                if($scope.rejectlist.length>0){
                    $scope.approval.tostepcode=$scope.rejectlist[0].code;
                }
            }
            //添加数据
            $scope.save = function () {
                angularParamString($http); //解决post提交接收问题，json方式改为string方式
                var table = $('#'+$scope.gridtableid).DataTable();
                if($scope.approval.tostepcode==null||$scope.approval.tostepcode=="undefined"){
                    rzhdialog(ngDialog,"请选择正确的步骤","error");
                    return;
                }

                if($scope.approval.content==null||$scope.approval.content==""){
                    rzhdialog(ngDialog,"请填写您的审批意见","error");
                    return;
                }

                //验证通过
                if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
                    //是否驳回
                    if(global_isagree_show){
                        $scope.approval.appstate=1;
                        $scope.approval.appresult="审批通过";
                    }else{
                        $scope.approval.appstate=-1;
                        $scope.approval.appresult="审批驳回";
                    }
                    var pData = {
                        paras: JSON.stringify($scope.approval)
                    };
                    $http({
                        url: '/buss/approval/update',
                        method: 'POST',
                        data: pData
                    }).success(function (response) { //提交成功
                        if (response.success) { //信息处理成功，进入用户中心页面
                            $scope.approval=null;
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
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })

});
