/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

var global_type_code = null;
App.controller('rsplanController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {
    global_type_code = null;
    $scope.gridtableid="rsplanTableGrids";
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url: GserverURL+"/sys/dict/list?typecode=rsgainplan",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.treeInfos = response.data;
        }
    });
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url: "/tpl/approval/tree?typecode=rsgainplan",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.tplapprovaltreeInfos = response.data;
        }
    });
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url: GserverURL+"/sys/dict/list?typecode=planstatus",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.statustreeInfos = response.data;
        }
    });
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url: GserverURL+"/sys/dict/list?typecode=plansource",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.sourcetreeInfos = response.data;
        }
    });
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url: GserverURL+"/sys/dict/list?typecode=prioritytype",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.prioritytreeInfos = response.data;
        }
    });

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

            $("#toreport").addClass("btn-bg-color");
            $("#toreport").removeClass("btn-default");

            $("#toupload").addClass("btn-bg-color");
            $("#toupload").removeClass("btn-default");

            $("#toapproval").addClass("btn-bg-color");
            $("#toapproval").removeClass("btn-purple");

            $("#tochange").addClass("btn-bg-color");
            $("#tochange").removeClass("btn-purple");
            topbar_bind_operate(ngDialog);//绑定topbar操作
        } else {
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
            rzhdialog(ngDialog,"操作失败","error");
        }
    );
    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/app/buss/rsplan";
    }
    //绑定topbar操作
    function topbar_bind_operate(ngDialog){
        //获得table
        var table=$('#'+$scope.gridtableid).DataTable();
        //添加
        $("#toadd").click(function () {
            if(global_type_code==null){
                rzhdialog(ngDialog,"您还没有选择一个分类！","error");
                return;
            }
            window.location.href = "#/app/buss/rsplan/add";
        });

        //修改
        $("#toupdate").click(function () {
            var rsplan=getTableData(table);
            if(rsplan==null){
                rzhdialog(ngDialog,"请先选择一条要修改的数据！","error");
                return;
            }
            if(rsplan.statuscode!=0&&rsplan.statuscode!=-1){
                rzhdialog(ngDialog,'只有“已创建”和“已取消”状态可以修改！',"error");
                return;
            }
            $scope.rsplan=rsplan;
            if($scope.rsplan.startime!=null&&$scope.rsplan.startime!=''){
                $scope.rsplan.startime = formatDay($scope.rsplan.startime); //格式化开始日期
            }
            if($scope.rsplan.endtime!=null&&$scope.rsplan.endtime!=''){
                $scope.rsplan.endtime = formatDay($scope.rsplan.endtime); //格式化结束日期
            }
            window.location.href = "#/app/buss/rsplan/update";
            $("#sourcecode").val(rsplan.sourcecode); //
            $("#statuscode").val(rsplan.statuscode); //
            $("#priority").val(rsplan.priority); //
        });

        //删除
        $("#todelete").click(function () {
            var rsplan=getTableData(table);
            if(rsplan==null){
                rzhdialog(ngDialog,"请先选择一条要删除的数据！","error");
                return;
            }
            if(rsplan.statuscode!=0&&rsplan.statuscode!=-1){
                rzhdialog(ngDialog,'只有“已创建”和“已取消”状态可以删除！',"error");
                return;
            }
            ngDialog.openConfirm({
                template: 'delrsplanDialogId',
                className: 'ngdialog-theme-default'
            }).then(function (value) { //用户点击确认
                $http({
                    url: '/buss/plan/delete',
                    method: 'POST',
                    data: {id: rsplan.id}
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
        //更改流程
        $("#tochange").click(function(){
            var rsplan=getTableData(table);
            if(rsplan==null){
                rzhdialog(ngDialog,"请先选择一条要更改状态的数据！","error");
                return;
            }
            $scope.rsplan=rsplan;
            //获取类型树信息
            $.ajax({ //查询按钮权限
                url: "/buss/plan/status?id="+rsplan.id,
                method: 'POST',
                async: false
            }).success(function (response) {
                if (response.success) {
                    $scope.statustreeInfos = response.data;
                    window.location.href = "#/app/buss/rsplan/change";
                }else{
                    rzhdialog(ngDialog,response.info,"error");
                }
            });
        });
        //配置审批
        $("#toapproval").click(function(){
            var rsplan=getTableData(table);
            if(rsplan==null){
                rzhdialog(ngDialog,"请先选择一条要查看审批流程的数据！","error");
                return;
            }
            window.location.href="#/app/buss/approval/rsplan/"+rsplan.code;
        });
        //上传附件
        $("#toupload").click(function(){
            var rsplan=getTableData(table);
            if(rsplan==null){
                rzhdialog(ngDialog,"请先选择一条要上传附件的数据！","error");
                return;
            }
            window.location.href="#/app/buss/attach/rsplan/"+rsplan.code;
        });

        //生成报表
        $("#toreport").click(function(){
            window.location.href = "#/app/report/rsgain"+"/app-buss-rsplan";
            return;
        });
    }

}]);



//类型树信息处理
App.controller('rsplanTypeController', ['$scope', "$http", function ($scope, $http) {
    $scope.show_all_info = true;
    $scope.all_info = "全部类型";
    $scope.showAllInfo = function(){
        global_type_code=null;
        $scope.toRemove();
        $("#rsplanTypePanel").find("li").removeClass("active"); //清除已选中
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
App.controller('rsplanGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData),"type":"rsgain","typecode":global_type_code}, //以json格式传递
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
        ajaxSource: "/buss/plan/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            //{mDataProp: "id", sTitle: "id"},
            {mDataProp: "typecode", sTitle: "类型",
                render: function (data, type, full, meta) {
                    angular.forEach($scope.treeInfos, function (treeInfo, index, array) {
                        if(data==treeInfo.code){
                            data=treeInfo.label;
                        }
                    });
                    return data;
                }
            },
            {mDataProp: "name", sTitle: "名称"},
            {mDataProp: "innercode", sTitle: "计划内码"},
            {mDataProp: "planno", sTitle: "文件号"},
            {mDataProp: "author", sTitle: "负责人"},

            {mDataProp: "statusname", sTitle: "执行状态"},
            {
                mDataProp: "uptime",
                sTitle: "更新日期",
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
        window.location.href = "#/app/buss/rsplan/view/"+data.id;
    });
}]);
// 查看详情
App.controller("viewrsplanController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/buss/plan/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.rsplan = response.data;
            angular.forEach($scope.treeInfos, function (data, index, array) {
                if($scope.rsplan.typecode==data.code){
                    $scope.rsplan.typecode=data.label;
                }
            });
            angular.forEach($scope.prioritytreeInfos, function (data, index, array) {
                if($scope.rsplan.priority==data.code){
                    $scope.rsplan.priority=data.label;
                }
            });
            if($scope.rsplan.startime!=null&&$scope.rsplan.startime!=''){
                $scope.rsplan.startime=formatDay( $scope.rsplan.startime);
            }
            if($scope.rsplan.endtime!=null&&$scope.rsplan.endtime!=''){
                $scope.rsplan.endtime=formatDay( $scope.rsplan.endtime);
            }
            $scope.rsplan.crtime=formatDate( $scope.rsplan.crtime);
            $scope.rsplan.uptime=formatDate( $scope.rsplan.uptime);
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
    //取消操作
    $scope.toRemove = function () {
        window.location.href = "#/app/buss/rsplan";
    }
});

//添加信息
App.controller("addrsplanController", function ($scope, $http, $filter,ngDialog) {
    $('#endtime,#startime').datetimepicker({ //加载日期插件
        todayBtn:  1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        minView: 2, //最小显示单位  2 代表到天
        todayHighlight: 1 //今天日期高亮
    });
    $scope.rsplan = null;
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            //增加分类属性
            $scope.rsplan.typecode=global_type_code;

            if($scope.rsplan.startime!=null&&$scope.rsplan.startime!=''){
                $scope.rsplan.startime = formatDateNum14($scope.rsplan.startime); //格式化开始日期
            }
            if($scope.rsplan.endtime!=null&&$scope.rsplan.endtime!=''){
                $scope.rsplan.endtime = formatDateNum14($scope.rsplan.endtime); //格式化结束日期
            }
            //封装来源名称
            angular.forEach($scope.sourcetreeInfos, function (data, index, array) {
                if($scope.rsplan.sourcecode==data.code){
                    $scope.rsplan.source=data.label;
                }
            });
            var pData = {
                paras: JSON.stringify($scope.rsplan),
                code:$scope.approvalcode
            };
           $http({
                url: GserverURL+'/buss/plan/add',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.rsplan = null;
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

//修改信息
App.controller("updatersplanController", function ($scope, $http,$filter, ngDialog) {
    $('#endtime,#startime').datetimepicker({ //加载日期插件
        todayBtn:  1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        minView: 2, //最小显示单位  2 代表到天
        todayHighlight: 1 //今天日期高亮
    });
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            if($scope.rsplan.startime!=null&&$scope.rsplan.startime!=''){
                $scope.rsplan.startime = formatDateNum14($scope.rsplan.startime); //格式化开始日期
            }
            if($scope.rsplan.endtime!=null&&$scope.rsplan.endtime!=''){
                $scope.rsplan.endtime = formatDateNum14($scope.rsplan.endtime); //格式化结束日期
            }
            //封装来源名称
            angular.forEach($scope.sourcetreeInfos, function (data, index, array) {
                if($scope.rsplan.sourcecode==data.code){
                    $scope.rsplan.source=data.label;
                }
            });
            var pData = {
                paras: JSON.stringify($scope.rsplan),
                code:$scope.approvalcode
            };
           $http({
                url: GserverURL+'/buss/plan/update',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.rsplan=null;
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


//修改状态
App.controller("changersplanController", function ($scope, $http,$filter, ngDialog) {
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            //封装来源名称
            angular.forEach($scope.statustreeInfos, function (data, index, array) {
                if($scope.rsplan.statuscode==data.code){
                    $scope.rsplan.statusname=data.label;
                }
            });
            var pData = {
                paras: JSON.stringify($scope.rsplan)
            };
           $http({
                url: GserverURL+'/buss/plan/change',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.rsplan=null;
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
