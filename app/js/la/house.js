/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

App.controller('houseController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {
    $scope.gridtableid="houseTableGrids";
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url: GserverURL+"/sys/dict/list?typecode=housetype",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.treeInfos = response.data;
        }
    });
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url: GserverURL+"/sys/dict/list?typecode=houserstype",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.isrstreeInfos = response.data;
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
        window.location.href = "#/app/la/house";
    }
    //绑定topbar操作
    function topbar_bind_operate(ngDialog){
        //获得table
        var table=$('#'+$scope.gridtableid).DataTable();

        //添加
        $("#toadd").click(function () {
            $http({ //查询按钮权限
                url:GserverURL+ '/la/house/last',
                method: 'POST',
                data: pData
            }).success(function (response) {
                if (response.success) {
                    if(response.data!=null){
                        $scope.house=response.data;
                        $scope.house.id=0;
                        $scope.house.houseno=$scope.house.houseno+1;
                        $scope.house.housename= $scope.house.houseno+"号仓";
                        $("#typecode").val($scope.house.typecode); //默认加载分类
                    }else{
                        $scope.house.houseno=1;
                        $scope.house.housename= $scope.house.houseno+"号仓";
                    }
                    window.location.href = "#/app/la/house/add";
                } else {
                    rzhdialog(ngDialog,response.info,"error");
                }
            }).error(function (response) { //提交失败
                    rzhdialog(ngDialog,"操作失败","error");
                }
            );
        });

        //修改
        $("#toupdate").click(function () {
            var house=getTableData(table);
            if(house==null){
                rzhdialog(ngDialog,"请先选择一条要修改的数据！","error");
                return;
            }
            $scope.house=house;
            window.location.href = "#/app/la/house/update";
            $("#typecode").val(house.typecode); //默认加载分类
            $("#isrs").val(house.isrs); //默认加载分类
        });

        //删除
        $("#todelete").click(function () {
            var house=getTableData(table);
            if(house==null){
                rzhdialog(ngDialog,"请先选择一条要删除的数据！","error");
                return;
            }
            ngDialog.openConfirm({
                template: 'delhouseDialogId',
                className: 'ngdialog-theme-default'
            }).then(function (value) { //用户点击确认
                $http({
                    url:GserverURL+ '/la/house/delete',
                    method: 'POST',
                    data: {id: house.id}
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
        //配置粮库
        $("#tostorage").click(function () {
            $.ajax({ //查询按钮权限
                url: GserverURL+"/la/storage/view?rand="+Math.random(),
                method: 'POST',
                async: false
            }).success(function (response) {
                if (response.success) {
                    $scope.storage = response.data;
                }
            });
            window.location.href = "#/app/la/house/storage";
            $("#orgtype").val($scope.storage.orgtype); //默认加载分类
        });
    }

}]);



//列表信息处理
App.controller('houseGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData)}, //以json格式传递
            async: false,
            "success": function (resp) {
                fnCallback(resp.data); //服务器端返回的对象的returnObject部分是要求的格式
            }
        });
    }

    var operatehtml=getHtmlInfos("app/views/base/grid_search.html","查看","toview");
    //数据列表信息
    var table = $('#'+$scope.gridtableid).DataTable({
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(1).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: GserverURL+"la/house/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {mDataProp: "houseno", sTitle: "仓房编号"},
            {mDataProp: "housename", sTitle: "仓房名称"},
            {mDataProp: "typename", sTitle: "仓房类型"},
            {mDataProp: "submitdate", sTitle: "交付日期"},
            {mDataProp: "ventilationtype", sTitle: "通风方式"},
            {mDataProp: "heatinsulationtype", sTitle: "隔热方式"},
            {mDataProp: "keeper", sTitle: "保管员"},
            {mDataProp: "keeperphone", sTitle: "联系电话"},
            {
                mDataProp: "isrs",
                sTitle: "储粮类型",
                render: function (data, type, full, meta) {
                    angular.forEach($scope.isrstreeInfos, function (dt, index, array) {
                        if(full.isrs==dt.code){
                            data='<font color="'+dt.remark+'">'+dt.label+'</font>';
                        }
                    });
                    return data ;
                }
            },
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
        window.location.href = "#/app/la/house/view/"+data.id;
    });
}]);
// 查看详情
App.controller("viewhouseController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/la/house/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.house = response.data;
            if($scope.house!=null){
                if($scope.house.isrs)$scope.house.isrs="储备粮";
                else $scope.house.isrs="托市粮";
            }
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
});

//添加信息
App.controller("addhouseController", function ($scope, $http, ngDialog) {
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        {
        //if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
                angular.forEach($scope.treeInfos, function (data, index, array) {
                if($scope.house.typecode==data.code){
                    $scope.house.typename=data.label;
                }
            });
            $scope.house.isrs=$scope.house.isrs*1;
            var pData = {
                paras: JSON.stringify($scope.house)
            };
           $http({
                url: GserverURL+'/la/house/add',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.house = null;
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
App.controller("updatehouseController", function ($scope, $http, ngDialog) {

    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        // if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
        {
            angular.forEach($scope.treeInfos, function (data, index, array) {
                if($scope.house.typecode==data.code){
                    $scope.house.typename=data.label;
                }
            });
            $scope.house.isrs=$scope.house.isrs*1;
            var pData = {
                paras: JSON.stringify($scope.house)
            };
           $http({
                url: GserverURL+'/la/house/update',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.house=null;
                    table.draw(); //重新加载数据
                    ckClickTr($scope.gridtableid); //单击行，选中复选框
                    rzhdialog(ngDialog,response.info,"success");
                    $scope.toRemove();
                } else { //信息处理失败，提示错误信息
                    rzhdialog(ngDialog,response.info,"error");
                }
                $scope.toRemove();
            }).error(function (response) { //提交失败
                rzhdialog(ngDialog,"操作失败","error");
            })
        }
    }
});

//修改粮库信息
App.controller("updatestorageController", function ($scope, $http, ngDialog) {
    //获取类型树信息
    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=storage",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.storagetreeInfos = response.data;
        }
    });

    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        //验证通过
        // if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
        {
            var pData = {
                paras: JSON.stringify($scope.storage)
            };
           $http({
                url: GserverURL+'/la/storage/update',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
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
