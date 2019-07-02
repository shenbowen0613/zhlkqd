/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
var global_tasktype_code = "jianyan";
var global_type_housecode = null;
App.controller('qainspectionController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {
    global_type_housecode = null;
    $scope.gridtableid="qainspectionTableGrids";

    $.ajax({
        url: GserverURL+"/la/house/tree",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.housetreeInfos = response.data;
        }
    });

    $.ajax({
        url: GserverURL+"/sys/dict/list?typecode=qataskparas",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.qataskparasTree = response.data;
        }
    });


    var base_levels = "";
    var levels = null;
    var pData = { code: moduleId}; //设置模块id（用以查询模块对应的操作按钮）
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
    $http({
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
        window.location.href = "#/app/buss/qainspection";
    }
    //绑定topbar操作
    function topbar_bind_operate(ngDialog){
        //添加检验单
        $("#toadd").click(function () {
            if(global_type_housecode==null){
                rzhdialog(ngDialog,"请先选择一条仓房！","error");
                return;
            }
            //获取类型树信息
            $.ajax({
                url: "/buss/task/treelist?curstepcode=3&typecode="+global_tasktype_code+"&housecode="+global_type_housecode,
                method: 'POST',
                async: false
            }).success(function (response) {
                if (response.success) {
                    $scope.taskInfos = response.data;
                }
            });
            window.location.href = "#/app/buss/qainspection/add";
        });


        //修改检验单
        $("#toupdate").click(function () {
            //获得table
            var table=$('#'+$scope.gridtableid).DataTable();
            var qainspection=getTableData(table);
            if(qainspection==null){
                rzhdialog(ngDialog,"请先选择一条检验单！","error");
                return;
            }
            if(qainspection.curstepcode==2){
                rzhdialog(ngDialog,"该检验单质检已结束，无法修改！","error");
                return;
            }
            $scope.qainspection=qainspection;
            //循环显示参数
            var details= new Array();
            var index=0;
            angular.forEach($scope.qataskparasTree, function (data, index, array) {
                var ischecked=false;
                angular.forEach(eval(qainspection.details), function (detail, index, array) {
                    if(detail.key==data.code){
                        ischecked=true;
                    }
                });
                data.checked=ischecked;
                details[index]=data;
                index++;
            });
            $scope.qainspection.details=details;
            $scope.qainspection.inspectiontime=formatDate($scope.qainspection.inspectiontime);
            window.location.href = "#/app/buss/qainspection/update";

        });

        // TODO IT
        $("#toreport").click(function(){
            var table=$('#'+$scope.gridtableid).DataTable();
            var qainspection = getTableData(table);
            if (qainspection == null) {
                rzhdialog(ngDialog, "请先选择一条要生成单据的数据！", "error");
                return;
            }
            var paras={
                tplcode:"qa",
                precode:qainspection.no,
                name:qainspection.name
            };
            $http({
                url: '/buss/receipts/add',
                method: 'POST',
                data:{
                    paras:JSON.stringify(paras),
                    type:"pdf"//默认类型，支持pdf，xls，doc
                }
            }).success(function (response) {
                if (response.success) {
                    var dt = response.data;
                    rzhdialog(ngDialog,"恭喜您单据已生成！","success");
                    //打開文件
                    openfile(ngDialog,dt.fileurl);
                } else {
                    rzhdialog(ngDialog,response.info,"error");
                }
            }).error(function (response) { //提交失败
                    rzhdialog(ngDialog,"操作失败","error");
                }
            );
            return;
        });
    }

}]);
//类型树信息处理
App.controller('qainspectionhouseTypeController', ['$scope', "$http", function ($scope, $http) {
    $scope.show_all_info = true;
    $scope.all_info = "所有仓房";
    $scope.showAllInfo = function(){
        global_type_housecode=null;
        $scope.toRemove();
        $("#qainspectionhouseTypePanel").find("li").removeClass("active"); //清除已选中
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
App.controller('qainspectionGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
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

    var operatehtml = getHtmlInfos("app/views/base/grid_details.html","详情查看","toview")
        +"&nbsp;"
        + getHtmlInfos("app/views/base/grid_download.html","文件下载","todownload");
    //数据列表信息
    var table = $('#'+$scope.gridtableid).DataTable({
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(1).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "/buss/qainspection/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {mDataProp: "bussinessno", sTitle: "单号"},
            {mDataProp: "housename", sTitle: "仓房"},
            {mDataProp: "name", sTitle: "质检名称"},
            {mDataProp: "inspector", sTitle: "检测人"},
            {mDataProp: "curstep", sTitle: "状态"},
            {mDataProp: "inspectiontime", sTitle: "检测时间",
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
        window.location.href = "#/app/buss/qainspection/view/"+data.id;
    });
    //文件下载
    $("#"+$scope.gridtableid+" tbody").on('click', 'tr td button.todownload', function () {
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        $http({
            url: GserverURL+'/buss/receipts/preview',
            method: 'POST',
            data: {precode: data.no}
        }).success(function (response) { //提交成功
            if (response.success) { //信息处理成功
                openfile(ngDialog,response.data.fileurl);
            } else { //信息处理失败，提示错误信息
                rzhdialog(ngDialog,"单据文件不存在！","error");
            }
        }).error(function (response) { //提交失败
            rzhdialog(ngDialog,"操作失败","error");
        })
    });
}]);
// 查看详情
App.controller("viewqainspectionController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/buss/qainspection/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.qainspection = response.data;
            if($scope.qainspection.details==null||$scope.qainspection.details==""){
                $scope.qainspection.details=null;
            }else{
                $scope.qainspection.details = eval($scope.qainspection.details);
            }
            angular.forEach($scope.treeInfos, function (data, index, array) {
                if($scope.qainspection.typecode==data.code){
                    $scope.typecodeName=data.label;
                }
            });
            $scope.qainspection.inspectiontime=formatDate($scope.qainspection.inspectiontime);
            $("#erweima").qrcode({
                render : "canvas",    //设置渲染方式，有table和canvas，使用canvas方式渲染性能相对来说比较好
                text :  $scope.qainspection.bussinessno,    //扫描二维码后显示的内容,可以直接填一个网址，扫描二维码后自动跳向该链接
                width : "150",               //二维码的宽度
                height : "150",              //二维码的高度
                background : "#ffffff",       //二维码的后景色
                foreground : "#000000"       //二维码的前景色
            });

            $("#tiaoxingma").empty().barcode(
                $scope.qainspection.bussinessno,
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
App.controller("addqainspectionController", function ($scope,$filter, $http, ngDialog) {
    $scope.qainspection = null;
    $('#inspectiontime').datetimepicker({ //加载日期插件
        todayBtn:  1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        todayHighlight: 1 //今天日期高亮
    });
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        // if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
        {
            var paraarrList=new Array();
            angular.forEach($scope.qataskparasTree, function (data, index, array) {
                $("[name='details']").each(function(){
                    if($(this)[0].checked) {
                        if ($(this).val() == data.code) {
                            var paraarr={
                                key:data.code,
                                name:data.label,
                                unit:data.remark
                            };
                            paraarrList.push(paraarr);
                        }
                    }
                })
            });
            $scope.qainspection.details=JSON.stringify(paraarrList);
            angular.forEach( $scope.housetreeInfos, function (data, index, array) {
                if(global_type_housecode==data.code){
                    $scope.qainspection.housecode=data.code;
                    $scope.qainspection.housename= data.label;
                }
            });

            angular.forEach( $scope.taskInfos, function (data, index, array) {
                if($scope.qainspection.taskcode==data.code){
                    $scope.taskid=data.remark;
                }
            });

            $scope.qainspection.inspectiontime =formatDateNum14($scope.qainspection.inspectiontime); //格式化日期
            var pData = {
                paras: JSON.stringify($scope.qainspection),
                taskid:$scope.taskid
            };
           $http({
                url: GserverURL+'/buss/qainspection/add',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.qainspection = null;
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
App.controller("updateqainspectionController", function ($scope,$filter, $http, ngDialog) {
    $('#inspectiontime').datetimepicker({ //加载日期插件
        todayBtn:  1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        minView: 0, //最小显示单位  2 代表到天
        todayHighlight: 1 //今天日期高亮
    });
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            var paraarrList=new Array();
            angular.forEach($scope.qataskparasTree, function (data, index, array) {
                $("[name='details']").each(function(){
                    if($(this)[0].checked) {
                        if ($(this).val() == data.code) {
                            var paraarr={
                                key:data.code,
                                name:data.label,
                                unit:data.remark
                            };
                            paraarrList.push(paraarr);
                        }
                    }
                })
            });
            $scope.qainspection.details=JSON.stringify(paraarrList);
            $scope.qainspection.inspectiontime =formatDateNum14($scope.qainspection.inspectiontime); //格式化日期
            var pData = {
                paras: JSON.stringify($scope.qainspection)
            };
           $http({
                url: GserverURL+'/buss/qainspection/update',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.qainspection = null;
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