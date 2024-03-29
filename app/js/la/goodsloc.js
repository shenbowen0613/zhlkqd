/*
 * Copyright (c) 2016. .保留所有权利.
 *                       
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

var global_type_houcode = null;//仓房编码
var global_type_grancode=null;//廒间编码
App.controller('goodslocController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {
    global_type_houcode = null;
    global_type_grancode=null;
    $scope.gridtableid="goodslocTableGrids";
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url: GserverURL+"/la/house/treetwo",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.treeInfos = response.data;
        }
    });
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url: GserverURL+"/sys/dict/list?typecode=usestatus",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.usestatustreeInfos = response.data;
        }
    });
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url: GserverURL+"/sys/dict/list?typecode=storagetype",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.storagetypetreeInfos = response.data;
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
        window.location.href = "#/app/la/goodsloc";
    }
    //绑定topbar操作
    function topbar_bind_operate(ngDialog){
        //获得table
        var table=$('#'+$scope.gridtableid).DataTable();
        //添加
        $("#toadd").click(function () {
            if(global_type_houcode==null){
                rzhdialog(ngDialog,"您还没有选择一个仓房！","error");
                return;
            }
            if(global_type_grancode==null){
                rzhdialog(ngDialog,"您还没有选择一个廒间！","error");
                return;
            }

            window.location.href = "#/app/la/goodsloc/add";
        });

        //修改
        $("#toupdate").click(function () {
            var goodsloc=getTableData(table);
            if(goodsloc==null){
                rzhdialog(ngDialog,"请先选择一条要修改的数据！","error");
                return;
            }
            $scope.goodsloc=goodsloc;
            //if($scope.goodsloc.locationenabledate!=null&&$scope.goodsloc.locationenabledate!=''){
            //    $scope.goodsloc.locationenabledate = formatDay($scope.goodsloc.locationenabledate); //格式化开始日期
            //}
            window.location.href = "#/app/la/goodsloc/update";
            $("#granarystatus").val(goodsloc.granarystatus); //
            $("#granaryusestatus").val(goodsloc.granaryusestatus); //
        });

        //删除
        $("#todelete").click(function () {
            var goodsloc=getTableData(table);
            if(goodsloc==null){
                rzhdialog(ngDialog,"请先选择一条要删除的数据！","error");
                return;
            }
            ngDialog.openConfirm({
                template: 'delgoodslocDialogId',
                className: 'ngdialog-theme-default'
            }).then(function (value) { //用户点击确认
                $http({
                    url: GserverURL+'/la/goodsloc/delete',
                    method: 'POST',
                    data: {id: goodsloc.id}
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



//类型树信息处理
App.controller('goodslocTypeController', ['$scope', "$http", function ($scope, $http) {
    $scope.show_all_info = true;
    $scope.all_info = "所有仓房";
    $scope.showAllInfo = function(){
        global_type_houcode=null;
        global_type_grancode=null;
        $scope.toRemove();
        $("#goodslocTypePanel").find("li").removeClass("active"); //清除已选中
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
        //赋值
        var sout=$scope.output.split("@");
        if(sout.length==1){
            //获取仓房编码
            global_type_houcode =sout[0];
            global_type_grancode=null;
        }else if(sout.length==2){
            //获取仓房编码
            global_type_houcode = sout[0];;
            //获取廒间编码
            global_type_grancode =sout[1];
        }
        var table = $('#'+$scope.gridtableid).DataTable();
        table.draw();
        ckClickTr($scope.gridtableid); //单击行，选中复选框
    };
}]);




//列表信息处理
App.controller('goodslocGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData),"housecode":global_type_houcode,"granarycode":global_type_grancode}, //以json格式传递
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
        ajaxSource: "la/goodsloc/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {mDataProp: "locationname", sTitle: "货位名称"},
            {mDataProp: "locationcapacity", sTitle: "货位容量"},
            {mDataProp: "locationenabledate", sTitle: "启用日期"},
            {mDataProp: "storagetype", sTitle: "储粮方式",render:function(data, index, array){
                angular.forEach($scope.storagetypetreeInfos, function (dt, index, array) {
                    if(data==dt.code){
                        data=dt.label;
                    }
                });
                return data;
            }},
            {mDataProp: "locationstatus", sTitle: "货位状态",render:function(data, index, array){
                angular.forEach($scope.usestatustreeInfos, function (dt, index, array) {
                    if(data==dt.code){
                        data=dt.label;
                    }
                });
                return data;
            }},
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
        window.location.href = "#/app/la/goodsloc/view/"+data.id;
    });
}]);
// 查看详情
App.controller("viewgoodslocController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/la/goodsloc/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.goodsloc = response.data;
            //if($scope.goodsloc.locationenabledate!=null&&$scope.goodsloc.locationenabledate!=''){
            //    $scope.goodsloc.locationenabledate = formatDay($scope.goodsloc.locationenabledate); //格式化开始日期
            //}
            angular.forEach($scope.storagetypetreeInfos, function (data, index, array) {
                if($scope.goodsloc.storagetype==data.code){
                    $scope.goodsloc.storagetype=data.label;
                }
            });
            angular.forEach($scope.usestatustreeInfos, function (data, index, array) {
                if($scope.goodsloc.locationstatus==data.code){
                    $scope.goodsloc.locationstatus=data.label;
                }
            });
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
});

//添加信息
App.controller("addgoodslocController", function ($scope, $http,$filter,ngDialog) {
    $scope.goodsloc = null;
    $('#locationenabledate').datetimepicker({ //加载日期插件
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
            //格式化开始日期
            //$scope.goodsloc.locationenabledate = formatDayNum8($scope.goodsloc.locationenabledate);
            //增加仓房属性
            $scope.goodsloc.housecode=global_type_houcode;
            $scope.goodsloc.granarycode=global_type_grancode;
            var pData = {
                paras: JSON.stringify($scope.goodsloc)
            };
           $http({
                url: GserverURL+'/la/goodsloc/add',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.goodsloc = null;
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
App.controller("updategoodslocController", function ($scope, $http,$filter, ngDialog) {
    $('#locationenabledate').datetimepicker({ //加载日期插件
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
            //格式化开始日期
            //$scope.goodsloc.locationenabledate = formatDayNum8($scope.goodsloc.locationenabledate);
            var pData = {
                paras: JSON.stringify($scope.goodsloc)
            };
           $http({
                url: GserverURL+'/la/goodsloc/update',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.goodsloc=null;
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
