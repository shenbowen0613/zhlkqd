/*
 * Copyright (c) 2016. .保留所有权利.
 *
 *      保留所有代码著作权.如有任何疑问请访问官方网站与我们联系.
 *      代码只针对特定客户使用，不得在未经允许或授权的情况下对外传播扩散.恶意传播者，法律后果自行承担.
 *      本代码仅用于智慧粮库项目.
 */
App.controller('grainInspectionTempController', ['$scope', '$http', '$stateParams', 'colors', function ($scope, $http, $stateParams, colors) {
    $("#houseName").html($stateParams.name); //设置仓名
    angular.element("#topBar").append(getHtmlInfos("app/views/base/to_back.html", "返回", "goGrain")); //添加功能按钮
    $("#goGrain").click(function () {
        window.location.href = "#/grain/index";
    });



    //根据仓库ID查询当日温度数据
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
                if(result.data.outt!=null){
                    var ot = parseInt(result.data.outt);
                    if(ot<-30){
                        $("#outEquals").html(down);
                        checkTxt += "仓外温过低；";
                    }else if(ot>50){
                        $("#outEquals").html(up);
                        checkTxt += "仓外温过高；";
                    }
                }

                if(result.data.innert!=null){
                    var it = parseInt(result.data.innert);
                    if(it<5){
                        $("#innertEquals").html(down);
                        checkTxt += "仓内温过低；";
                    }else if(it>45){
                        $("#innertEquals").html(up);
                        checkTxt += "仓内温过高；";
                    }
                }

                if(result.data.ht!=null){
                    var ht = parseInt(result.data.ht);
                    if(ht<5){
                        $("#htEquals").html(down);
                        checkTxt += "最高温过低；";
                    }else if(ht>45){
                        $("#htEquals").html(up);
                        checkTxt += "最高温过高；";
                    }
                }

                if(result.data.lt!=null){
                    var lt = parseInt(result.data.lt);
                    if(lt<5){
                        $("#ltEquals").html(down);
                        checkTxt += "最低温过低；";
                    }else if(lt>45){
                        $("#ltEquals").html(up);
                        checkTxt += "最低温过高；";
                    }
                }

                if(result.data.at!=null){
                    var at = parseInt(result.data.at);
                    if(at<5){
                        $("#atEquals").html(down);
                        checkTxt += "平均温过低；";
                    }else if(at>45){
                        $("#atEquals").html(up);
                        checkTxt += "平均温过高；";
                    }
                }
                $("#checkTxt").html(checkTxt);
            }
        }
    });

}]);