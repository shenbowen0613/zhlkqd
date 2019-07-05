/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

var global_type_code = null;
App.controller('deviceController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {
    global_type_code = null;
    $scope.gridtableid="deviceTableGrids";
    $scope.global_type=0;//默认为仓储
    $scope.housename_show=false;
    $scope.global_treetype="devicetype"+$scope.global_type;
    //获取仓房列表
    $.ajax({ //查询按钮权限
        url: GserverURL+"/la/house/tree",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.treeInfos = response.data;
            $scope.housetreeInfos = response.data;
        }
    });
    //获取设备厂商类型树信息
    $.ajax({
        url: GserverURL+ "/buss/cust/treelist?type=0",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.custtreeInfos = response.data;
        }
    });

    $.ajax({ //设备作业参数列表
        url: GserverURL+"/sys/dict/list?typecode=deviceparas",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.deviceparasTree = response.data;
        }
    });

    //获取类型树信息
    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=devicestatus",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.devicestatusInfos = response.data;
        }
    });
    //刷新页面树
    load_tree_list();
    function  load_tree_list(){
        //获取类型树信息
        $.ajax({ //查询按钮权限
            url: GserverURL+"/sys/dict/list?typecode="+$scope.global_treetype,
            method: 'POST',
            async: false
        }).success(function (response) {
            if (response.success) {
                $scope.devicetreeInfos = response.data;
                if($scope.global_type==1){
                    $scope.treeInfos= $scope.housetreeInfos;
                }else{
                    $scope.treeInfos = $scope.devicetreeInfos;
                }
            }
        });
    }

    //control the btn show or hide
    $scope.cfgbtn_control=function(){
        if($scope.global_type==1){
            $("#tograin").show();
        }else{
            $("#tograin").hide();
        }
    }

    //增加事件
    $scope.tolistByType = function(val){
        $scope.global_type=val;
        if(val==1){
            $scope.housename_show=true;
        }else{
            $scope.housename_show=false;
        }
        $scope.global_treetype="devicetype"+$scope.global_type;
        //切换清除
        global_type_code=null;
        //刷新页面树
        load_tree_list();
        //获得table
        var table=$('#'+$scope.gridtableid).DataTable();
        table.draw();

        //2 为 housename 的索引
        table.column(2).visible($scope.housename_show);

        $("#deviceTypePanel").find("li").removeClass("active"); //清除已选中
        ckClickTr($scope.gridtableid); //单击行，选中复选框
        $scope.toRemove();
        //control the btn show or hide
        $scope.cfgbtn_control();
    }
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
        window.location.href = "#/app/la/device";
    }
    //绑定topbar操作
    function topbar_bind_operate(ngDialog){
        //control the btn show or hide
        $scope.cfgbtn_control();
        //获得table

        //使用记录
        $("#touse").click(function () {
            var table=$('#'+$scope.gridtableid).DataTable();
            var device=getTableData(table);
            if(device==null){
                rzhdialog(ngDialog,"请先选择一条要查看的数据！","error");
                return;
            }
            $scope.no=device.no;
            $scope.devicename=device.name;
            window.location.href = "#/app/la/device_use/"+$scope.no+"/"+$scope.devicename;
        });

        //维修记录
        $("#tomaintain").click(function () {
            var table=$('#'+$scope.gridtableid).DataTable();
            var device=getTableData(table);
            if(device==null){
                rzhdialog(ngDialog,"请先选择一条要查看的数据！","error");
                return;
            }
            $scope.no=device.no;
            $scope.devicename=device.name;
            window.location.href = "#/app/la/device_maintain/"+$scope.no+"/"+$scope.devicename;
        });

        //设备配置
        $("#tograin").click(function () {
            var table=$('#'+$scope.gridtableid).DataTable();
            var device=getTableData(table);
            if(device==null){
                rzhdialog(ngDialog,"请先选择一条要配置的数据！","error");
                return;
            }
            $scope.no=device.no;
            $scope.devicename=device.name;
            $scope.typecode=device.typecode;
            window.location.href = "#/app/la/device_grain/"+$scope.no+"/"+$scope.devicename+"/"+$scope.typecode;
        });

        //添加
        $("#toadd").click(function () {
            if(global_type_code==null){
                if($scope.global_type==1){
                    rzhdialog(ngDialog,"您还没有选择一个仓房！","error");
                    return;
                }else{
                    rzhdialog(ngDialog,"您还没有选择一个类型！","error");
                    return;
                }
            }
            window.location.href = "#/app/la/device/add";
        });

        //修改
        $("#toupdate").click(function () {
            var table=$('#'+$scope.gridtableid).DataTable();
            var device=getTableData(table);
            if(device==null){
                rzhdialog(ngDialog,"请先选择一条要修改的数据！","error");
                return;
            }
            $scope.device=device;
            $scope.device.paras=eval($scope.device.paras);
            window.location.href = "#/app/la/device/update";
            $("#configtype").val(device.configtype); //
        });

        //删除
        $("#todelete").click(function () {
            var table=$('#'+$scope.gridtableid).DataTable();
            var device=getTableData(table);
            if(device==null){
                rzhdialog(ngDialog,"请先选择一条要删除的数据！","error");
                return;
            }
            ngDialog.openConfirm({
                template: 'deldeviceDialogId',
                className: 'ngdialog-theme-default'
            }).then(function (value) { //用户点击确认
                $.ajax({
                    url: '/la/device/delete',
                    method: 'POST',
                    data: {id: device.id}
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


        //生成报表
        $("#toreport").click(function(){
            window.location.href = "#/app/report/la"+"/app-la-device";
            return;
        });
    }

}]);



//类型树信息处理
App.controller('deviceTypeController', ['$scope', "$http", function ($scope, $http) {
    $scope.show_all_info = false;
    $scope.all_info = "全部类型";
    $scope.showAllInfo = function(){
        global_type_code=null;
        $scope.toRemove();
        $("#deviceTypePanel").find("li").removeClass("active"); //清除已选中
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
App.controller('deviceGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        var type=$scope.global_type;
        var housecode=null;
        var typecode=null;
        if($scope.global_type==0){
            typecode=global_type_code;
        }else{
            housecode=global_type_code;
        }
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData),"housecode":housecode,"typecode":typecode,"type":type}, //以json格式传递
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
        ajaxSource: "la/device/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {mDataProp: "housename", sTitle: "仓房",bVisible:$scope.housename_show},
            {mDataProp: "name", sTitle: "设备"},
            {mDataProp: "typename", sTitle: "设备类型"},
            //{mDataProp: "code", sTitle: "出厂编码"},
            {mDataProp: "manufacturer", sTitle: "设备厂商"},
            {mDataProp: "statusname", sTitle: "状态"},
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
        window.location.href = "#/app/la/device/view/"+data.id;
    });
}]);
// 查看详情
App.controller("viewdeviceController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/la/device/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.device = response.data;
            $scope.device.paras=eval($scope.device.paras);
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
    //取消操作
    $scope.toRemove = function () {
        window.location.href = "#/app/la/device";
    }
});

//添加信息
App.controller("adddeviceController", function ($scope, $http, ngDialog) {
    $scope.device = null;
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        // if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{

            var paraarrList=new Array();
            angular.forEach($scope.deviceparasTree, function (data, index, array) {
                $("[name='detailKey']").each(function(){
                    if ($(this).val() == data.code) {
                        var paraarr={
                            key:data.code,
                            name:data.label,
                            value: $('#detail-' + $(this).val()).val(),
                            unit:data.remark
                        };
                        paraarrList.push(paraarr);
                    }
                })
            });
            $scope.device.paras=JSON.stringify(paraarrList);

            //增加仓房属性
            if($scope.global_type==1){
                $scope.device.housecode=global_type_code;
                angular.forEach($scope.treeInfos, function (data, index, array) {
                    if($scope.device.housecode==data.code){
                        $scope.device.housename=data.label;
                    }
                });
            }
            //增加分类属性
            angular.forEach($scope.devicetreeInfos, function (data, index, array) {
                if($scope.device.typecode==data.code){
                    $scope.device.typename=data.label;
                }
            });

            //cust list
            angular.forEach($scope.custtreeInfos, function (data, index, array) {
                if($scope.device.manufacturercode==data.code){
                    $scope.device.manufacturer=data.label;
                }
            });
            //设备状态
            angular.forEach($scope.devicestatusInfos, function (data, index, array) {
                if($scope.device.statuscode==data.code){
                    $scope.device.statusname=data.label;
                }
            });
            $scope.device.type=$scope.global_type;
            var pData = {
                paras: JSON.stringify($scope.device)
            };
           $http({
                url: GserverURL+'/la/device/add',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.device = null;
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
        // }
    }
});

//修改信息
App.controller("updatedeviceController", function ($scope, $http, ngDialog) {
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        // if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            var paraarrList=new Array();
            angular.forEach($scope.deviceparasTree, function (data, index, array) {
                $("[name='detailKey']").each(function(){
                    if ($(this).val() == data.code) {
                        var paraarr={
                            key:data.code,
                            name:data.label,
                            value: $('#detail-' + $(this).val()).val(),
                            unit:data.remark
                        };
                        paraarrList.push(paraarr);
                    }
                })
            });
            $scope.device.paras=JSON.stringify(paraarrList);

            //增加分类属性
            angular.forEach($scope.devicetreeInfos, function (data, index, array) {
                if($scope.device.typecode==data.code){
                    $scope.device.typename=data.label;
                }
            });
            //cust list
            angular.forEach($scope.custtreeInfos, function (data, index, array) {
                if($scope.device.manufacturercode==data.code){
                    $scope.device.manufacturer=data.label;
                }
            });

            //设备状态
            angular.forEach($scope.devicestatusInfos, function (data, index, array) {
                if($scope.device.statuscode==data.code){
                    $scope.device.statusname=data.label;
                }
            });

            var pData = {
                paras: JSON.stringify($scope.device)
            };
            $.ajax({
                url: '/la/device/update',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.device=null;
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
        // }
    }
});
