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
App.controller('aerateDeviceBarController', ['$scope', function ($scope) {
    $scope.menus = menuItems;
}]);
var device_type="fengji";//通风
App.controller('aerateDeviceController', ['$scope', '$http', 'ngDialog', '$filter', function ($scope, $http, ngDialog, $filter) {
    $scope.gridtableid = "aerateDeviceTableGrids"; //数据列表id

    $.ajax({
        url: GserverURL+ '/la/house/tree',
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

    $scope.deviceTypeRemark = function () {
        //获取节点配置的信息
        $.ajax({
            url: GserverURL+"/la/device/remark?typecode=" + device_type,
            method: 'POST',
            async: false
        }).success(function (response) {
            if (response.success) {
                $scope.devicetyperemarks = response.data;
                $scope.layercount = $scope.devicetyperemarks.indexOf("layercount") > -1 ? true : false;
                $scope.locindex = $scope.devicetyperemarks.indexOf("locindex") > -1 ? true : false;
                $scope.rowindex = $scope.devicetyperemarks.indexOf("rowindex") > -1 ? true : false;
                $scope.colindex = $scope.devicetyperemarks.indexOf("colindex") > -1 ? true : false;
                $scope.layercountname = $scope.layercount ? $scope.devicetyperemarks.split(",")[0] : "";
            }
        });
    }

    //点击修改设备类型
    $scope.changeDeviceType = function (code,typename) {
        device_type = code;
        $scope.deviceTypeRemark();
        $("[name='devicetypename']").html(typename);
        $scope.houseInspectionInfo(selHouseCode,selHouseName);
    }

    //点击仓房，加载信息
    $scope.houseInspectionInfo = function (code, name, $event) {
        if($event != undefined){
            $("#all_house > button").removeClass("btn-primary"); //剔除其他选中样式
            $($event.target).addClass("btn-primary"); //添加样式
        }
        selHouseCode = code;
        selHouseName = name;
        $scope.deviceView();
        $("#houseName").html("- " + name); //设置选中的当前仓房名
        if($scope.device!=null){
            table.draw();
            table.column(2).visible($scope.layercount);
            if ($scope.layercount) {
                var title = table.column(2).header();
                $(title).html($scope.layercountname + "号");
            }
            table.column(3).visible($scope.locindex);
            table.column(4).visible($scope.rowindex);
            table.column(5).visible($scope.colindex);
        }
    }



    $scope.deviceView = function(){
        $.ajax({
            type: "POST",
            url: GserverURL+'la/device/glist',
            dataType: 'json',
            data: {"housecode":selHouseCode,"typecode":device_type,"result":0}, //以json格式传递
            async: false,
            "success": function (resp) {
                if(resp.data!=null) {
                    $scope.device = resp.data.device;
                }else{
                    $scope.device=null;
                }
            }
        });
    }
    $scope.deviceTypeRemark();
    $scope.deviceView();
}]);


App.controller('aerateDeviceViewController', ['$scope', '$http', 'ngDialog', '$filter', function ($scope, $http, ngDialog, $filter) {
    $scope.deviceView();
}]);


//列表信息处理
App.controller('aerateDeviceGridController', ['$scope', "$http", "ngDialog", function ($scope, $http, ngDialog) {
    //分页动态加载数据
    function retrieveData(sSource, aoData, fnCallback) {
        //将客户名称加入参数数组
        $.ajax({
            type: "POST",
            url: GserverURL+sSource,
            dataType: 'json',
            data: {"aoData": JSON.stringify(aoData),"housecode":selHouseCode,"typecode":device_type,"result":1}, //以json格式传递
            async: false,
            "success": function (resp) {
                if(resp.data!=null) {
                    $scope.device=resp.data.device;
                    fnCallback(resp.data.list); //服务器端返回的对象的returnObject部分是要求的格式
                }else{
                    $scope.device=null;
                }
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
        ajaxSource: "la/device/glist",//获取数据的url
        fnServerData: retrieveData,           //获取数据的处理函数
        aoColumns: [
            {sTitle: "序号", width: "8%"},
            {
                sTitle: "设备",render: function () {
                if($scope.device!=null) {
                    return $scope.device.name;
                }
            }
            },
            {
                mDataProp: "layercount", sTitle:$scope.layercountname+ "号",bVisible:$scope.layercount
            },
            {
                mDataProp: "locindex", sTitle: "序号",bVisible:$scope.locindex
            },
            {
                mDataProp: "rowindex", sTitle: "行号",bVisible:$scope.rowindex
            },
            {
                mDataProp: "colindex", sTitle: "列号",bVisible:$scope.colindex
            },
            {
                mDataProp: "runstate", sTitle: "当前状态",render: function (data) {
                return data==1?'<font color="red">运行</font>':'停止';
                }
            },
            {mDataProp: "runstate",sTitle: "开关",render:function(data){
                var operatehtml='<label class="switch switch-lg tocheckbox">';
                if(data==1){
                    operatehtml+='<input type="checkbox" checked />'
                }else{
                    operatehtml+='<input type="checkbox" />'
                }
                operatehtml+='<span></span></label>';
                return operatehtml;
                }
            }
        ],
        aoColumnDefs: [//设置列的属性
            {
                bSortable: false,
                data: null,
                targets: 0
            }
        ]
    });
    //添加序号
    table.draw();

    $("#"+$scope.gridtableid+" tbody").on('click', 'tr td label.tocheckbox', function () {
            var data = table.row($(this).parent().parent()).data(); //获取爷爷节点 tr 的值
            $.ajax({
                url: GserverURL+'la/device/operate',
                method: 'POST',
                data: {
                    id: data.id,
                    runstate: data.runstate
                }
            }).success(function (response) {
                if (response.success) {
                    $scope.houseInspectionInfo(selHouseCode,selHouseName);
                }
            });
        });

}]);
