/*
 * Copyright (c) 2016. .保留所有权利.
 *                       
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

var global_type_code = null;
var global_type_housecode=null;
App.controller('lataskController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {
    global_type_code = null;
    global_type_housecode = null;
    $scope.gridtableid="lataskTableGrids";
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url: GserverURL+"/sys/dict/list?typecode=tasktype",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.treeInfos = response.data;
        }
    });


    $.ajax({ //查询按钮权限
        url: GserverURL+"/la/house/tree",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.housetreeInfos = response.data;
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
            $("#toapproval").addClass("btn-bg-color");
            $("#toapproval").removeClass("btn-purple");
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
        window.location.href = "#/app/buss/latask";
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
            }else if(global_type_housecode==null){
                rzhdialog(ngDialog,"您还没有选择一个仓库！","error");
                return;
            }
            window.location.href = "#/app/buss/latask/add";
        });

        //修改
        $("#toupdate").click(function () {
            var latask=getTableData(table);
            if(latask==null){
                rzhdialog(ngDialog,"请先选择一条要修改的数据！","error");
                return;
            }
            if(latask.curstepcode!=0&&latask.curstepcode!=-1){
                rzhdialog(ngDialog,'只有“已创建”和“已取消”状态可以修改！',"error");
                return;
            }
            $scope.latask=latask;
            window.location.href = "#/app/buss/latask/update";
            $("#typecode").val(latask.typecode); //
        });

        //删除
        $("#todelete").click(function () {
            var latask=getTableData(table);
            if(latask==null){
                rzhdialog(ngDialog,"请先选择一条要删除的数据！","error");
                return;
            }
            if(latask.curstepcode!=0&&latask.curstepcode!=-1){
                rzhdialog(ngDialog,'只有“已创建”和“已取消”状态可以删除！',"error");
                return;
            }
            ngDialog.openConfirm({
                template: 'dellataskDialogId',
                className: 'ngdialog-theme-default'
            }).then(function (value) { //用户点击确认
                $http({
                    url: '/buss/task/delete',
                    method: 'POST',
                    data: {id: latask.id}
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

        //配置审批
        $("#toapproval").click(function(){
            var latask=getTableData(table);
            if(latask==null){
                rzhdialog(ngDialog,"请先选择一条要查看审批流程的数据！","error");
                return;
            }
            window.location.href="#/app/buss/approval/latask/"+latask.code;
        });
        //使用记录
        $("#torec").click(function () {
            var latask=getTableData(table);
            if(latask==null){
                rzhdialog(ngDialog,"请先选择一条要查看的数据！","error");
                return;
            }
            $scope.taskcode=latask.code;
            $scope.taskname=latask.name;
            window.location.href = "#/app/buss/latask_rec/"+$scope.taskcode+"/"+$scope.taskname;
        });


        //更改流程
        $("#tochange").click(function(){
            var latask=getTableData(table);
            if(latask==null){
                rzhdialog(ngDialog,"请先选择一条要更改状态的数据！","error");
                return;
            }
            $scope.latask=latask;
            //获取类型树信息
            $.ajax({ //查询按钮权限
                url: "/buss/task/status?id="+latask.id,
                method: 'POST',
                async: false
            }).success(function (response) {
                if (response.success) {
                    $scope.statustreeInfos = response.data;
                    window.location.href = "#/app/buss/latask/change";
                }else{
                    rzhdialog(ngDialog,response.info,"error");
                }
            });
        });


        //生成报表
        $("#toreport").click(function(){
            window.location.href = "#/app/report/la"+"/app-buss-latask";
            return;
        });
    }

}]);




//类型树信息处理
App.controller('lataskhouseTypeController', ['$scope', "$http", function ($scope, $http) {
    $scope.show_all_info = true;
    $scope.all_info = "所有仓房";
    $scope.showAllInfo = function(){
        global_type_housecode=null;
        $scope.toRemove();
        $("#lataskhouseTypePanel").find("li").removeClass("active"); //清除已选中
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
        global_type_housecode = $scope.output;
        var table = $('#'+$scope.gridtableid).DataTable();
        table.draw();
        ckClickTr($scope.gridtableid); //单击行，选中复选框

    };
}]);

//类型树信息处理
App.controller('lataskTypeController', ['$scope', "$http", function ($scope, $http) {
    $scope.show_all_info = true;
    $scope.all_info = "全部类型";
    $scope.showAllInfo = function(){
        global_type_code=null;
        $scope.toRemove();
        $("#lataskTypePanel").find("li").removeClass("active"); //清除已选中
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
App.controller('lataskGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData),"typecode":global_type_code,"housecode":global_type_housecode}, //以json格式传递
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
        ajaxSource: "/buss/task/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {mDataProp: "typecode", sTitle: "类型",
                render: function (data, type, full, meta) {
                    angular.forEach($scope.treeInfos, function (data1, index, array) {
                        if(data==data1.code){
                            data=data1.label;
                        }
                    });
                    return data;
                }
            },
            {mDataProp: "housename", sTitle: "仓房"},
            {mDataProp: "name", sTitle: "名称"},
            {mDataProp: "source", sTitle: "来源"},
            {mDataProp: "curstep", sTitle: "状态"},
            //{
            //    mDataProp: "crtime",
            //    sTitle: "创建日期",
            //    render: function (data, type, full, meta) {
            //        return data == null ? '' : formatDate(data);
            //    }
            //},
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
        window.location.href = "#/app/buss/latask/view/"+data.id;
    });
}]);
// 查看详情
App.controller("viewlataskController", function ($scope, $stateParams,$http, ngDialog) {


    $http({
            url: GserverURL+ '/buss/task/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.latask = response.data;
            angular.forEach($scope.treeInfos, function (data, index, array) {
                if($scope.latask.typecode==data.code){
                    $scope.typecodeName=data.label;
                }
            });
            $scope.latask.crtime=formatDate( $scope.latask.crtime);
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
    //取消操作
    $scope.toRemove = function () {
        window.location.href = "#/app/buss/latask";
    }
});

//添加信息
App.controller("addlataskController", function ($scope, $http, ngDialog) {
    $scope.latask = null;
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            //增加分类属性
            $scope.latask.typecode=global_type_code;
            $scope.latask.housecode=global_type_housecode;
            var pData = {
                paras: JSON.stringify($scope.latask)
            };
           $http({
                url: GserverURL+'/buss/task/add',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.latask = null;
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
App.controller("updatelataskController", function ($scope, $http, ngDialog) {

    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            var pData = {
                paras: JSON.stringify($scope.latask)
            };
           $http({
                url: GserverURL+'/buss/task/update',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.latask=null;
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
App.controller("changelataskController", function ($scope, $http,$filter, ngDialog) {
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            //封装来源名称
            angular.forEach($scope.statustreeInfos, function (data, index, array) {
                if($scope.latask.curstepcode==data.code){
                    $scope.latask.curstep=data.label;
                }
            });
            var pData = {
                paras: JSON.stringify($scope.latask)
            };
           $http({
                url: GserverURL+'/buss/task/change',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.latask=null;
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
