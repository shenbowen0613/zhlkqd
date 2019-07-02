// App.controller('bussController', ['$scope', '$http', 'ngDialog','$rootScope', function ($scope, $http, ngDialog,$rootScope) {
//     $rootScope.app.navbarTitle = "业务管理系统"; //设置头部提示信息
// }]);
// /**=========================================================
//  * Module: 基本数据
//  * Setup options and data for flot chart directive
//  =========================================================*/
//
// App.controller('bussindexDataCountController', ['$scope', '$http', 'ngDialog', function ($scope, $http, ngDialog) {
//     $scope.datacount={house:0,device:0,res:0,cust:0};
//     $http({
//         url: GserverURL+'/buss/index/datacount',
//         method: 'POST'
//     }).success(function (response) {
//         if (response.success) {
//             $scope.datacount=response.data;
//         } else {
//             rzhdialog(ngDialog,response.info,"error");
//         }
//     }).error(function (response) { //提交失败
//             rzhdialog(ngDialog,"操作失败","error");
//         }
//     );
// }]);
//
// /**=========================================================
//  * Module: 任务数量
//  * Setup options and data for flot chart directive
//  =========================================================*/
//
// App.controller('bussindexTaskCountController', ['$scope', '$http', 'ngDialog', function ($scope, $http, ngDialog) {
//     $scope.taskcount={total:0,checking:0,checked:0,doing:0,done:0};
//     $http({ //查询按钮权限
//         url: GserverURL+'/buss/index/taskcount',
//         method: 'POST'
//     }).success(function (response) {
//         if (response.success) {
//             for(var index=0;index<response.data.length;index++){
//                 var rows=response.data[index];
//                 var ct=rows.count; var st=rows.curstepcode;
//                 $scope.taskcount.total+=ct;
//                 if(st==1)$scope.taskcount.checking+=ct;
//                 else if(st==2)$scope.taskcount.checked+=ct;
//                 else if(st==3)$scope.taskcount.doing+=ct;
//                 else if(st==5)$scope.taskcount.done+=ct;
//             }
//         } else {
//             rzhdialog(ngDialog,response.info,"error");
//         }
//     }).error(function (response) { //提交失败
//             rzhdialog(ngDialog,"操作失败","error");
//         }
//     );
// }]);
// /**=========================================================
//  * Module: 财务图表
//  * Setup options and data for flot chart directive
//  =========================================================*/
// App.controller('bussindexfinanceChartController', ['$scope', '$http', 'ngDialog', function ($scope, $http, ngDialog) {
//     /**
//      * 加载财务信息
//      */
//     $scope.loadfinacecharts=function(){
//         //重绘图表
//         $scope.opt_title = "财务变化";
//         $scope.opt_legend = ['收入', '支出'];
//         var pData = {};
//         $.ajax({ //首次进入，获取温度信息
//             url:GserverURL+'/grain/inspectionHumrity',
//             method: 'POST',
//             async: false,
//             data: pData
//         }).success(function (result) {
//             if (result.success) {
//                 $scope.tempData = result.data;
//                 var axisObj = [];
//                 var dataObj1 = [];
//                 var dataObj2 = [];
//                 angular.forEach(result.data.aaData, function (data, index, array) {
//                     axisObj.push(data.checktime.substr(8, 2) + ":" + data.checktime.substr(10, 2));
//                     dataObj1.push(data.outh);
//                     dataObj2.push(data.inh);
//                 });
//                 $scope.opt_xAxis = axisObj.slice(0, 10);
//                 $scope.data1 = dataObj1.slice(0, 10);
//                 $scope.data2 = dataObj2.slice(0, 10);
//                 $scope.finance_option = {
//                     backgroundColor: '#ffffff',//背景色
//                     title: {
//                         text: $scope.opt_title
//                     },
//                     tooltip: {
//                         trigger: 'axis',
//                         formatter: function (params, ticket, callback) {
//
//                             var res;
//                             if (typeof(params[0]) == "undefined") {
//                                 res = params.name + "<br/>" + params.seriesName + " : ￥" + params.data.value + ""
//                             } else {
//                                 res = params[0].name;
//                                 for (var i = 0, l = params.length; i < l; i++) {
//                                     res += '<br/>' + params[i].seriesName + ' : ￥' + params[i].value + "";
//                                 }
//                             }
//                             setTimeout(function () {
//                                 callback(ticket, res);
//                             }, 100)
//                             return 'loading';
//                         }
//                     },
//                     legend: {
//                         data: $scope.opt_legend
//                     },
//                     //toolbox: {
//                     //    show: false,
//                     //    feature: {
//                     //        dataZoom: {
//                     //            yAxisIndex: 'none'
//                     //        },
//                     //        dataView: {readOnly: false},
//                     //        magicType: {type: ['line', 'bar']},
//                     //        restore: {},
//                     //        saveAsImage: {}
//                     //    }
//                     //},
//                     xAxis: {
//                         type: 'category',
//                         boundaryGap: false,
//                         data: $scope.opt_xAxis
//                     },
//                     yAxis: {
//                         type: 'value',
//                         axisLabel: {
//                             formatter: '￥{value}'
//                         }
//                     },
//                     series: [
//                         {
//                             name: $scope.opt_legend[0],
//                             type: 'line',
//                             barWidth: 10,
//                             data: $scope.data1,
//                             formatter: '￥{a}',
//                             itemStyle:{
//                                 normal:{
//                                     color:'#BDBAED',
//                                     lineStyle:{
//                                         color:'#7265BA'
//                                     }
//                                 }
//                             },
//                             areaStyle: {normal: {color:'#BDBAED'}},
//                             //stack: '总量',
//                             //,
//                             //markPoint: {
//                             //    data: [
//                             //        {type: 'max', name: '最大值'},
//                             //        {type: 'min', name: '最小值'}
//                             //    ]
//                             //}
//                         }
//                         ,
//                         {
//                             name: $scope.opt_legend[1],
//                             type: 'line',
//                             barWidth: 10,
//                             data: $scope.data2,
//                             itemStyle:{
//                                 normal:{
//                                     color:'#CBEBF6',
//                                     lineStyle:{
//                                         color:'#23B7E6'
//                                     }
//                                 }
//                             },
//                             areaStyle: {normal: {color:'#CBEBF6'}},
//                             //stack: '总量',
//                             //,
//                             //markPoint: {
//                             //    data: [
//                             //        {type: 'max', name: '最大值'},
//                             //        {type: 'min', name: '最小值'}
//                             //    ]
//                             //}
//                         }
//                     ]
//                 }; //图表数据
//             }
//         });
//     }
//     $scope.loadfinacecharts();
//
// }]);
// /**=========================================================
//  * Module: 出入库图表
//  * Setup options and data for flot chart directive
//  =========================================================*/
// App.controller('bussindexinoutChartController', ['$scope', '$http', 'ngDialog', function ($scope, $http, ngDialog) {
//
//     /**
//      * 加载出入库信息
//      */
//     $scope.loadinoutcharts=function(){
//         //重绘图表
//         $scope.opt_title = "库存变化";
//         $scope.opt_legend = [ '入库','出库'];
//         var pData = {};
//         $.ajax({ //首次进入，获取温度信息
//              url: GserverURL+'/grain/inspectionHumrity',
//             method: 'POST',
//             async: false,
//             data: pData
//         }).success(function (result) {
//             if (result.success) {
//                 $scope.tempData = result.data;
//                 var axisObj = [];
//                 var dataObj1 = [];
//                 var dataObj2 = [];
//                 angular.forEach(result.data.aaData, function (data, index, array) {
//                     axisObj.push(data.checktime.substr(8, 2) + ":" + data.checktime.substr(10, 2));
//                     dataObj1.push(data.hh);
//                     dataObj2.push(data.lh);
//                 });
//                 $scope.opt_xAxis = axisObj.slice(0, 10);
//                 $scope.data1 = dataObj1.slice(0, 10);
//                 $scope.data2 = dataObj2.slice(0, 10);
//                 $scope.inout_option = {
//                     backgroundColor: '#ffffff',//背景色
//                     title: {
//                         text: $scope.opt_title
//                     },
//                     tooltip: {
//                         trigger: 'axis',
//                         formatter: function (params, ticket, callback) {
//
//                             var res;
//                             if (typeof(params[0]) == "undefined") {
//                                 res = params.name + "<br/>" + params.seriesName + " : " + params.data.value + "T"
//                             } else {
//                                 res = params[0].name;
//                                 for (var i = 0, l = params.length; i < l; i++) {
//                                     res += '<br/>' + params[i].seriesName + ' : ' + params[i].value + "T";
//                                 }
//                             }
//                             setTimeout(function () {
//                                 callback(ticket, res);
//                             }, 100)
//                             return 'loading';
//                         }
//                     },
//                     legend: {
//                         data: $scope.opt_legend
//                     },
//                     //toolbox: {
//                     //    show: false,
//                     //    feature: {
//                     //        dataZoom: {
//                     //            yAxisIndex: 'none'
//                     //        },
//                     //        dataView: {readOnly: false},
//                     //        magicType: {type: ['line', 'bar']},
//                     //        restore: {},
//                     //        saveAsImage: {}
//                     //    }
//                     //},
//                     xAxis: {
//                         type: 'category',
//                         boundaryGap: false,
//                         data: $scope.opt_xAxis
//                     },
//                     yAxis: {
//                         type: 'value',
//                         axisLabel: {
//                             formatter: '{value} T'
//                         }
//                     },
//                     series: [
//                         {
//                             name: $scope.opt_legend[0],
//                             type: 'line',
//                             barWidth: 10,
//                             data: $scope.data1,
//                             formatter: '{a} T',
//                             itemStyle:{
//                                 normal:{
//                                     color:'#BADF8F',
//                                     lineStyle:{
//                                         color:'#AAD874'
//                                     }
//                                 }
//                             },
//                             areaStyle: {normal: {color:'#BADF8F'}},
//                             //stack: '总量',
//                             //,
//                             //markPoint: {
//                             //    data: [
//                             //        {type: 'max', name: '最大值'},
//                             //        {type: 'min', name: '最小值'}
//                             //    ]
//                             //}
//                         }
//                         ,
//                         {
//                             name: $scope.opt_legend[1],
//                             type: 'line',
//                             barWidth: 10,
//                             data: $scope.data2,
//                             itemStyle:{
//                                 normal:{
//                                     color:'#89CCCF',
//                                     lineStyle:{
//                                         color:'#7DC7DF'
//                                     }
//                                 }
//                             },
//                             areaStyle: {normal: {color:'#89CCCF'}},
//                             //stack: '总量',
//                             //,
//                             //markPoint: {
//                             //    data: [
//                             //        {type: 'max', name: '最大值'},
//                             //        {type: 'min', name: '最小值'}
//                             //    ]
//                             //}
//                         }
//                     ]
//                 }; //图表数据
//             }
//         });
//     }
//     $scope.loadinoutcharts();
//
// }]);
//
//
// /**=========================================================
//  * Module: 仓容图表
//  * Setup options and data for flot chart directive
//  =========================================================*/
// App.controller('bussindexhousevolumeChartController', ['$scope', '$http', 'ngDialog', function ($scope, $http, ngDialog) {
//     /**
//      * 加载仓容信息
//      */
//     $scope.loadvolumecharts=function(){
//         //重绘图表
//         $scope.opt_title = "粮库仓容（方）";
//         $scope.opt_legend = [ '已用仓容（方）','剩余仓容（方）'];
//         $.ajax({ //首次进入，获取温度信息
//             url: GserverURL+'/buss/index/grainvol',
//             method: 'POST',
//             async: false
//         }).success(function (result) {
//             if (result.success) {
//                 $scope.vol = result.data;
//                 var axisObj = [];
//                 var dataObj1 = {value:($scope.vol.grainvolume), name:'已用',itemStyle:{normal:{color:'#37bc9b'}}};
//                 var dataObj2 = {value:($scope.vol.involume), name:'剩余',itemStyle:{normal:{color:'#ff902b'}}};
//                 axisObj.push(dataObj1);//存放数据
//                 axisObj.push(dataObj2);//存放数据
//                 angular.forEach(result.data.aaData, function (data, index, array) {
//                     //axisObj.push(data);//存放数据
//                 });
//                 $scope.house_option = {
//                     backgroundColor: '#ffffff',//背景色
//                     title: {
//                         text: $scope.opt_title,
//                         //subtext: '纯属虚构',
//                         //x:'center'
//                     },
//                     tooltip : {
//                         trigger: 'item',
//                         formatter: "{a} <br/>{b} : {c} ({d}%)"
//                     },
//                     legend: {
//                         orient: 'vertical',
//                         left: 'right',
//                         data: $scope.opt_legend
//                     },
//                     series : [
//                         {
//                             name: '粮库仓容（方）',
//                             type: 'pie',
//                             radius : '70%',
//                             center: ['50%', '60%'],
//                             data:axisObj,
//                             itemStyle: {
//                                 emphasis: {
//                                     shadowBlur: 10,
//                                     shadowOffsetX: 0,
//                                     shadowColor: 'rgba(0, 0, 0, 0.5)'
//                                 }
//                             }
//                         }
//                     ]
//                     //series: [
//                     //    {
//                     //        name: '粮库仓容（T）',
//                     //        type:'pie',
//                     //        radius: ['50%', '80%'],
//                     //        avoidLabelOverlap: false,
//                     //        label: {
//                     //            normal: {
//                     //                show: false,
//                     //                position: 'center'
//                     //            },
//                     //            emphasis: {
//                     //                show: true,
//                     //                textStyle: {
//                     //                    fontSize: '30',
//                     //                    fontWeight: 'bold'
//                     //                }
//                     //            }
//                     //        },
//                     //        labelLine: {
//                     //            normal: {
//                     //                show: false
//                     //            }
//                     //        },
//                     //        data:axisObj
//                     //    }
//                     //]
//
//                 }; //图表数据
//             }
//         });
//     }
//     $scope.loadvolumecharts();
// }]);
//
// // 最新经营信息
// App.controller("indexbussinfoController", function ($scope,$http) {
//     $http({
//         url: GserverURL+ '/buss/bussinfo/newlist',
//         method: 'POST'
//     }).success(function (response) { //提交成功
//         if (response.success) { //信息处理成功，进入用户中心页面
//             $scope.indexbussinfo = response.data;
//             angular.forEach($scope.indexbussinfo, function (data, index, array) {
//                     data.uptime=formatDate(data.uptime);
//                     if(data.typecode=="busstrade"){
//                         data.typecode="circle-danger";
//                     }else{
//                         data.typecode="circle-success";
//                     }
//             });
//         }
//     })
// });
//
//
// // 待审批列表
// App.controller("indexplanapprovalrecordController", function ($scope,$http) {
//
//     //任务审批类型
//     $.ajax({ //查询按钮权限
//         url: GserverURL+"/sys/dict/list?typecode=approvaltype",
//         method: 'POST',
//         async: false
//     }).success(function (response) {
//         if (response.success) {
//             $scope.approvaltypes = response.data;
//         }
//     });
//
//     $http({
//         url: GserverURL+ '/buss/approval/approvalrecordlist',
//         method: 'POST'
//     }).success(function (response) { //提交成功
//         if (response.success)
//         { //信息处理成功，进入用户中心页面
//             $scope.indexplanapprovalrecord = response.data;
//             if(response.data.length>0){
//                 $scope.indexplanapprovalcount = response.data.length;
//             }
//             angular.forEach($scope.indexplanapprovalrecord, function (data)
//             {
//                 angular.forEach($scope.approvaltypes, function (approvaltype)
//                 {
//                     if(data.typecode==approvaltype.code)
//                     {
//                         data.typename=approvaltype.label;
//                         data.color=approvaltype.remark.split(",")[0];
//                         data.icon=approvaltype.remark.split(",")[1];
//                     }
//                 });
//             });
//         }
//     })
// });