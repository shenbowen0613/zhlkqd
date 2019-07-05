/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */


var global_type_code = null;
var global_res_name = null;//药剂物品名称
App.controller('resController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {
    global_type_code = null;
    $scope.gridtableid="resTableGrids";
    $scope.global_type=1;//默认为药剂
    $scope.global_treetype="restype"+$scope.global_type;

    $.ajax({ //查询按钮权限
        url: "/la/house/treethree",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.housetreeInfos = response.data;
        }
    });

    //获取存在状态列表
    $http({
            url: GserverURL+"/sys/dict/list?typecode=resownstatus",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.resownstatustreeInfos = response.data;
        }
    });


    $.ajax({ //药剂参数列表
        url: GserverURL+"/sys/dict/list?typecode=medrsparas",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.medrsparasTree = response.data;
            $scope.parasTree=$scope.medrsparasTree;
        }
    });

    $.ajax({ //包装物参数列表
        url: GserverURL+"/sys/dict/list?typecode=packrsparas",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.packrsparasTree = response.data;
        }
    });

    //获取包装方式列表
    $http({
            url: GserverURL+"/sys/dict/list?typecode=respacktype",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.respacktypetreeInfos = response.data;
        }
    });


    //获取保存方式列表
    $http({
            url: GserverURL+"/sys/dict/list?typecode=ressavemode",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.ressavemodetreeInfos = response.data;
        }
    });

    //获取厂商类型树信息
    $.ajax({
        url: GserverURL+ "/buss/cust/treelist?type=1",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.custtreeInfos = response.data;
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
        if(val==1){
            $scope.parasTree=$scope.medrsparasTree;
        }else{
            $scope.parasTree=$scope.packrsparasTree;
        }
        $scope.global_treetype="restype"+$scope.global_type;
        //切换清除
        global_type_code=null;
        //刷新页面树
        load_tree_list();
        //获得table
        var table=$('#'+$scope.gridtableid).DataTable();
        table.draw();
        ckClickTr($scope.gridtableid); //单击行，选中复选框
        $scope.toRemove();
    }
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
                $scope.treeInfos = response.data;
            }
        });
    }

    //绑定topbar操作
    function topbar_bind_operate(ngDialog){


        //添加
        $("#toadd").click(function () {
          if(global_type_code==null){
                rzhdialog(ngDialog,"您还没有选择一个分类！","error");
                return;
            }
            window.location.href = "#/app/buss/res/add";
        });

        //修改
        $("#toupdate").click(function () {
            //获得table
            var table=$('#'+$scope.gridtableid).DataTable();
            var res=getTableData(table);
            if(res==null){
                rzhdialog(ngDialog,"请先选择一条要修改的数据！","error");
                return;
            }
            $scope.res=res;
            $scope.res.paras=eval($scope.res.paras);
            window.location.href = "#/app/buss/res/update";
        });

        //删除
        $("#todelete").click(function () {
            //获得table
            var table=$('#'+$scope.gridtableid).DataTable();
            var res=getTableData(table);
            if(res==null){
                rzhdialog(ngDialog,"请先选择一条要删除的数据！","error");
                return;
            }
            ngDialog.openConfirm({
                template: 'delresDialogId',
                className: 'ngdialog-theme-default'
            }).then(function (value) { //用户点击确认
                $http({
                    url: '/buss/res/delete',
                    method: 'POST',
                    data: {id: res.id}
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

        //记录
        $("#torec").click(function () {
            //获得table
            var table=$('#'+$scope.gridtableid).DataTable();
            var res=getTableData(table);
            if(res==null){
                rzhdialog(ngDialog,"请先选择一条要查看记录的数据！","error");
                return;
            }
            $scope.medcode=res.code;
            $scope.medname=res.name;
            window.location.href = "#/app/buss/res_rec/"+$scope.medcode+"/"+$scope.medname;
        });

        //管理
        $("#toaddrec").click(function () {
            //获得table
            var table=$('#'+$scope.gridtableid).DataTable();
            var res=getTableData(table);
            if(res==null){
                rzhdialog(ngDialog,"请先选择一条数据！","error");
                return;
            }
            $scope.medcode=res.code;
            $scope.medname=res.name;
            window.location.href = "#/app/buss/res/addrec";
        });

        //生成报表
        $("#toreport").click(function(){
            window.location.href = "#/app/report/la"+"/app-buss-res";
            return;
        });
    }
    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/app/buss/res";
    }

}]);



//类型树信息处理
App.controller('resTypeController', ['$scope', "$http", function ($scope, $http) {
    $scope.show_all_info = true;
    $scope.all_info = "全部类型";
    $scope.showAllInfo = function(){
        global_type_code=null;
        $scope.toRemove();
        $("#resTypePanel").find("li").removeClass("active"); //清除已选中
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
App.controller('resGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {
                "aoData": JSON.stringify(aoData),
                "typecode":global_type_code,
                "type":$scope.global_type
            }, //以json格式传递
            async: false,
            "success": function (resp) {
                fnCallback(resp.data); //服务器端返回的对象的returnObject部分是要求的格式
            }
        });
    }

    var operatehtml=getHtmlInfos("app/views/base/grid_details.html","查看","toview");
    //数据列表信息
    var table = $('#'+$scope.gridtableid).DataTable({
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(1).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "/buss/res/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            //{mDataProp: "id", sTitle: "id"},
            {sTitle: "序号", width: "8%"},
            {mDataProp: "name", sTitle: "中文名称"},
            {mDataProp: "enname", sTitle: "英文名称"},
            {mDataProp: "unit", sTitle: "单位"},
            {mDataProp: "manufacturer", sTitle: "供应厂商"},
            {mDataProp: "price", sTitle: "当前价格"},
            {mDataProp: "num",sTitle: "库存数量"},
            {mDataProp: "keeper", sTitle: "保管员"},
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
        window.location.href = "#/app/buss/res/view/"+data.id;
    });
}]);
// 查看详情
App.controller("viewResController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/buss/res/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.res = response.data;
            $scope.res.paras=eval($scope.res.paras);
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
    //取消操作
    $scope.toRemove = function () {
        window.location.href = "#/app/buss/res";
    }
});

//添加信息
App.controller("addResController", function ($scope, $http, ngDialog,$filter) {
    $scope.res = null;//初始化数据
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            var paraarrList=new Array();
            angular.forEach($scope.parasTree, function (data, index, array) {
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
            $scope.res.paras=JSON.stringify(paraarrList);

            //增加分类属性
            $scope.res.typecode=global_type_code;
            $scope.res.type=$scope.global_type;
            //供应厂商
            angular.forEach($scope.custtreeInfos, function (data, index, array) {
                if($scope.res.manufacturercode==data.code){
                    $scope.res.manufacturer=data.label;
                }
            });

            var pData = {
                paras: JSON.stringify($scope.res)
            };
           $http({
                url: GserverURL+'/buss/res/add',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.res = null;
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
App.controller("updateResController", function ($scope, $http, $filter, ngDialog) {
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            var paraarrList=new Array();
            angular.forEach($scope.parasTree, function (data, index, array) {
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
            $scope.res.paras=JSON.stringify(paraarrList);
            //供应厂商
            angular.forEach($scope.custtreeInfos, function (data, index, array) {
                if($scope.res.manufacturercode==data.code){
                    $scope.res.manufacturer=data.label;
                }
            });

            var pData = {
                paras: JSON.stringify($scope.res)
            };
           $http({
                url: GserverURL+'/buss/res/update',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.res=null;
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


//添加信息
App.controller("addresRecController", function ($scope,$filter, $http, ngDialog) {
    $scope.resRec = null;

    $('#reportdate').datetimepicker({ //加载日期插件
        todayBtn:  1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        minView: 2, //最小显示单位  2 代表到天
        todayHighlight: 1 //今天日期高亮
    });

    //添加数据
    $scope.save = function () {
        //$scope.resRec.reportdate = formatDayNum8($scope.resRec.reportdate); //格式化开始日期
        $scope.resRec.medcode= $scope.medcode;
        //供应厂商
        angular.forEach($scope.custtreeInfos, function (data, index, array) {
            if($scope.resRec.manufacturercode==data.code){
                $scope.resRec.manufacturer=data.label;
            }
        });
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            var pData = {
                paras: JSON.stringify($scope.resRec),
                type:$scope.type,
                num:$scope.num
            };
           $http({
                url: GserverURL+'/buss/res/recAdd',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.resRec = null;
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
