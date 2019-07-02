/*
 * Copyright (c) 2016. .保留所有权利.
 *                       
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
var global_type_housecode = null;
App.controller('samplingController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {
    global_type_housecode = null;
    $scope.gridtableid="samplingTableGrids";
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
        window.location.href = "#/app/buss/sampling";
    }
    //绑定topbar操作
    function topbar_bind_operate(ngDialog){
        //获得table
        var table=$('#'+$scope.gridtableid).DataTable();

        //添加扦样
        $("#toadd").click(function () {
            if(global_type_housecode==null){
                rzhdialog(ngDialog,"请先选择一条仓房！","error");
                return;
            }
            //获取类型树信息
            $.ajax({ //查询按钮权限
                url: "/buss/qainspection/treelist?curstepcode=0&housecode="+global_type_housecode,
                method: 'POST',
                async: false
            }).success(function (response) {
                if (response.success) {
                    $scope.qainspectionInfos = response.data;
                }
            });
            window.location.href = "#/app/buss/sampling/add";
        });
        
        //修改扦样
        $("#toupdate").click(function () {
            var sampling=getTableData(table);
            if(sampling==null){
                rzhdialog(ngDialog,"请先选择一条扦样！","error");
                return;
            }
            $scope.sampling=sampling;
            $scope.sampling.qytime=formatDate($scope.sampling.qytime);
            window.location.href = "#/app/buss/sampling/update";

        });

        //样品管理
        $("#torec").click(function () {
            var sampling=getTableData(table);
            if(sampling==null){
                rzhdialog(ngDialog,"请先选择一条扦样！","error");
                return ;
            }
            $scope.sampling = sampling;
            window.location.href = "#/app/buss/samplingrec/"+sampling.no+"/"+sampling.name;
        });

        // TODO IT
        $("#toreport").click(function(){
            rzhdialog(ngDialog,"恭喜您单据已生成！","success");
            return;
        });
    }

}]);
//类型树信息处理
App.controller('samplinghouseTypeController', ['$scope', "$http", function ($scope, $http) {
    $scope.show_all_info = true;
    $scope.all_info = "所有仓房";
    $scope.showAllInfo = function(){
        global_type_housecode=null;
        $scope.toRemove();
        $("#samplinghouseTypePanel").find("li").removeClass("active"); //清除已选中
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


//列表信息处理
App.controller('samplingGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData),"housecode":global_type_housecode}, //以json格式传递
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
        serverSide: true,                    //指定从likun服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(1).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "/buss/sampling/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {mDataProp: "bussinessno", sTitle: "单号"},
            {mDataProp: "housename", sTitle: "仓房"},
            {mDataProp: "name", sTitle: "扦样名称"},
            {mDataProp: "qyoperator", sTitle: "扦样员"},
            {mDataProp: "qytime", sTitle: "检测时间",
                render: function (data, type, full, meta) {
                    return data == null ? '' : formatDate(data);
                }},
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
        window.location.href = "#/app/buss/sampling/view/"+data.id;
    });
}]);
// 查看详情
App.controller("viewsamplingController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/buss/sampling/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.sampling = response.data;
            angular.forEach($scope.treeInfos, function (data, index, array) {
                if($scope.sampling.typecode==data.code){
                    $scope.typecodeName=data.label;
                }
            });
            $scope.sampling.qytime=formatDate($scope.sampling.qytime);
            $("#erweima").qrcode({
                render : "canvas",    //设置渲染方式，有table和canvas，使用canvas方式渲染性能相对来说比较好
                text :  $scope.sampling.bussinessno,    //扫描二维码后显示的内容,可以直接填一个网址，扫描二维码后自动跳向该链接
                width : "150",               //二维码的宽度
                height : "150",              //二维码的高度
                background : "#ffffff",       //二维码的后景色
                foreground : "#000000"       //二维码的前景色
            });

            $("#tiaoxingma").empty().barcode(
                $scope.sampling.bussinessno,
                "code128",
                {
                    barWidth:2,
                    barHeight:50,
                    showHRI:false
                }
            );


        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })
});

//添加信息
App.controller("addsamplingController", function ($scope,$filter, $http, ngDialog) {
    $scope.samplingRec = null;
    $('#qytime').datetimepicker({ //加载日期插件
        todayBtn:  1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        todayHighlight: 1 //今天日期高亮
    });
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            angular.forEach( $scope.housetreeInfos, function (data, index, array) {
                if(global_type_housecode==data.code){
                    $scope.sampling.housecode=data.code;
                    $scope.sampling.housename= data.label;
                }
            });
            angular.forEach( $scope.qainspectionInfos, function (data, index, array) {
                if($scope.sampling.precode==data.code){
                    $scope.qainspectionid=data.remark;
                }
            });
            $scope.sampling.qytime = formatDateNum14($scope.sampling.qytime); //格式化日期
            var pData = {
                paras: JSON.stringify($scope.sampling),
                qainspectionid:$scope.qainspectionid
            };
           $http({
                url: GserverURL+'/buss/sampling/add',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.samplingRec = null;
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
App.controller("updatesamplingController", function ($scope,$filter, $http, ngDialog) {
    $('#qytime').datetimepicker({ //加载日期插件
        todayBtn:  1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        todayHighlight: 1 //今天日期高亮
    });
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            $scope.sampling.qytime = formatDateNum14($scope.sampling.qytime); //格式化日期
            var pData = {
                paras: JSON.stringify($scope.sampling)
            };
           $http({
                url: GserverURL+'/buss/sampling/update',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.sampling = null;
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



