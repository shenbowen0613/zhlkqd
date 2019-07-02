App.controller('OilmonitorindexController', ['$scope', '$http', 'ngDialog', '$rootScope', function ($scope, $http, ngDialog, $rootScope) {
    $rootScope.app.navbarTitle = "油脂测控首页"; //设置头部提示信息
    function echart1(ya1,ya3) {
        var ya2 = ya3-ya1;
        var myChart = echarts.init(document.getElementById('ylfx1'));
        var option = {
            tooltip: {
                trigger: 'item',
               	formatter: function (a) { 
return "油量<br/>"+a.name+": "+a.value+" ("+((Number(a.value)/ya3)*100).toFixed(2)+"%)" }
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                data:['油量','空']
            },
            series: [
                {
                    name:'访问来源',
                    type:'pie',
                    radius: ['45%', '100%'],
                    avoidLabelOverlap: false,
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    center:["50%","75%"],
                    startAngle: 180,
                    "color": ["#0696ff","#9b9b9b","transparent"],
                    data:[
                        {value:ya1.toFixed(2), name:'油量'},
                        {value:ya2.toFixed(2), name:'空'},
                        {value:ya3, name:'',tooltip:{formatter:function(a){return ""}}}
                    ]
                }
            ]
        };
        myChart.setOption(option);
    }
    function echart2(yt1,yt2,yt3) {
        var myChart1 = echarts.init(document.getElementById('ylfx2'));
        var option1 = {
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} "
            },
            color:['#ff6969','#d12036', '#ca4c0c', '#391fba', '#4652fa','#6ea0ff'],
            series : [
                {
                    name: '访问来源',
                    type: 'pie',
                    radius : '50%',
                    center: ['27%', '50%'],
                    data:[
                        {value:yt1, name:'最高温'},
                        {value:yt2, name:'最低温'},
                        {value:yt3, name:'平均温度'}
                    ],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        myChart1.setOption(option1);
    }
    $scope.youguanchaxun = function(id){
        $scope.oilTankName = "Y"+id+"植物油储油罐";
        $http({
            method : 'get',
            url : "http://192.0.0.250:8002/Oilmonitortwo/Detection/selectcangData",
            params : {
                cang : id
            }// 传递数据作为字符串，从前台传到后台
        }).success(function(data) {
            $scope.youguan1 = data;
            $("#temp2").empty();
            $("#temp2").append("<div class=\"tempGauge2\">"+data.t_yemian+"</div>");
            setTimeout(function () {
                $(".tempGauge2").tempGauge({width:50, borderWidth:3, borderColor:"#a4a4a4", fillColor:"#dcdcdc", showLabel:true});
            },100);
            echart1(data.t_yemian,15.6);
            $scope.youlianghie = Math.ceil((data.t_yemian/15.6)*100);
            $scope.qicengwen = JSON.parse(data.t_wendu);
            // angular.forEach(wenduq,function (da,index) {
            //     console.log(da);
            //     console.log(index);
            //     $scope.qicengwen[index] = da;
            // });
            $("#temp0").empty();
            $("#temp3").empty();
            $("#temp0").append("<div class=\"tempGauge0\">"+data.t_max+"</div>");
            $("#temp3").append("<div class=\"tempGauge3\">"+data.t_min+"</div>");
            setTimeout(function () {
                $(".tempGauge0").tempGauge({width:50, borderWidth:3, showLabel:true, borderColor:"#a4a4a4"});
                $(".tempGauge3").tempGauge({width:50, borderWidth:3, fillColor:"blue",borderColor:"#a4a4a4", showLabel:true});
            },100);
            echart2(data.t_max,data.t_min,data.t_average);
        }).error(function() {
            console.log("错误！");
        });
        // $http({
        //     method : 'get',
        //     url : OilmonURL + "/Oilmonitor/findTT.action",
        //     params : {
        //         OilTankId : id
        //     }// 传递数据作为字符串，从前台传到后台
        // }).success(function(data) {
        //     $scope.youguan2 = data[0];
        //     $("#temp0").empty();
        //     $("#temp3").empty();
        //     $("#temp0").append("<div class=\"tempGauge0\">"+data[0].AT+"</div>");
        //     $("#temp3").append("<div class=\"tempGauge3\">"+data[0].AH+"</div>");
        //     setTimeout(function () {
        //         $(".tempGauge0").tempGauge({width:50, borderWidth:3, showLabel:true, borderColor:"#a4a4a4"});
        //         $(".tempGauge3").tempGauge({width:50, borderWidth:3, fillColor:"blue",borderColor:"#a4a4a4", showLabel:true});
        //     },100);
        //     echart2(data[0].inT,data[0].outT,data[0].AT,data[0].inH,data[0].outH,data[0].AH);
        // }).error(function() {
        //     alert("错误！");
        // });
    }
    $scope.youguanchaxun(1);
    $scope.buttontoview = function (data) {
        window.location.href = "#/Oilmonitor/index/view/" + data;
    }
    //关闭弹出窗口操作
    $scope.toRemove=function(){
        window.location.href = "#/Oilmonitor/index";
    }
    $scope.collectionInfo = function (data) {
        $("#box").show();
        $http({
            method: 'GET',
            url: 'http://192.0.0.250:8888/oil',
            params: {
                cang: data
            }
        }).success(function(response) {
            $("#box").hide();
            rzhdialog(ngDialog,"采集成功","success");
            $scope.youguanchaxun(data);
        }).error(function () {
            //处理响应失败
            $("#box").hide();
            rzhdialog(ngDialog,"采集失败","error");
        });
    };
}]);
// 查看详情
App.controller('OilmonitorViewController', ['$scope', '$http', 'ngDialog','$rootScope','$stateParams', function ($scope, $http, ngDialog,$rootScope,$stateParams) {
    $scope.houstcode = $stateParams.id;
    $http({
        method : 'get',
        url : "http://192.0.0.250:8002/Oilmonitortwo/Detection/selectcang",
        params : {
            cang : $scope.houstcode
        }// 传递数据作为字符串，从前台传到后台
    }).success(function(data) {
        $scope.oilTankName = "Y"+$scope.houstcode+"植物油储油罐";
        var data_list = data;
        angular.forEach(data_list,function (da,index) {
            da.t_wendu = JSON.parse(da.t_wendu);
        });
        $scope.table_housecode = data_list;
    }).error(function() {
        console.log("错误！");
    });
}]);