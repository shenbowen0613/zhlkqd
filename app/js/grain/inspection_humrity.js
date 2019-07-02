/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('grainInspectionHumrityController', ['$scope', '$http', '$stateParams', 'colors', function ($scope, $http, $stateParams, colors) {
    $("#houseName").html($stateParams.name); //设置仓名
    angular.element("#topBar").append(getHtmlInfos("app/views/base/to_back.html", "返回", "goGrain")); //添加功能按钮
    $("#goGrain").click(function () {
        window.location.href = "#/grain/index";
    });


    //根据仓库ID查询当日温度数据
    $.ajax({
        type: "POST",
        url: '/grain/get',
        dataType: 'json',
        data: {code: $stateParams.code},
        async: false,
        "success": function (result) {
            $scope.dataInfo = result.data;
            var up = '<em class="fa fa-long-arrow-up text-danger"/>';
            var down = '<em class="fa fa-long-arrow-down text-danger"/>';
            var checkTxt = "检测结果：";
            if(result.data!=null){
                if(result.data.outh!=null){
                    var oh = parseInt(result.data.outh);
                    if(oh<0){
                        $("#ohEquals").html(down);
                        checkTxt += "仓外湿度过低；";
                    }else if(oh>50){
                        $("#ohEquals").html(up);
                        checkTxt += "仓外湿度过高；";
                    }
                }

                if(result.data.inh!=null){
                    var ih = parseInt(result.data.inh);
                    if(ih<0){
                        $("#ihEquals").html(down);
                        checkTxt += "仓内湿度过低；";
                    }else if(ih>45){
                        $("#ihEquals").html(up);
                        checkTxt += "仓内湿度过高；";
                    }
                }

                if(result.data.hh!=null){
                    var hh = parseInt(result.data.hh);
                    if(hh<0){
                        $("#hhEquals").html(down);
                        checkTxt += "最高湿度过低；";
                    }else if(hh>45){
                        $("#hhEquals").html(up);
                        checkTxt += "最高湿度过高；";
                    }
                }

                if(result.data.lh!=null){
                    var lh = parseInt(result.data.lh);
                    if(lh<0){
                        $("#lhEquals").html(down);
                        checkTxt += "最低湿度过低；";
                    }else if(lh>45){
                        $("#lhEquals").html(up);
                        checkTxt += "最低湿度过高；";
                    }
                }

                if(result.data.ah!=null){
                    var ah = parseInt(result.data.ah);
                    if(ah<0){
                        $("#ahEquals").html(down);
                        checkTxt += "平均湿度过低；";
                    }else if(ah>45){
                        $("#ahEquals").html(up);
                        checkTxt += "平均湿度过高；";
                    }
                }
                $("#checkTxt").html(checkTxt);
            }
        }
    });
}]);