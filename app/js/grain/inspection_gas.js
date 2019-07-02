/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('grainInspectionGasController', ['$scope', '$http', '$stateParams', 'colors', function ($scope, $http, $stateParams, colors) {
    $("#houseName").html($stateParams.name); //设置仓名
    angular.element("#topBar").append(getHtmlInfos("app/views/base/to_back.html", "返回", "goGrain")); //添加功能按钮
    $("#goGrain").click(function () {
        window.location.href = "#/grain/index";
    });


    //根据仓库ID查询当日数据
    $.ajax({
        url: GserverURL+ '/grain/get',
        type: "POST",
        dataType: 'json',
        data: {code: $stateParams.code},
        async: false,
        "success": function (result) {
            $scope.dataInfo = result.data;
            var up = '<em class="fa fa-long-arrow-up text-danger"/>';
            var down = '<em class="fa fa-long-arrow-down text-danger"/>';
            var checkTxt = "检测结果：";
            if(result.data!=null){
                if(result.data.phosphineconcentration!=null){
                    var phosphineconcentration = parseInt(result.data.phosphineconcentration);
                    if(phosphineconcentration<80){
                        $("#phosphineEquals").html(down);
                        checkTxt += "磷化氢含量过低；";
                    }else if(phosphineconcentration>130){
                        $("#phosphineEquals").html(up);
                        checkTxt += "磷化氢含量过高；";
                    }
                }

                if(result.data.nitrogenconcentration!=null){
                    var nitrogenconcentration = parseInt(result.data.nitrogenconcentration);
                    if(nitrogenconcentration<30){
                        $("#nitrogenEquals").html(down);
                        checkTxt += "氮气含量过低；";
                    }else if(nitrogenconcentration>75){
                        $("#nitrogenEquals").html(up);
                        checkTxt += "氮气含量过高；";
                    }
                }

                if(result.data.oxygenconcentration!=null){
                    var oxygenconcentration = parseInt(result.data.oxygenconcentration);
                    if(oxygenconcentration<180){
                        $("#oxygenEquals").html(down);
                        checkTxt += "氧气含量过低；";
                    }else if(oxygenconcentration>250){
                        $("#oxygenEquals").html(up);
                        checkTxt += "氧气含量过高；";
                    }
                }

                if(result.data.co2Concentration!=null){
                    var co2concentration = parseInt(result.data.co2Concentration);
                    if(co2concentration<600){
                        $("#co2Equals").html(down);
                        checkTxt += "二氧化碳含量过低；";
                    }else if(co2concentration>800){
                        $("#co2Equals").html(up);
                        checkTxt += "二氧化碳含量过高；";
                    }
                }

                $("#checkTxt").html(checkTxt);
            }
        }
    });



}]);