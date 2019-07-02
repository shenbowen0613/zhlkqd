/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

var global_tasktype_code = "jianyan";
var global_type_housecode=null;
App.controller('qaresultController', ['$scope', '$http', "ngDialog", function ($scope, $http, ngDialog) {
    global_type_housecode = null;
    $scope.gridtableid="qaresultTableGrids";
    $.ajax({ //查询按钮权限
        url:GserverURL+"/la/house/tree",
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
        window.location.href = "#/app/buss/qaresult";
    }
    //绑定topbar操作
    function topbar_bind_operate(ngDialog){
        //获得table

        //添加
        $("#toadd").click(function () {
           if(global_type_housecode==null){
                rzhdialog(ngDialog,"您还没有选择一个仓库！","error");
                return;
            }
            $.ajax({ //查询按钮权限
                url: "/buss/qainspection/treelist?curstepcode=1&housecode="+global_type_housecode,
                method: 'POST',
                async: false
            }).success(function (response) {
                if (response.success) {
                    $scope.inspectreeInfos = response.data;
                }
            });
            window.location.href = "#/app/buss/qaresult/add";
        });

        //修改
        $("#toupdate").click(function () {
            var table=$('#'+$scope.gridtableid).DataTable();
            var qaresult = getTableData(table);
            if (qaresult == null) {
                rzhdialog(ngDialog, "请先选择一条要修改的数据！", "error");
                return;
            }

            $scope.qaresult = qaresult;
            $scope.qaresult.details = eval($scope.qaresult.details);
            window.location.href = "#/app/buss/qaresult/update";
            $("#typecode").val(qaresult.typecode); //
        });

        //生成报表
        // TODO IT
        $("#toreport").click(function(){
            var table=$('#'+$scope.gridtableid).DataTable();
            var qaresult = getTableData(table);
            if (qaresult == null) {
                rzhdialog(ngDialog, "请先选择一条要生成单据的数据！", "error");
                return;
            }
            var paras={
                tplcode:"qaresult",
                precode:qaresult.no,
                name:qaresult.name
            };
            $http({ //查询按钮权限
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
App.controller('qaresulthouseTypeController', ['$scope', "$http", function ($scope, $http) {
    $scope.show_all_info = true;
    $scope.all_info = "所有仓房";
    $scope.showAllInfo = function(){
        global_type_housecode=null;
        $scope.toRemove();
        $("#qaresulthouseTypePanel").find("li").removeClass("active"); //清除已选中
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
App.controller('qaresultGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
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
        ajaxSource: "/buss/qainspectionresult/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {mDataProp: "bussinessno", sTitle: "单号"},
            {mDataProp: "housename", sTitle: "仓房"},
            {mDataProp: "name", sTitle: "名称"},
            {mDataProp: "curstep", sTitle: "状态"},
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
        window.location.href = "#/app/buss/qaresult/view/"+data.id;
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
App.controller("viewqaresultController", function ($scope, $stateParams,$http, ngDialog) {
    $http({
            url: GserverURL+ '/buss/qainspectionresult/view',
        method: 'POST',
        data: {id: $stateParams.id}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.qaresult = response.data;
            $scope.qaresult.details=eval($scope.qaresult.details);
            $("#erweima").qrcode({
                render : "canvas",    //设置渲染方式，有table和canvas，使用canvas方式渲染性能相对来说比较好
                text :  $scope.qaresult.bussinessno,    //扫描二维码后显示的内容,可以直接填一个网址，扫描二维码后自动跳向该链接
                width : "150",               //二维码的宽度
                height : "150",              //二维码的高度
                background : "#ffffff",       //二维码的后景色
                foreground : "#000000"       //二维码的前景色
            });

            $("#tiaoxingma").empty().barcode(
                $scope.qaresult.bussinessno,
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
    //取消操作
    $scope.toRemove = function () {
        window.location.href = "#/app/buss/qaresult";
    }
});

//添加信息
App.controller("addqaresultController", function ($scope, $http, ngDialog) {
    $scope.qaresult = null;
    var details="";
    $scope.selectQa=function(){
        var paraHtml = "";
        if($scope.qaId!=0) {
            $.ajax({ //查询按钮权限
                url: "/buss/qainspection/details?id=" + $scope.qaId,
                method: 'POST',
                async: false
            }).success(function (response) {
                if (response.success) {
                    details = response.data;
                }
            });
            var eachHtml='';
            angular.forEach(eval(details), function (detail, index, array) {
                var unitStr="";
                if (detail.unit!=null){
                    unitStr=detail.unit;
                }
                eachHtml='<div class="mb">'
                    +'<span class="col-lg-2 pl0 pr0">'+detail.name+'</span>'
                    +'<span class="col-lg-4 pl0 pr0">'
                    +'<input name="detailKey" type="hidden" value="'+detail.key+'"/>'
                    +'<input id="detail-'+detail.key+'" type="text" class="form-control" required />'
                    +'</span><span class="col-lg-2 pl0 pr0">'+unitStr+'</span>'
                    +'<div class="clear"></div></div>';
                paraHtml += eachHtml;
            });
        }
        $('#paras').html(paraHtml);
    };

    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            var paraarrList=new Array();
            angular.forEach(eval(details), function (data, index, array) {
                $("[name='detailKey']").each(function(){
                    if(data.key==$(this).val()) {
                        var paraarr = {
                            key: data.key,
                            value: $('#detail-' + $(this).val()).val(),
                            name: data.name,
                            unit: data.unit
                        };
                        paraarrList.push(paraarr);
                    }
                })
            });
            details=JSON.stringify(paraarrList);
            var pData = {
                qaId: $scope.qaId,
                details:details
            };
           $http({
                url: GserverURL+'/buss/qainspectionresult/add',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.qaId = null;
                    $scope.details = null;
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
App.controller("updateqaresultController", function ($scope, $http, ngDialog) {
    //添加数据
    $scope.save = function () {
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        var table = $('#'+$scope.gridtableid).DataTable();
        //验证通过
        if(false) {rzhdialog(ngDialog,"您输入的表单内容的不合法，请修改后提交","error");return;}else{
            var paraarrList=new Array();
            angular.forEach(eval($scope.qaresult.details), function (data, index, array) {
                $("[name='detailKey']").each(function(){
                    if(data.key==$(this).val()) {
                        var paraarr = {
                            key: data.key,
                            value: $('#detail-' + $(this).val()).val(),
                            name: data.name,
                            unit: data.unit
                        };
                        paraarrList.push(paraarr);
                    }
                })
            });
            $scope.qaresult.details=JSON.stringify(paraarrList);
            var pData = {
                paras: JSON.stringify($scope.qaresult)
            };
           $http({
                url: GserverURL+'/buss/qainspectionresult/update',
                method: 'POST',
                data: pData
            }).success(function (response) { //提交成功
                if (response.success) { //信息处理成功，进入用户中心页面
                    $scope.qaresult=null;
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