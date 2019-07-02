/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
var selHouseCode;
var selHouseName;
var startDate;
var endDate;
var table;
App.controller('fumHistoryBarController', ['$scope', function ($scope) {
    $scope.menus = menuItems;
}]);
App.controller('fumHistoryController', ['$scope', '$http', 'ngDialog', '$filter', function ($scope, $http, ngDialog, $filter) {
    $scope.gridtableid = "fumHistoryTableGrids"; //数据列表id
    $scope.startimeOpen = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.startimeIsOpen = true;
    };
    $scope.endtimeOpen = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.endtimeIsOpen = true;
    };
    $.ajax({ //获取仓房信息
        url: '/la/house/tree',
        method: 'POST',
        async: false
    }).success(function (result) {
        if (result.success) {
            $scope.houseItems = result.data;
            if ($scope.houseItems.length > 0) {
                selHouseCode = $scope.houseItems[0].code; //设置当前仓房编码
                selHouseName = $scope.houseItems[0].label;
                $("#houseName").html("- " + selHouseName); //设置选中的当前仓房名
            }
        }
    });

    //点击仓房，加载信息
    $scope.houseInspectionInfo = function (code, name, $event) {
        if($event != undefined){
            $("#all_house > button").removeClass("btn-primary"); //剔除其他选中样式
            $($event.target).addClass("btn-primary"); //添加样式
        }
        selHouseCode = code;
        selHouseName = name;
        $("#houseName").html("- " + name); //设置选中的当前仓房名
        table.draw();
    }

    //点击搜索
    $scope.toSearch = function () {
        if ($scope.startDate != null && $scope.startDate != '') {
            startDate = $filter('date')($scope.startDate, 'yyyyMMdd'); //格式化开始日期
        }else{
            startDate=null;
        }
        if ($scope.endDate != null && $scope.endDate != '') {
            endDate = $filter('date')($scope.endDate, 'yyyyMMdd'); //格式化开始日期
        }else{
            endDate=null;
        }
        table.draw();
    }

    //打印报表
    $scope.toBuild = function(){
        rzhdialog(ngDialog,"打印成功","success");
    }

}]);
//列表信息处理
App.controller('fumHistoryGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    var operatehtml = getHtmlInfos("app/views/base/grid_details.html", "查看详情", "toView");
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData),"code":selHouseCode,"startDate":startDate,"endDate":endDate}, //以json格式传递
            async: false,
            "success": function (resp) {
                fnCallback(resp.data); //服务器端返回的对象的returnObject部分是要求的格式
            }
        });
    }
    //数据列表信息
    table = $('#' + $scope.gridtableid).DataTable({
        searching: false,                      //不显示搜索框
        processing: true,                    //加载数据时显示正在加载信息
        showRowNumber: true,
        serverSide: true,                    //指定从服务器端获取数据
        sPaginationType : "full_numbers",fnDrawCallback: function(){this.api().column(0).nodes().each(function(cell, i) {cell.innerHTML =  i + 1; });},
        pageLength: 25,                    //每页显示25条数据
        ajaxSource: "/fum/list",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            //{mDataProp: "id", sTitle: "id"},
            {sTitle: "序号", width: "8%"},
            {
                mDataProp: "crtime", sTitle: "时间", render: function (data) {
                return data == null ? '' : formatDate(data);
            }
            },
            {
                mDataProp: "grainnum", sTitle: "仓容量", render: function (data) {
                return data + "T";
            }
            },
            {
                mDataProp: "mode", sTitle: "熏蒸方式"
            },
            {
                mDataProp: "pestdensity", sTitle: "虫害密度", render: function (data) {
                return data + "头/公斤";
            }
            },
            {
                mDataProp: "pestgraingrade", sTitle: "虫害等级"
            },
            {
                mDataProp: "workstate", sTitle: "作业状态"
            },
            {sTitle: "操作"}
        ],
        aoColumnDefs: [//设置列的属性
            {
                bSortable: false,
                data: null,
                targets: 0
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
    //温度检测数据详情
    $("#" + $scope.gridtableid + " tbody").on('click', 'tr td button.toView', function () {
        var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
        window.location.href = "#/fum/fum_view/" + selHouseCode + "/" + selHouseName + "/" + data.crtime;
    });
}]);
