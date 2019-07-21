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
App.controller('inDetailedController', ['$scope', '$http', "$stateParams", "ngDialog", function ($scope, $http, $stateParams, ngDialog) {
    global_type_code = null;
    $scope.gridtableid = "inDetailedTableGrids";
    angularParamString($http); //解决post提交接收问题，json方式改为string方式
}]);

//列表信息处理$scope, $http, $filter, ngDialog
App.controller('inDetailedGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
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
            url: GserverURL + sSource,
            dataType: 'json',
            data: {
                "aoData": JSON.stringify(aoData),
                no: $scope.no,
                housecode: $scope.housecode,
                iotypename: '入库',
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

    var operatehtml = getHtmlInfos("app/views/base/grid_details.html", "详情查看", "toview");

    //数据列表信息
    var table = $('#' + $scope.gridtableid).DataTable({
        // processing: true,                    //加载数据时显示正在加载信息

        bFilter: false,    //去掉搜索框方法三：这种方法可以
        bLengthChange: false,   //去掉每页显示多少条数据方法

        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType: "full_numbers", fnDrawCallback: function () {
            this.api().column(0).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        },
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "outin/detailedAlllist",//获取数据的url
        fnServerData: retrieveData,         //获取数据的处理函数
        aoColumns: [
            //{sTitle: getHtmlInfos("app/views/base/check_all.html"), width: "5%"},
            {sTitle: "序号"},
            {sTitle: "仓房名称", mDataProp: "housename"},
            {sTitle: "业务日期", mDataProp: "crtime"
                // ,render: function (data) {
                //     return data == null ? '' : formatDate(data);
                // }
            },
            {sTitle: "商户名称", mDataProp: "carrier"},
            {sTitle: "粮食品种", mDataProp: "varietyname"},
            {sTitle: "等级", mDataProp: "outinQualityResult",
                render: function (data) {
                    return data == null ? "" : data.gradename;
                }},
            {sTitle: "收获年份", mDataProp: "grainyear"},
            // {sTitle: "检验结果", mDataProp: "outinQualityResult",
            //     render: function (data) {
            //         return data == null ? "" : data.advise;
            //     }},
            {sTitle: "毛重(千克)", mDataProp: "outinGross",
                render: function (data) {
                    return data == null ? "" : data.grossweight;
                }},
            {sTitle: "皮重(千克)", mDataProp: "outinTare",
                render: function (data) {
                    return data == null ? "" : data.tareweight;
                }},
            {sTitle: "质检扣量(%)", mDataProp: "outinQualityResult",
                render: function (data) {
                    return data == null ? "" : data.qualitycutweight;
                }},
            // {sTitle: "现场扣量(千克)", mDataProp: "outinTare",
            //     render: function (data) {
            //         return data == null ? "" : data.cutweight;
            //     }},
            {sTitle: "净重(千克)", mDataProp: "outinTare",
                render: function (data) {
                    return data == null ? "" : data.netweight;
                }},
            {sTitle: "结算重量(千克)", mDataProp: "outinSettlement",
                render: function (data) {
                    return data == null ? "" : data.jsweight;
                }},
            {sTitle: "结算单价(元/千克)", mDataProp: "outinSettlement",
                render: function (data) {
                    return data == null ? "" : data.jsprice.toFixed(2);
                }},
            {sTitle: "结算金额(元)", mDataProp: "outinSettlement",
                render: function (data) {
                    return data == null ? "" : data.jsmoney.toFixed(2);
                }}
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
    $("#" + $scope.gridtableid + " tbody").on('click', 'tr td button.toview', function () {
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        window.location.href = "#/outin/in_detailed/detail/" + data.busno;
    });
}]);

/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */

// 查看详情
App.controller("viewOutinDetailController", function ($scope, $stateParams, $http, ngDialog) {


    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/outin/in_detailed";
    }



    $http({
        url: GserverURL + '/outin/detailedAll',
        method: 'POST',
        data: {busno: $stateParams.busno}
    }).success(function (response) { //提交成功
        if (response.success) { //信息处理成功，进入用户中心页面
            $scope.outinEnty = response.data;
            $scope.iotypename=$scope.outinEnty.iotypename;
            if($scope.outinEnty.outinQuality){
                $scope.qianyangshijian = formatDate($scope.outinEnty.outinQuality.crtime);
            }
            if($scope.outinEnty.outinQualityResult){
                $scope.zhijianshijian = formatDate($scope.outinEnty.outinQualityResult.crtime);
            }
            $scope.yewuriqi = formatDate($scope.outinEnty.crtime);
            $scope.baogangshijian = formatDate($scope.outinEnty.crtime);
            $scope.chengzhongshijian = formatDate($scope.outinEnty.outinGross.grosstime);
            $scope.querenshijian = formatDate($scope.outinEnty.outinStore.crtime);
            $scope.pizhongshijian = formatDate($scope.outinEnty.outinTare.taretime);
            $scope.jiesuanshijian = formatDate($scope.outinEnty.outinSettlement.jstime);
            $scope.chumenshijian = formatDate($scope.outinEnty.outinPincard.outtime);
            $scope.jiesuanjine = $scope.outinEnty.outinSettlement.jsmoney;
            $scope.jiesuanjine = $scope.jiesuanjine.toFixed(2);
            $scope.jiesuandanjia = $scope.outinEnty.outinSettlement.jsprice;
            $scope.jiesuandanjia = $scope.jiesuandanjia.toFixed(2);
        } else { //信息处理失败，提示错误信息
            rzhdialog(ngDialog, response.info, "error");
        }
    }).error(function (response) { //提交失败
        rzhdialog(ngDialog, "操作失败", "error");
    })
});

