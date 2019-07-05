/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

var global_type_code = null;
var selHouseCode;
var selHouseName;
App.controller('weightController', ['$scope', '$http',"$stateParams", "ngDialog", function ($scope, $http,$stateParams, ngDialog) {
    global_type_code = null;
    $scope.gridtableid="weightTableGrids";
    angularParamString($http); //解决post提交接收问题，json方式改为string方式


    var base_levels = "";
    var levels = null;
    var pData = { code: moduleId}; //设置模块id（用以查询模块对应的操作按钮）
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
    $http({ //查询按钮权限
        url: GserverURL+'/sys/user/queryOperate',
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
            console.log(base_levels);
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

    //绑定topbar操作
    function topbar_bind_operate(ngDialog){
        //导出
        $("#toreport").click(function(){

        });
    }
}]);

//列表信息处理
App.controller('weightGridController', ['$scope', "$http", "ngDialog", function ($scope,$stateParams, $http, ngDialog) {

    $('#starttime').datetimepicker({ //加载日期插件
        todayBtn:  1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        minView: 2, //最小显示单位  2 代表到天
        todayHighlight: 1 //今天日期高亮
    });
    $('#endtime').datetimepicker({ //加载日期插件
        todayBtn:  1, // '今天'按钮显示
        autoclose: 1, //选择完成自动关闭
        minView: 2, //最小显示单位  2 代表到天
        todayHighlight: 1 //今天日期高亮
    });


    $.ajax({ //获取仓房信息
        url: GserverURL + "/la/house/houseList",
        method: 'POST',
        async: false
    }).success(function (response) {
        if (response.success) {
            $scope.houseItems = response.data;
            if ($scope.houseItems.length > 0) {
                selHouseCode = $scope.houseItems[0].code; //设置当前仓房编码
                selHouseName = $scope.houseItems[0].label;
                $("#houseName").html("- " + selHouseName); //设置选中的当前仓房名
            }
        }

    });

    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: GserverURL+sSource,
            dataType: 'json',
            data: {
                "aoData": JSON.stringify(aoData),
                no: $scope.no,
                iotypename: $scope.iotypename,
                housecode: $scope.housecode,
                starttime: $scope.starttime,
                endtime: $scope.endtime,
            },
            async: false,
            "success": function (resp) {
                fnCallback(resp.data); //服务器端返回的对象的returnObject部分是要求的格式
            }
        });
    }

    $scope.toSearch = function () {
        table.ajax.reload();
    };


    var operatehtml=getHtmlInfos("app/views/base/grid_details.html","详情查看","toview");

    //数据列表信息
    var table = $('#'+$scope.gridtableid).DataTable({
        bFilter: false,    //去掉搜索框方法三：这种方法可以
        bLengthChange: false,   //去掉每页显示多少条数据方法
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(0).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "outin/weight/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            //{sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号", width: "8%"},
            {
                sTitle: "类型",
                mDataProp: "iotypename"
            },
            {
                sTitle: "仓房",
                mDataProp: "housename"
            },
            {
                sTitle: "车牌号码",
                mDataProp: "vehicleno"
            },
            {
                sTitle: "承运人",
                mDataProp: "carrier"
            },
            {
                mDataProp: "entrytime",
                sTitle: "入库时间",
                render: function (data) {
                    return data == null ? '' : formatDate(data);
                }

            },
            {
                mDataProp: "grosstime",
                sTitle: "毛重检斤时间",
                render: function (data) {
                    return data == null ? '' : formatDate(data);
                }

            },
            {
                mDataProp: "taretime",
                sTitle: "回皮检斤时间",
                render: function (data) {
                    return data == null ? '' : formatDate(data);
                }

            },
            {mDataProp: "grossweight", sTitle: "毛重（千克）"},
            {mDataProp: "tareweight", sTitle: "皮重（千克）"},
            // {mDataProp: "cutweight", sTitle: "现场扣量"},
            {mDataProp: "netweight", sTitle: "净重（千克）"}
            ,
            {sTitle: "操作"}
        ],
        aoColumnDefs: [//设置列的属性
            //{
            //    bSortable: false,
            //    targets: 0,
            //    defaultContent: getHtmlInfos("app/views/base/check.html")
            //},
            {
                bSortable: false,
                data: null,
                targets: 0
            }
            ,
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
        window.location.href = "#/outin/weightDetail/" + data.busno;
    });
}]);
// 查看详情
App.controller("viewweightController", function ($scope, $stateParams,$http, ngDialog) {

    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/outin/weight";
    }

    $http({
        url: GserverURL + '/outin/detailedAll',
        method: 'POST',
        data: {busno: $stateParams.busno}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.outinEnty = response.data;
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog,response.info,"error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog,"操作失败","error");
    })

});

