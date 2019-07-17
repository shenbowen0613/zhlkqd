/*!
 * @author 立坤 整理于 2016.06.15
 * @ramark 全站框架核心控制处，框架技术 - Bootstrap + AngularJS
 * 
 */
if (typeof $ === 'undefined') {
    throw new Error(baseInfo.getInfo("unjquery"));
}

var menuItems; //权限集合
var indexMenuItems; //首页权限集合
var moduleId; //模块id
var footerMenuUrl; //底部样式
var loginUsercode;//当前登录用户
/******************************** 初始化加载基础数据 begin ************************************************************/
var App = angular.module('angle', [
    'ngRoute',
    'ngAnimate',
    'ngStorage',
    'ngCookies',
    'pascalprecht.translate',
    'ui.bootstrap',
    'ui.router',
    'oc.lazyLoad',
    'cfp.loadingBar',
    'ngSanitize',
    'ngResource',
    'ui.utils'
]);
App.run(["$rootScope", "$state", "$stateParams", '$window', '$templateCache', function ($rootScope, $state, $stateParams, $window, $templateCache) {
    // 设置全局访问
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$storage = $window.localStorage;

    // 注释禁用模板缓存
    /*$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
     if (typeof(toState) !== 'undefined'){
     $templateCache.remove(toState.templateUrl);
     }
     });*/

    // 常用局部变量
    $rootScope.app = {
        navbarTitle: "首页",
        housename: "信阳山信恒盛粮油储备有限公司",
        name: baseInfo.getInfo("name"),
        description: baseInfo.getInfo("description"),
        phone: baseInfo.getInfo("phone"),
        keyword: baseInfo.getInfo("keyword"),
        year: ((new Date()).getFullYear()),
        layout: {
            isFixed: true,
            isCollapsed: false,
            isBoxed: false,
            isRTL: false,
            horizontal: false,
            isFloat: false,
            asideHover: false,
            theme: null
        },
        useFullLayout: false,
        hiddenFooter: false,
        viewAnimation: 'ng-fadeInUp'
    };
    //判断用户是否登录并引流
    $.ajax({
        url: GserverURL + "/getLoginInfo",
        type: "POST",
        async: false,
        "success": function (data) {
            if (data.success) {
                var uriInfo = window.location.href;
                $rootScope.loginUsername = data.data.truename;
                loginUsercode = data.data.username;
                var menu = data.data.sideBarMenu;
                if (menu != null && menu != "") indexMenuItems = JSON.parse(menu);

                if (uriInfo.split("#")[1] != undefined) {  //外部请求跳转处理
                    uriInfo = uriInfo.split("#")[1].replace("/", "").replace("/", ".");
                    if (uriInfo == "page.lock") {  //进入修改密码页面
                        $state.go(uriInfo);
                        return;
                    }
                    for (var i = 0; i < indexMenuItems.length; i++) { //进入操作模块页面
                        sref = indexMenuItems[i].sref;
                        if (uriInfo == sref) {
                            var mcode = indexMenuItems[i].code;
                            var pData = {id: mcode};
                            footerMenuUrl = uriInfo;
                            $.ajax({
                                url: GserverURL + '/sys/user/queryMenus',
                                method: 'POST',
                                data: pData
                            }).success(function (result) {
                                if (result.success) {
                                    var menu = result.data;
                                    if (menu != null && menu != "") menuItems = JSON.parse(menu);
                                    $state.go(sref);
                                }
                            });
                            return;
                        }
                    }
                }

                window.location.href = "#/page/index"; //进入首页
            } else {
                window.location.href = "#/page/login"; //进入登录页面
            }
        }
    });
    //当前登录的管理员信息
    $rootScope.user = {
        welcome: '欢迎您',
        //job: '业务管理系统',
        picture: 'app/img/user/02.png'
    };
}]);
/******************************** 初始化加载基础数据 end **************************************************************/

/******************************** 应用地址及配置（angularJs的路由功能实现） begin *************************************/
App.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', 'RouteHelpersProvider',
    function ($stateProvider, $locationProvider, $urlRouterProvider, helper) {
        'use strict';
        $locationProvider.html5Mode(false); // 是否使用html5模式（true、false）
        $urlRouterProvider.otherwise('/page/login'); //默认进入登录页面
        // 路由分配
        $stateProvider
            .state('page.404', {
                url: '/404',
                title: "未找到页面",
                templateUrl: helper.basepath('404.html'),
            })
            .state('page', {
                url: '/page',
                templateUrl: helper.basepath('sys/page.html'),
                resolve: helper.resolveFor('modernizr', 'icons', 'jqDock', 'screenfull'),
                controller: ["$rootScope", function ($rootScope) {
                    $rootScope.app.layout.isBoxed = false;
                }]
            })
            .state('page.lock', {
                url: '/lock',
                title: "修改密码",
                templateUrl: helper.basepath('sys/lock.html'),
                resolve: helper.resolveFor("lockJs")
            })
            .state('page.login', {
                url: '/login',
                title: "管理员登录",
                templateUrl: helper.basepath('sys/login.html'),
                resolve: helper.resolveFor("loginJs")
            })
            .state('page.index', {
                url: '/index',
                title: "管理员登录",
                templateUrl: helper.basepath('index.html'),
                resolve: helper.resolveFor("indexJs")
            })
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: helper.basepath('app.html'),
                controller: 'AppController',
                resolve: helper.resolveFor('modernizr', 'jqDock', 'screenfull', 'icons')
            })
            .state('app.index', {
                url: '/index',
                title: '业务管理系统首页',
                templateUrl: helper.basepath('buss/index.html'),
                resolve: helper.resolveFor('echartsjs', "ngDialog", "bussindexJs")
            })

            // add by BoBai 2016-12-14 9:30:29   begin
            //*********************************** chengzi 参考 begin
            .state('app.buss_info', {
                url: '/buss/bussinfo',
                title: "经营管理",
                templateUrl: helper.basepath('buss/bussinfo.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "bussinfoJs", 'ngWig')
                // bussinfoJs  的引用在 下面  1666行
            })
            .state('app.buss_info.add', {
                url: '/add',
                title: '经营管理添加',
                templateUrl: helper.basepath('buss/bussinfo_add.html')
            })
            .state('app.buss_info.update', {
                url: '/update',
                title: '经营管理修改',
                templateUrl: helper.basepath('buss/bussinfo_update.html')
            })
            .state('app.buss_info.view', {
                url: '/view/:id',
                title: '经营管理查看',
                templateUrl: helper.basepath('buss/bussinfo_view.html')
            })

            .state('app.la_task', {
                url: '/buss/latask',
                title: "经营管理",
                templateUrl: helper.basepath('buss/latask.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laTaskJs", 'ngWig')
            })
            //*********************************** chengzi 参考 end

            .state('app.la_task.add', {
                url: '/add',
                title: '作业调度管理添加',
                templateUrl: helper.basepath('buss/latask_add.html')
            })
            .state('app.la_task.update', {
                url: '/update',
                title: '作业调度修改',
                templateUrl: helper.basepath('buss/latask_update.html')
            })

            .state('app.la_task.change', {
                url: '/change',
                title: '作业调度更改状态',
                templateUrl: helper.basepath('buss/latask_change.html')
            })
            .state('app.la_task.view', {
                url: '/view/:id',
                title: '作业调度查看',
                templateUrl: helper.basepath('buss/latask_view.html')
            })

            .state('app.la_task_rec', {
                url: '/buss/latask_rec/:taskcode/:taskname',
                title: "作业调度记录",
                templateUrl: helper.basepath('buss/latask_rec.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "lataskRecJs", 'ngWig')
            })
            .state('app.la_task_rec.view', {
                url: '/view/:id',
                title: '作业调度记录查看',
                templateUrl: helper.basepath('buss/latask_rec_view.html')
            })
            .state('app.qa_task', {
                url: '/buss/qatask',
                title: "检测任务管理",
                templateUrl: helper.basepath('buss/qatask.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "qataskJs", 'ngWig')
            })

            .state('app.qa_task.add', {
                url: '/add',
                title: '检测任务添加',
                templateUrl: helper.basepath('buss/qatask_add.html')
            })
            .state('app.qa_task.update', {
                url: '/update',
                title: '检测任务修改',
                templateUrl: helper.basepath('buss/qatask_update.html')
            })
            .state('app.qa_task.change', {
                url: '/change',
                title: '检测任务更改状态',
                templateUrl: helper.basepath('buss/qatask_change.html')
            })
            .state('app.qa_task.view', {
                url: '/view/:id',
                title: '检测任务查看',
                templateUrl: helper.basepath('buss/qatask_view.html')
            })

            .state('app.qa_task_rec', {
                url: '/buss/qatask_rec/:taskcode/:taskname',
                title: "检测任务记录",
                templateUrl: helper.basepath('buss/qatask_rec.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "qataskRecJs", 'ngWig')
            })
            .state('app.qa_task_rec.view', {
                url: '/view/:id',
                title: '检测任务记录查看',
                templateUrl: helper.basepath('buss/qatask_rec_view.html')
            })


            .state('app.qa_sheet', {
                url: '/buss/qainspection',
                title: "检验单管理",
                templateUrl: helper.basepath('buss/qainspection.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "qainspectionJs", 'ngWig', "dateTimePicker", "qrcodeJs")
            })
            .state('app.qa_sheet.view', {
                url: '/view/:id',
                title: '检验单查看',
                templateUrl: helper.basepath('buss/qainspection_view.html')
            })
            .state('app.qa_sheet.add', {
                url: '/add',
                title: '添加检验单',
                templateUrl: helper.basepath('buss/qainspection_add.html')
            })
            .state('app.qa_sheet.update', {
                url: '/update',
                title: '修改检验单',
                templateUrl: helper.basepath('buss/qainspection_update.html')
            })

            .state('app.qa_sampling', {
                url: '/buss/sampling',
                title: "扦样及样品管理",
                templateUrl: helper.basepath('buss/sampling.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "samplingJs", 'ngWig', "dateTimePicker", "qrcodeJs")
            })
            .state('app.qa_sampling.view', {
                url: '/view/:id',
                title: '扦样查看',
                templateUrl: helper.basepath('buss/sampling_view.html')
            })
            .state('app.qa_sampling.add', {
                url: '/add',
                title: '添加扦样',
                templateUrl: helper.basepath('buss/sampling_add.html')
            })
            .state('app.qa_sampling.update', {
                url: '/update',
                title: '修改扦样',
                templateUrl: helper.basepath('buss/sampling_update.html')
            })
            .state('app.qa_sampling_rec', {
                url: '/buss/samplingrec/:sno/:sname',
                title: '管理样品',
                templateUrl: helper.basepath('buss/sampling_rec.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "samplingrecJs", 'ngWig', "qrcodeJs")
            })
            .state('app.qa_sampling_rec.add', {
                url: '/add',
                title: '增加样品',
                templateUrl: helper.basepath('buss/sampling_rec_add.html')
            })
            .state('app.qa_sampling_rec.update', {
                url: '/update',
                title: '修改样品',
                templateUrl: helper.basepath('buss/sampling_rec_update.html')
            })
            .state('app.qa_sampling_rec.view', {
                url: '/view/:id',
                title: '查看样品',
                templateUrl: helper.basepath('buss/sampling_rec_view.html')
            })

            .state('app.qa_result', {
                url: '/buss/qaresult',
                title: '检验结果管理',
                templateUrl: helper.basepath('buss/qaresult.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "qaresultJs", 'ngWig', "qrcodeJs")
            })
            .state('app.qa_result.add', {
                url: '/add',
                title: '增加检验结果',
                templateUrl: helper.basepath('buss/qaresult_add.html')
            })
            .state('app.qa_result.update', {
                url: '/update',
                title: '修改检验结果',
                templateUrl: helper.basepath('buss/qaresult_update.html')
            })
            .state('app.qa_result.view', {
                url: '/view/:id',
                title: '查看检验结果',
                templateUrl: helper.basepath('buss/qaresult_view.html')
            })



            // add by BoBai  end
            // add by BoBai 2016-12-14 9:30:29   begin
            .state('app.buss_cust', {
                url: '/buss/cust',
                title: "客户管理",
                templateUrl: helper.basepath('buss/cust.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "bussCustJs", 'ngWig', "dateTimePicker")
            })
            .state('app.buss_cust.add', {
                url: '/add',
                title: '客户管理添加',
                templateUrl: helper.basepath('buss/cust_add.html')
            })
            .state('app.buss_cust.update', {
                url: '/update',
                title: '客户管理修改',
                templateUrl: helper.basepath('buss/cust_update.html')
            })
            .state('app.buss_cust.view', {
                url: '/view/:id',
                title: '客户管理查看',
                templateUrl: helper.basepath('buss/cust_view.html')
            })
            // add by BoBai  end
            // add by BoBai 2016-12-14 9:30:29   begin
            .state('app.la_device', {
                url: '/la/device',
                title: "仓储设备管理",
                templateUrl: helper.basepath('la/device.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laDeviceJs", 'ngWig')
            })
            .state('app.la_device.add', {
                url: '/add',
                title: '仓储设备管理添加',
                templateUrl: helper.basepath('la/device_add.html')
            })
            .state('app.la_device.update', {
                url: '/update',
                title: '仓储设备管理修改',
                templateUrl: helper.basepath('la/device_update.html')
            })
            .state('app.la_device.view', {
                url: '/view/:id',
                title: '仓储设备管理查看',
                templateUrl: helper.basepath('la/device_view.html')
            })
            // add by BoBai  end
            // add by BoBai 2016-12-14 9:30:29   begin
            .state('app.la_device_use', {
                url: '/la/device_use/:no/:devicename',
                title: "仓储设备使用管理",
                templateUrl: helper.basepath('la/device_use.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laDeviceUseJs", "dateTimePicker", 'ngWig')
            })
            .state('app.la_device_use.add', {
                url: '/add',
                title: '仓储设备使用记录添加',
                templateUrl: helper.basepath('la/device_use_add.html')
            })
            .state('app.la_device_use.view', {
                url: '/view/:id',
                title: '仓储设备使用记录查看',
                templateUrl: helper.basepath('la/device_use_view.html')
            })
            // add by BoBai  end
            // add by BoBai 2016-12-14 9:30:29   begin
            .state('app.la_device_maintain', {
                url: '/la/device_maintain/:no/:devicename',
                title: "仓储设备维修管理",
                templateUrl: helper.basepath('la/device_maintain.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laDeviceMaintainJs", "dateTimePicker", 'ngWig')
            })
            .state('app.la_device_maintain.add', {
                url: '/add',
                title: '仓储设备维修记录添加',
                templateUrl: helper.basepath('la/device_maintain_add.html')
            })
            .state('app.la_device_maintain.view', {
                url: '/view/:id',
                title: '仓储设备维修记录查看',
                templateUrl: helper.basepath('la/device_maintain_view.html')
            })
            // add by BoBai  end
            // add by BoBai 2016-12-14 9:30:29   begin
            .state('app.la_device_grain', {
                url: '/la/device_grain/:no/:devicename/:typecode',
                title: "粮情设备配置管理",
                templateUrl: helper.basepath('la/device_grain.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laDeviceGrainJs", 'ngWig')
            })
            .state('app.la_device_grain.add', {
                url: '/add',
                title: '粮情设备配置添加',
                templateUrl: helper.basepath('la/device_grain_add.html')
            })
            .state('app.la_device_grain.update', {
                url: '/update',
                title: '粮情设备配置修改',
                templateUrl: helper.basepath('la/device_grain_update.html')
            })
            .state('app.la_device_grain.view', {
                url: '/view/:id',
                title: '粮情设备配置查看',
                templateUrl: helper.basepath('la/device_grain_view.html')
            })
            // add by BoBai  end
            // add by BoBai 2016-12-14 9:30:29   begin
            .state('app.la_res', {
                url: '/buss/res',
                title: "药剂物品",
                templateUrl: helper.basepath('buss/res.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laResJs", 'ngWig', "dateTimePicker")
            })
            .state('app.la_res.add', {
                url: '/add',
                title: '药剂物品添加',
                templateUrl: helper.basepath('buss/res_add.html')
            })
            .state('app.la_res.addrec', {
                url: '/addrec',
                title: '药剂物品添加',
                templateUrl: helper.basepath('buss/res_addrec.html')
            })
            .state('app.la_res.update', {
                url: '/update',
                title: '药剂物品修改',
                templateUrl: helper.basepath('buss/res_update.html')
            })
            .state('app.la_res.view', {
                url: '/view/:id',
                title: '药剂物品查看',
                templateUrl: helper.basepath('buss/res_view.html')
            })

            .state('app.la_res_rec', {
                url: '/buss/res_rec/:medcode/:medname',
                title: "药剂物品出入",
                templateUrl: helper.basepath('buss/res_rec.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laResRecJs", 'ngWig', "dateTimePicker")
            })
            .state('app.la_res_rec.view', {
                url: '/view/:id',
                title: '药剂物品出入查看',
                templateUrl: helper.basepath('buss/res_rec_view.html')
            })

            // add by BoBai  end

            // add by Boqian  start
            .state('app.buss_finance', {
                url: '/buss/finance',
                title: '财务管理',
                templateUrl: helper.basepath('buss/finance.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "bussFinanceJs", 'ngWig')
            })
            .state('app.buss_finance.add', {
                url: '/add',
                title: '财务管理添加',
                templateUrl: helper.basepath('buss/finance_add.html')
            })
            .state('app.buss_finance.update', {
                url: '/update',
                title: '财务管理修改',
                templateUrl: helper.basepath('buss/finance_update.html')
            })
            .state('app.buss_finance.view', {
                url: '/view/:id',
                title: '财务管理查看',
                templateUrl: helper.basepath('buss/finance_view.html')
            })
            // add by Boqian  end

            // add by Boqian  start
            .state('app.buss_report', {
                url: '/report/buss/:path',
                title: '经营报表管理',
                templateUrl: helper.basepath('report/bussreport.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "bussReportJs", 'ngWig', "dateTimePicker")
            })
            .state('app.buss_report.add', {
                url: '/add',
                title: '经营报表管理添加',
                templateUrl: helper.basepath('report/bussreport_add.html')
            })
            .state('app.buss_report.view', {
                url: '/view/:id',
                title: '经营报表管理查看',
                templateUrl: helper.basepath('report/bussreport_view.html')
            })
            // add by Boqian  end
            // add by Boqian  start
            .state('app.la_report', {
                url: '/report/la/:path',
                title: '仓储报表管理',
                templateUrl: helper.basepath('report/lareport.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laReportJs", 'ngWig', "dateTimePicker")
            })
            .state('app.la_report.add', {
                url: '/add',
                title: '仓储报表管理添加',
                templateUrl: helper.basepath('report/lareport_add.html')
            })
            .state('app.la_report.view', {
                url: '/view/:id',
                title: '仓储报表管理查看',
                templateUrl: helper.basepath('report/lareport_view.html')
            })
            // add by Boqian  end
            // add by Boqian  start
            .state('app.rsgain_report', {
                url: '/report/rsgain/:path',
                title: '储备粮报表管理',
                templateUrl: helper.basepath('report/rsgainreport.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "rsgainReportJs", 'ngWig')
            })
            .state('app.rsgain_report.add', {
                url: '/add',
                title: '储备粮报表管理添加',
                templateUrl: helper.basepath('report/rsgainreport_add.html')
            })
            .state('app.rsgain_report.view', {
                url: '/view/:id',
                title: '储备粮报表管理查看',
                templateUrl: helper.basepath('report/rsgainreport_view.html')
            })
            // add by Boqian  end
            // add by Boqian  start
            .state('app.la_house', {
                url: '/la/house',
                title: '仓房管理',
                templateUrl: helper.basepath('la/house.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laHouseJs", 'ngWig')
            })
            .state('app.la_house.storage', {
                url: '/storage',
                title: '粮库配置管理',
                templateUrl: helper.basepath('la/storage.html')
            })

            .state('app.la_house.add', {
                url: '/add',
                title: '仓房管理添加',
                templateUrl: helper.basepath('la/house_add.html')
            })
            .state('app.la_house.update', {
                url: '/update',
                title: '仓房管理修改',
                templateUrl: helper.basepath('la/house_update.html')
            })
            .state('app.la_house.view', {
                url: '/view/:id',
                title: '仓房管理查看',
                templateUrl: helper.basepath('la/house_view.html')
            })
            // add by Boqian  end
            // add by Boqian  start
            .state('app.la_granary', {
                url: '/la/granary',
                title: '廒间管理',
                templateUrl: helper.basepath('la/granary.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laGranaryJs", 'ngWig')
            })
            .state('app.la_granary.add', {
                url: '/add',
                title: '廒间管理添加',
                templateUrl: helper.basepath('la/granary_add.html')
            })
            .state('app.la_granary.update', {
                url: '/update',
                title: '廒间管理修改',
                templateUrl: helper.basepath('la/granary_update.html')
            })
            .state('app.la_granary.view', {
                url: '/view/:id',
                title: '廒间管理查看',
                templateUrl: helper.basepath('la/granary_view.html')
            })
            // add by Boqian  end
            // add by Boqian  start
            .state('app.la_goodsloc', {
                url: '/la/goodsloc',
                title: '货位管理',
                templateUrl: helper.basepath('la/goodsloc.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laGoodslocJs", 'ngWig', "dateTimePicker")
            })
            .state('app.la_goodsloc.add', {
                url: '/add',
                title: '货位管理添加',
                templateUrl: helper.basepath('la/goodsloc_add.html')
            })
            .state('app.la_goodsloc.update', {
                url: '/update',
                title: '货位管理修改',
                templateUrl: helper.basepath('la/goodsloc_update.html')
            })
            .state('app.la_goodsloc.view', {
                url: '/view/:id',
                title: '货位管理查看',
                templateUrl: helper.basepath('la/goodsloc_view.html')
            })
            // add by Boqian  end
            // add by Boqian  start
            .state('app.la_housecfg', {
                url: '/la/housecfg',
                title: '仓房配置管理',
                templateUrl: helper.basepath('la/housecfg.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laHousecfgJs", 'ngWig')
            })
            .state('app.la_housecfg.add', {
                url: '/add',
                title: '仓房配置添加',
                templateUrl: helper.basepath('la/housecfg_add.html')
            })
            .state('app.la_housecfg.update', {
                url: '/update',
                title: '仓房配置修改',
                templateUrl: helper.basepath('la/housecfg_update.html')
            })
            .state('app.la_housecfg.view', {
                url: '/view/:id',
                title: '仓房配置查看',
                templateUrl: helper.basepath('la/housecfg_view.html')
            })
            // add by Boqian  end
            // add by Boqian  start
            .state('app.la_grain', {
                url: '/la/grain',
                title: '储粮配置管理',
                templateUrl: helper.basepath('la/grain.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laGrainJs", 'ngWig', "dateTimePicker")
            })
            .state('app.la_grain.update', {
                url: '/update',
                title: '储粮配置修改',
                templateUrl: helper.basepath('la/grain_update.html')
            })
            .state('app.la_grain.view', {
                url: '/view/:housecode',
                title: '储粮配置查看',
                templateUrl: helper.basepath('la/grain_view.html')
            })
            // add by Boqian  end
            // add by Boqian  start
            .state('app.la_custody', {
                url: '/la/custody',
                title: '粮食保管账管理',
                templateUrl: helper.basepath('la/custody.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laCustodyJs", 'ngWig')
            })
            .state('app.la_custody.view', {
                url: '/view/:id',
                title: '粮食保管账查看',
                templateUrl: helper.basepath('la/custody_view.html')
            })
            .state('app.la_custody.grain', {
                url: '/grain/:housecode',
                title: '粮食保管总账查看',
                templateUrl: helper.basepath('la/grain_view.html')
            })
            // add by Boqian  end
            // add by Boqian  start
            .state('app.rsgain_store', {
                url: '/la/rscustody',
                title: '储备粮仓储管理',
                templateUrl: helper.basepath('la/rscustody.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laRscustodyJs", 'ngWig')
            })
            .state('app.rsgain_store.view', {
                url: '/view/:id',
                title: '储备粮仓储查看',
                templateUrl: helper.basepath('la/custody_view.html')
            })
            .state('app.rsgain_store.grain', {
                url: '/grain/:housecode',
                title: '储备粮仓储总账查看',
                templateUrl: helper.basepath('la/grain_view.html')
            })
            // add by Boqian  end
            // add by Boqian  start
            .state('app.la_operation', {
                url: '/la/operation',
                title: '仓储作业管理',
                templateUrl: helper.basepath('la/operation.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "laOperationJs", 'ngWig')
            })
            .state('app.la_operation.view', {
                url: '/view/:id',
                title: '仓储作业查看',
                templateUrl: helper.basepath('la/operation_view.html')
            })
            // add by Boqian  end

            // add by Boqian  begin
            .state('app.tpl_approval', {
                url: '/tpl/approval',
                title: "审批模板",
                templateUrl: helper.basepath('tpl/approval.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "tplApprovalJs", 'ngWig')
            })
            .state('app.tpl_approval.add', {
                url: '/add',
                title: '审批模板添加',
                templateUrl: helper.basepath('tpl/approval_add.html')
            })
            .state('app.tpl_approval.update', {
                url: '/update',
                title: '审批模板修改',
                templateUrl: helper.basepath('tpl/approval_update.html')
            })
            .state('app.tpl_approval.view', {
                url: '/view/:id',
                title: '审批模板查看',
                templateUrl: helper.basepath('tpl/approval_view.html')
            })
            .state('app.tpl_approval_cfg', {
                url: '/tpl/approvalcfg/:id',
                title: '审批模板配置',
                templateUrl: helper.basepath('tpl/approval_config.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "tplApprovalconfigJs", 'ngWig')
            })
            .state('app.tpl_approval_cfg.add', {
                url: '/add',
                title: '审批模板配置添加',
                templateUrl: helper.basepath('tpl/approval_config_add.html')
            })
            .state('app.tpl_approval_cfg.update', {
                url: '/update',
                title: '审批模板配置修改',
                templateUrl: helper.basepath('tpl/approval_config_update.html')
            })
            // add by Boqian  end

            // add by Boqian  begin
            .state('app.tpl_reports', {
                url: '/tpl/reports',
                title: "报表模板",
                templateUrl: helper.basepath('tpl/reports.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "tplReportsJs", 'ngWig')
            })
            .state('app.tpl_reports.add', {
                url: '/add',
                title: '报表模板添加',
                templateUrl: helper.basepath('tpl/reports_add.html')
            })
            .state('app.tpl_reports.update', {
                url: '/update',
                title: '报表模板修改',
                templateUrl: helper.basepath('tpl/reports_update.html')
            })
            .state('app.tpl_reports.view', {
                url: '/view/:id',
                title: '报表模板查看',
                templateUrl: helper.basepath('tpl/reports_view.html')
            })
            // add by Boqian  end
            // add by Boqian  begin
            .state('app.tpl_receipts', {
                url: '/tpl/receipts',
                title: "单据模板",
                templateUrl: helper.basepath('tpl/receipts.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "tplReceiptsJs", 'ngWig')
            })
            .state('app.tpl_receipts.add', {
                url: '/add',
                title: '单据模板添加',
                templateUrl: helper.basepath('tpl/receipts_add.html')
            })
            .state('app.tpl_receipts.update', {
                url: '/update',
                title: '单据模板修改',
                templateUrl: helper.basepath('tpl/receipts_update.html')
            })
            .state('app.tpl_receipts.view', {
                url: '/view/:id',
                title: '单据模板查看',
                templateUrl: helper.basepath('tpl/receipts_view.html')
            })
            // add by Boqian  end
            // add by Boqian  begin
            .state('app.tpl_contract', {
                url: '/tpl/contract',
                title: "合同模板",
                templateUrl: helper.basepath('tpl/contract.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "tplContractJs", 'ngWig')
            })
            .state('app.tpl_contract.add', {
                url: '/add',
                title: '合同模板添加',
                templateUrl: helper.basepath('tpl/contract_add.html')
            })
            .state('app.tpl_contract.update', {
                url: '/update',
                title: '合同模板修改',
                templateUrl: helper.basepath('tpl/contract_update.html')
            })
            .state('app.tpl_contract.view', {
                url: '/view/:id',
                title: '合同模板查看',
                templateUrl: helper.basepath('tpl/contract_view.html')
            })
            // add by Boqian  end
            // add by Boqian  begin
            .state('app.tpl_aeration', {
                url: '/tpl/aeration',
                title: "通风方案",
                templateUrl: helper.basepath('tpl/aeration.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "tplAerationJs", 'ngWig')
            })
            .state('app.tpl_aeration.add', {
                url: '/add',
                title: '通风方案添加',
                templateUrl: helper.basepath('tpl/aeration_add.html')
            })
            .state('app.tpl_aeration.update', {
                url: '/update',
                title: '通风方案修改',
                templateUrl: helper.basepath('tpl/aeration_update.html')
            })
            .state('app.tpl_aeration.view', {
                url: '/view/:id',
                title: '通风方案查看',
                templateUrl: helper.basepath('tpl/aeration_view.html')
            })
            .state('app.tpl_aeration_cfg', {
                url: '/tpl/aerationcfg/:id',
                title: '通风方案配置',
                templateUrl: helper.basepath('tpl/aeration_config.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "tplAerationconfigJs", 'ngWig')
            })
            .state('app.tpl_aeration_cfg.add', {
                url: '/add',
                title: '通风方案配置添加',
                templateUrl: helper.basepath('tpl/aeration_config_add.html')
            })
            // add by Boqian  end
            // add by Boqian  begin
            .state('app.tpl_aircondition', {
                url: '/tpl/aircondition',
                title: "气调方案",
                templateUrl: helper.basepath('tpl/aircondition.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "tplAirconditionJs", 'ngWig')
            })
            .state('app.tpl_aircondition.add', {
                url: '/add',
                title: '气调方案添加',
                templateUrl: helper.basepath('tpl/aircondition_add.html')
            })
            .state('app.tpl_aircondition.update', {
                url: '/update',
                title: '气调方案修改',
                templateUrl: helper.basepath('tpl/aircondition_update.html')
            })
            .state('app.tpl_aircondition.view', {
                url: '/view/:id',
                title: '气调方案查看',
                templateUrl: helper.basepath('tpl/aircondition_view.html')
            })
            .state('app.tpl_aircondition_cfg', {
                url: '/tpl/airconditioncfg/:id',
                title: '气调方案配置',
                templateUrl: helper.basepath('tpl/aircondition_config.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "tplAirconditionconfigJs", 'ngWig')
            })
            .state('app.tpl_aircondition_cfg.add', {
                url: '/add',
                title: '气调方案配置添加',
                templateUrl: helper.basepath('tpl/aircondition_config_add.html')
            })
            // add by Boqian  end
            // add by Boqian  begin
            .state('app.tpl_fumigation', {
                url: '/tpl/fumigation',
                title: "熏蒸方案",
                templateUrl: helper.basepath('tpl/fumigation.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "tplFumigationJs", 'ngWig')
            })
            .state('app.tpl_fumigation.add', {
                url: '/add',
                title: '熏蒸方案添加',
                templateUrl: helper.basepath('tpl/fumigation_add.html')
            })
            .state('app.tpl_fumigation.update', {
                url: '/update',
                title: '熏蒸方案修改',
                templateUrl: helper.basepath('tpl/fumigation_update.html')
            })
            .state('app.tpl_fumigation.view', {
                url: '/view/:id',
                title: '熏蒸方案查看',
                templateUrl: helper.basepath('tpl/fumigation_view.html')
            })
            .state('app.tpl_fumigation_cfg', {
                url: '/tpl/fumigationcfg/:id',
                title: '熏蒸方案配置',
                templateUrl: helper.basepath('tpl/fumigation_config.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "tplFumigationconfigJs", 'ngWig')
            })
            .state('app.tpl_fumigation_cfg.add', {
                url: '/add',
                title: '熏蒸方案配置添加',
                templateUrl: helper.basepath('tpl/fumigation_config_add.html')
            })
            // add by Boqian  end
            // add by Boqian  begin
            .state('app.buss_plan', {
                url: '/buss/plan',
                title: "计划管理",
                templateUrl: helper.basepath('buss/plan.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "bussPlanJs", 'ngWig', "dateTimePicker")
            })
            .state('app.buss_plan.add', {
                url: '/add',
                title: '计划管理添加',
                templateUrl: helper.basepath('buss/plan_add.html')
            })
            .state('app.buss_plan.update', {
                url: '/update',
                title: '计划管理修改',
                templateUrl: helper.basepath('buss/plan_update.html')
            })
            .state('app.buss_plan.change', {
                url: '/change',
                title: '计划管理修改状态',
                templateUrl: helper.basepath('buss/plan_change.html')
            })
            .state('app.buss_plan.view', {
                url: '/view/:id',
                title: '计划管理查看',
                templateUrl: helper.basepath('buss/plan_view.html')
            })
            // add by Boqian  end
            // add by Boqian  begin
            .state('app.buss_contract', {
                url: '/buss/contract',
                title: "合同管理",
                templateUrl: helper.basepath('buss/contract.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "bussContractJs", 'ngWig', "dateTimePicker")
            })
            .state('app.buss_contract.add', {
                url: '/add',
                title: '合同管理添加',
                templateUrl: helper.basepath('buss/contract_add.html')
            })
            .state('app.buss_contract.update', {
                url: '/update',
                title: '合同管理修改',
                templateUrl: helper.basepath('buss/contract_update.html')
            })
            .state('app.buss_contract.change', {
                url: '/change',
                title: '合同管理修改状态',
                templateUrl: helper.basepath('buss/contract_change.html')
            })
            .state('app.buss_contract.view', {
                url: '/view/:id',
                title: '合同管理查看',
                templateUrl: helper.basepath('buss/contract_view.html')
            })
            // add by Boqian  end
            // add by Boqian  begin
            .state('app.rsgain_plan', {
                url: '/buss/rsplan',
                title: "储备粮计划管理",
                templateUrl: helper.basepath('buss/rsplan.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "bussRsplanJs", 'ngWig', "dateTimePicker")
            })
            .state('app.rsgain_plan.add', {
                url: '/add',
                title: '储备粮计划管理添加',
                templateUrl: helper.basepath('buss/rsplan_add.html')
            })
            .state('app.rsgain_plan.update', {
                url: '/update',
                title: '储备粮计划管理修改',
                templateUrl: helper.basepath('buss/rsplan_update.html')
            })
            .state('app.rsgain_plan.change', {
                url: '/change',
                title: '储备粮计划管理修改状态',
                templateUrl: helper.basepath('buss/rsplan_change.html')
            })
            .state('app.rsgain_plan.view', {
                url: '/view/:id',
                title: '储备粮计划管理查看',
                templateUrl: helper.basepath('buss/rsplan_view.html')
            })
            // add by Boqian  end
            // add by Boqian  begin
            .state('app.buss_attach', {
                url: '/buss/attach/:type/:code',
                title: '上传附件',
                templateUrl: helper.basepath('buss/attach.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "bussAttachJs", 'ngWig')
            })
            .state('app.buss_attach.add', {
                url: '/add',
                title: '添加附件',
                templateUrl: helper.basepath('buss/attach_add.html'),
                resolve: helper.resolveFor('angularFileUpload', 'filestyle')
            })
            .state('app.buss_attach.update', {
                url: '/update',
                title: '修改附件',
                templateUrl: helper.basepath('buss/attach_update.html'),
                resolve: helper.resolveFor('angularFileUpload', 'filestyle')
            })
            .state('app.buss_attach.view', {
                url: '/view/:id',
                title: '查看附件',
                templateUrl: helper.basepath('buss/attach_view.html')
            })
            // add by Boqian  end
            // add by Boqian  begin
            .state('app.buss_approval', {
                url: '/buss/approval/:type/:code',
                title: '审批流程',
                templateUrl: helper.basepath('buss/approval.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "bussApprovalJs", 'ngWig')
            })
            .state('app.buss_approval.update', {
                url: '/update/:id',
                title: '审批操作',
                templateUrl: helper.basepath('buss/approval_update.html')
            })
            .state('app.buss_approval.view', {
                url: '/view/:id',
                title: '查看审批',
                templateUrl: helper.basepath('buss/approval_view.html')
            })
            // add by Boqian  end
            //粮情检测 begin
            .state('grain', {
                url: '/grain',
                abstract: true,
                templateUrl: helper.basepath('public.html'),
                controller: 'AppController',
                resolve: helper.resolveFor('modernizr', 'jqDock', 'screenfull', 'icons')
            })
            .state('grain.index', {
                url: '/index',
                title: '粮情检测首页',
                templateUrl: helper.basepath('grain/index.html'),
                resolve: helper.resolveFor('echartsjs', 'datatables', "ngDialog", 'grainJs', 'ngWig', "dateTimePicker")
            })
            .state('grain.realtime', {
                url: '/realtime',
                title: '粮情实时信息',
                templateUrl: helper.basepath('grain/grain_realtime.html'),
                resolve: helper.resolveFor('echartsjs', 'datatables', "ngDialog", 'grainRealTimeJs', 'ngWig')
            })
            .state('grain.device', {
                url: '/device',
                title: '粮情设备',
                templateUrl: helper.basepath('grain/grain_device.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'grainDeviceJs')
            })
            .state('grain.standards', {
                url: '/standards',
                title: '粮情标准',
                templateUrl: helper.basepath('grain/grain_standards.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'grainStandardsJs')
            })
            .state('grain.history', {
                url: '/history',
                title: '粮情历史信息',
                templateUrl: helper.basepath('grain/grain_history.html'),
                resolve: helper.resolveFor('echartsjs', 'datatables', "ngDialog", 'grainHistoryJs', 'ngWig')
            })
            .state('grain.inspection_temp', {
                url: '/inspection_temp/:code/:name',
                title: '实时温度检测',
                templateUrl: helper.basepath('grain/inspection_temp.html'),
                resolve: helper.resolveFor('inspectionTempJs')
            })
            .state('grain.inspection_humrity', {
                url: '/inspection_humrity/:code/:name',
                title: '实时湿度检测',
                templateUrl: helper.basepath('grain/inspection_humrity.html'),
                resolve: helper.resolveFor('inspectionHumrityJs')
            })
            .state('grain.inspection_gas', {
                url: '/inspection_gas/:code/:name',
                title: '实时气体浓度检测',
                templateUrl: helper.basepath('grain/inspection_gas.html'),
                resolve: helper.resolveFor('inspectionGasJs')
            })
            .state('grain.inspection_pest', {
                url: '/inspection_pest/:code/:name',
                title: '实时虫害检测',
                templateUrl: helper.basepath('grain/inspection_pest.html'),
                resolve: helper.resolveFor('inspectionPestJs')
            })
            .state('grain.inspection_all', {
                url: '/inspection_all/:code/:name',
                title: '一键检测',
                templateUrl: helper.basepath('grain/inspection_all.html'),
                resolve: helper.resolveFor('inspectionAllJs')
            })
            .state('grain.temp_view', {
                url: '/temp_view/:id/:name/:time/:housecode/:backurl',
                title: '温度检测详情',
                templateUrl: helper.basepath('grain/temp_view.html'),
                resolve: helper.resolveFor('datatables','echarts-gljs', 'tempView', 'ngWig','lodopFuncsJs','clodopFuncsJs')
            })
            .state('grain.humrity_view', {
                url: '/humrity_view/:id/:name/:time/:backurl',
                title: '湿度检测详情',
                templateUrl: helper.basepath('grain/humrity_view.html'),
                resolve: helper.resolveFor('echartsjs', 'datatables', 'humrityView', 'ngWig')
            })
            .state('grain.gas_view', {
                url: '/gas_view/:id/:name/:time/:backurl',
                title: '气体浓度检测详情',
                templateUrl: helper.basepath('grain/gas_view.html'),
                resolve: helper.resolveFor('echartsjs', 'datatables', 'gasView', 'ngWig')
            })
            .state('grain.pest_view', {
                url: '/pest_view/:id/:name/:time/:housecode/:backurl',
                title: '虫害检测详情',
                templateUrl: helper.basepath('grain/pest_view.html'),
                resolve: helper.resolveFor('echartsjs', 'datatables', 'pestView', 'ngWig')
            })
            .state('grain.grain_view', {
                url: '/grain_view/:id/:name/:time',
                title: '粮情检测详情',
                templateUrl: helper.basepath('grain/grain_view.html'),
                resolve: helper.resolveFor('grainView')
            })
            //智能通风 begin
            .state('aerate', {
                url: '/aerate',
                abstract: true,
                templateUrl: helper.basepath('public.html'),
                controller: 'AppController',
                resolve: helper.resolveFor('modernizr', 'jqDock', 'screenfull', 'icons')
            })
            .state('aerate.index', {
                url: '/index',
                title: '智能通风首页',
                templateUrl: helper.basepath('aerate/index.html'),
                resolve: helper.resolveFor('echartsjs', 'datatables', "ngDialog", 'aerateJs', 'ngWig', 'layerJs', "dateTimePicker")
            })
            .state('aerate.history', {
                url: '/history',
                title: '通风历史',
                templateUrl: helper.basepath('aerate/aerate_history.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'aerateHistoryJs', "dateTimePicker")
            })
            .state('aerate.aerate_view', {
                url: '/aerate_view/:id/:name/:time',
                title: '通风详情',
                templateUrl: helper.basepath('aerate/aerate_view.html'),
                resolve: helper.resolveFor('aerateViewJs')
            })
            .state('aerate.device', {
                url: '/device',
                title: '通风设备',
                templateUrl: helper.basepath('aerate/aerate_device.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'aerateDeviceJs')
            })

            .state('aerate.case', {
                url: '/case/:code/:name',
                title: '通风方案',
                templateUrl: helper.basepath('aerate/aerate_case.html'),
                resolve: helper.resolveFor('aerateCaseJs', "ngDialog")
            })
            //智能气调 begin
            .state('aircond', {
                url: '/aircond',
                abstract: true,
                templateUrl: helper.basepath('public.html'),
                controller: 'AppController',
                resolve: helper.resolveFor('modernizr', 'jqDock', 'screenfull', 'icons')
            })
            .state('aircond.index', {
                url: '/index',
                title: '智能气调首页',
                templateUrl: helper.basepath('aircond/index.html'),
                resolve: helper.resolveFor('echartsjs', 'datatables', "ngDialog", 'aircondJs', 'ngWig')
            })
            .state('aircond.history', {
                url: '/history',
                title: '气调历史',
                templateUrl: helper.basepath('aircond/aircond_history.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'aircondHistoryJs')
            })
            .state('aircond.device', {
                url: '/device',
                title: '气调设备',
                templateUrl: helper.basepath('aircond/aircond_device.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'aircondDeviceJs')
            })
            .state('aircond.aircond_view', {
                url: '/aircond_view/:id/:name/:time',
                title: '气调详情',
                templateUrl: helper.basepath('aircond/aircond_view.html'),
                resolve: helper.resolveFor('aircondViewJs')
            })
            .state('aircond.case', {
                url: '/case/:code/:name',
                title: '气调方案',
                templateUrl: helper.basepath('aircond/aircond_case.html'),
                resolve: helper.resolveFor('aircondCaseJs', "ngDialog")
            })
            //智能熏蒸 begin
            .state('fum', {
                url: '/fum',
                abstract: true,
                templateUrl: helper.basepath('public.html'),
                controller: 'AppController',
                resolve: helper.resolveFor('modernizr', 'jqDock', 'screenfull', 'icons')
            })
            .state('fum.index', {
                url: '/index',
                title: '智能熏蒸首页',
                templateUrl: helper.basepath('fum/index.html'),
                resolve: helper.resolveFor('echartsjs', 'datatables', "ngDialog", 'fumJs', 'ngWig', "dateTimePicker")
            })
            .state('fum.index.add', {
                url: '/add/:id/:idb',
                title: '熏蒸记录添加',
                templateUrl: helper.basepath('fum/fum_add.html')
            })
            .state('fum.history', {
                url: '/history',
                title: '熏蒸历史',
                templateUrl: helper.basepath('fum/fum_history.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'fumHistoryJs')
            })
            .state('fum.device', {
                url: '/device',
                title: '熏蒸设备',
                templateUrl: helper.basepath('fum/fum_device.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'fumDeviceJs')
            })
            .state('fum.fum_view', {
                url: '/fum_view/:id/:name/:time',
                title: '熏蒸详情',
                templateUrl: helper.basepath('fum/fum_view.html'),
                resolve: helper.resolveFor('fumViewJs')
            })
            .state('fum.case', {
                url: '/case/:code/:name',
                title: '熏蒸方案',
                templateUrl: helper.basepath('fum/fum_case.html'),
                resolve: helper.resolveFor('fumCaseJs', "ngDialog")
            })

            //*******************************智能出入库配置  by Chengzi  begin
            .state('outin', {
                url: '/outin',
                abstract: true,
                templateUrl: helper.basepath('app.html'),
                controller: 'AppController',
                resolve: helper.resolveFor('modernizr', 'jqDock', 'screenfull', 'icons')
            })
            .state('outin.index', {
                url: '/index',
                title: '智能出入库首页',
                templateUrl: helper.basepath('outin/index.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'OutinJs', 'ngWig','clodopFuncsJs','lodopFuncsJs')
                // OutinJs  的引用在 下面  1717 行
                // datatables 用来布局表格列表显示
            })
            .state('outin.cardregistration', {
                url: '/cardregistration',
                title: '领卡登记',
                templateUrl: helper.basepath('outin/cardregistration.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'CardregJs', 'ngWig')
            })

            .state('outin.sampling', {
                url: '/sampling',
                title: '入库扦样',
                templateUrl: helper.basepath('outin/sampling.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'outinSamplingJs', 'ngWig')
            })

            .state('outin.qualitytesting', {
                url: '/qualitytesting',
                title: '质量检验',
                templateUrl: helper.basepath('outin/qualitytesting.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'QualitytestingJs', 'ngWig')
            })
            .state('outin.grossweight', {
                url: '/grossweight',
                title: '毛重检斤',
                templateUrl: helper.basepath('outin/grossweight.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'GrossWeightJs', 'ngWig')
            })
            .state('outin.store', {
                url: '/store',
                title: '值仓入库',
                templateUrl: helper.basepath('outin/store.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'StoreJs', 'ngWig')

            })
            .state('outin.tareweight', {
                url: '/tareweight',
                title: '回皮检斤',
                templateUrl: helper.basepath('outin/tareweight.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'TareWeightJs', 'ngWig')
            })
            .state('outin.settlement', {
                url: '/settlement',
                title: '业务结算',
                templateUrl: helper.basepath('outin/settlement.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'SettlementJs', 'ngWig')
            })
            .state('outin.xiaoka_chuku', {
                url: '/xiaoka_chuku',
                title: '销卡出库',
                templateUrl: helper.basepath('outin/xiaoka_chuku.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'ChukuJs', 'ngWig')

            })
            .state('out_in', {
                url: '/outin',
                abstract: true,
                templateUrl: helper.basepath('app.html'),
                controller: 'AppController',
                resolve: helper.resolveFor('modernizr', 'jqDock', 'screenfull', 'icons')
            })
            .state('out_in.in_detailed', {
                url: '/in_detailed',
                title: '入库记录',
                templateUrl: helper.basepath('outin/in_detailed.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'InDetailedJs', 'ngWig', "dateTimePicker")
            })
            .state('out_in.in_detailed.detail', {
                url: '/detail/:busno',
                title: '入库记录详情',
                templateUrl: helper.basepath('outin/outin_detail.html'),
            })
            .state('out_in.out_detailed', {
                url: '/out_detailed',
                title: '出库记录',
                templateUrl: helper.basepath('outin/out_detailed.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'OutDetailedJs', 'ngWig', "dateTimePicker")
            })
            .state('out_in.out_detailed.detail', {
                url: '/detail/:busno',
                title: '出库记录详情',
                templateUrl: helper.basepath('outin/outin_detail.html'),
            })

            .state('out_in.quality', {
                url: '/quality',
                title: '出入库质检',
                templateUrl: helper.basepath('outin/quality.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'QualityJs', 'ngWig', "dateTimePicker")
            })
            .state('out_in.quality_detail', {
                url: '/qualityDetail/:qualityno',
                title: '质检详情',
                templateUrl: helper.basepath('outin/qualitydetail.html')
            })
            .state('outin.state', {
                url: '/state',
                title: '出入库状态',
                templateUrl: helper.basepath('outin/state.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'StateJs', 'ngWig')
            })
            .state('out_in.weight', {
                url: '/weight',
                title: '出入库称重',
                templateUrl: helper.basepath('outin/weight.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'WeightJs', 'ngWig', "dateTimePicker")
            })
            .state('out_in.weight_detail', {
                url: '/weightDetail/:busno',
                title: '出入库称重详情',
                templateUrl: helper.basepath('outin/weightDetail.html'),
            })
            .state('out_in.carrier', {
                url: '/carrier',
                title: '出入库承运人',
                templateUrl: helper.basepath('outin/carrier.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'CarrierJs', 'ngWig', "dateTimePicker")
            })
            .state('out_in.carrier_detail', {
                url: '/carrierDetail/:id',
                title: '出入库承运人详情',
                templateUrl: helper.basepath('outin/carrierDetail.html'),
            })
            .state('out_in.vehicle', {
                url: '/vehicle',
                title: '出入库车船',
                templateUrl: helper.basepath('outin/vehicle.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'VehicleJs', 'ngWig', "dateTimePicker")
            })
            .state('out_in.blacklist_carrier', {
                url: '/blacklist_carrier',
                title: '承运人黑名单',
                templateUrl: helper.basepath('outin/blacklist_carrier.html')
            })
            .state('outin.blacklist_vehicle', {
                url: '/blacklist_vehicle/:id/:vehicleno',
                title: '车船黑名单',
                templateUrl: helper.basepath('outin/blacklist_vehicle.html')
            })
            .state('out_in.qualityresult', {
                url: '/qualityresult',
                title: '质检结果',
                templateUrl: helper.basepath('outin/qualitydetail.html')
            })
            .state('out_in.chart', {
                url: '/chart',
                title: '出入库统计',
                templateUrl: helper.basepath('outin/chart.html'),
                resolve: helper.resolveFor('chartjs')
            })

            //*******************************智能出入库配置   by Chengzi   end
            //*******************************远程监管   by Chengzi   begin
            .state('remote', {
                url: '/remote',
                abstract: true,
                templateUrl: helper.basepath('app.html'),
                controller: 'AppController',
                resolve: helper.resolveFor('modernizr', 'jqDock', 'screenfull', 'icons')
            })
            .state('remote.index', {
                url: '/index',
                title: '远程监管首页',
                templateUrl: helper.basepath('remote/index.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'RemoteJs', 'ngWig')
            })
            .state('remote.commandlist', {
                url: '/commandlist',
                title: '命令列表',
                templateUrl: helper.basepath('remote/index.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'RemoteJs', 'ngWig')
            })
            .state('remote.edit', {
                url: '/edit/:commandName',
                title: '命令内容编辑',
                templateUrl: helper.basepath('remote/edit.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'RemoteEditJs', 'ngWig')
            })

            .state('remote.logList', {
                url: '/logList',
                title: '操作日志',
                templateUrl: helper.basepath('remote/logList.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'LogListJs', 'ngWig')

            })
            .state('remote.commandLogList', {
                url: '/commandLogList',
                title: '上传日志',
                templateUrl: helper.basepath('remote/commandLogList.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'CommandLogList', 'ngWig')
            })
            //*******************************远程监管   by Chengzi   end
            //*******************************智能安防   by Chengzi   end
            .state('camera', {
                url: '/camera',
                abstract: true,
                templateUrl: helper.basepath('app.html'),
                controller: 'AppController',
                resolve: helper.resolveFor('modernizr', 'jqDock', 'screenfull', 'icons')
            })
            .state('camera.index', {
                url: '/index',
                title: '智能安防首页',
                // templateUrl: helper.basepath('camera/index.html'),
                // resolve: helper.resolveFor('datatables',"ngDialog",'CameraJs','ngWig')
                templateUrl: helper.basepath('camera/videomonitoring.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'webVideoCtrlJS','bsdWebVideoCtrlJS', 'ngWig')
            })
            .state('camera.videomonitoring', {
                url: '/videomonitoring',
                title: '视频监控',
                templateUrl: helper.basepath('camera/videomonitoring.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'MonitoringJs','webVideoCtrlJS','bsdWebVideoCtrlJS',  'ngWig')
            })
            .state('camera.cangnei', {
                url: '/cangnei',
                title: '仓内监控',
                templateUrl: helper.basepath('camera/cangnei.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'CangneiJs', 'webVideoCtrlJS','bsdWebVideoCtrlJS',  'ngWig')
            })
            .state('camera.cameralist', {
                url: '/cameralist',
                title: '摄像机管理',
                templateUrl: helper.basepath('camera/cameraList.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'CameraListJs', 'ngWig')

            })
            .state('camera.cameramanage', {
                url: '/cameramanage/:id',
                title: '摄像机编辑',
                templateUrl: helper.basepath('camera/cameramanage.html')
            })
            .state('camera.camera_add', {
                url: '/cameraAdd',
                title: '摄像机编辑',
                templateUrl: helper.basepath('camera/camera_add.html')
            })
            .state('camera.camera_view', {
                url: '/cameraView/:id',
                title: '摄像机编辑',
                templateUrl: helper.basepath('camera/camera_view.html')
            })
            .state('camera.vediolist', {
                url: '/vediolist',
                title: '硬盘录像机管理',
                templateUrl: helper.basepath('camera/vedioList.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'VedioListJs', 'ngWig')
            })
            .state('camera.vedioAdd', {
                url: '/vedio/add',
                title: '硬盘录像机添加',
                templateUrl: helper.basepath('camera/vedio_add.html')
            })
            .state('camera.vediomanage', {
                url: '/dvr/update/:id',
                title: '硬盘录像机编辑',
                templateUrl: helper.basepath('camera/vedio_update.html')
            })
            .state('camera.dvrView', {
                url: '/dvr/view/:id',
                title: '硬盘录像机详情',
                templateUrl: helper.basepath('camera/vedio_view.html')
            })
            .state('camera.warning', {
                url: '/warning',
                title: '监控报警',
                templateUrl: helper.basepath('camera/warning.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'WarningJs', 'ngWig')
            })
            .state('camera.warning_detail', {
                url: '/warning_detail/:id',
                title: '监控报警详情',
                templateUrl: helper.basepath('camera/camera_warning_detail.html')
            })
            .state('camera.images_list', {
                url: '/images_list',
                title: '拍照上传',
                templateUrl: helper.basepath('camera/imagesList.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'ImagesListJs', 'ngWig')
            })
            .state('camera.images_detail', {
                url: '/images_detail/:id',
                title: '拍照上传详情',
                templateUrl: helper.basepath('camera/images_detail.html')
            })
            .state('camera.user', {
                url: '/user',
                title: 'User',
                templateUrl: helper.basepath('camera/user.html')
            })
            //*******************************智能安防   by Chengzi   end

            //Ccw 18-01-23 控制器管理----begin
            //控制器二级菜单
            .state('app.factory', {
                url: '/factory',
                title: '厂家管理',
                templateUrl: helper.basepath('contro/factory.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "factoryJs", 'ngWig')
            })
            .state('app.factory.view', {
                url: '/view/:id',
                title: '厂家详情查看',
                templateUrl: helper.basepath('contro/factory_view.html')
            })
            .state('app.factory.add', {
                url: '/add',
                title: '添加厂家',
                templateUrl: helper.basepath('contro/factory_add.html')
            })
            .state('app.factory.update', {
                url: '/update',
                title: '修改厂家',
                templateUrl: helper.basepath('contro/factory_update.html')
            })

            //控制器二级菜单
            .state('app.controinfo', {
                url: '/controinfo',
                title: '控制器管理',
                templateUrl: helper.basepath('contro/controinfo.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "controInfoJs", 'ngWig')
            })
            .state('app.controinfo.view', {
                url: '/view/:id',
                title: '控制器详情查看',
                templateUrl: helper.basepath('contro/controinfo_view.html')
            })
            .state('app.controinfo.add', {
                url: '/add',
                title: '添加控制器',
                templateUrl: helper.basepath('contro/controinfo_add.html')
            })
            .state('app.controinfo.update', {
                url: '/update',
                title: '修改控制器',
                templateUrl: helper.basepath('contro/controinfo_update.html')
            })


            //控制器二级菜单
            .state('app.firm_command', {
                url: '/firm_command',
                title: '控制器命令管理',
                templateUrl: helper.basepath('contro/command.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "firmCommandJs", 'ngWig')
            })
            .state('app.firm_command.view', {
                url: '/view/:id',
                title: '控制器命令详情查看',
                templateUrl: helper.basepath('contro/command_view.html')
            })
            .state('app.firm_command.add', {
                url: '/add',
                title: '添加控制器命令',
                templateUrl: helper.basepath('contro/command_add.html')
            })
            .state('app.firm_command.update', {
                url: '/update',
                title: '修改控制器命令',
                templateUrl: helper.basepath('contro/command_update.html')
            })


            .state('app.contro_relay', {
                url: '/contro_relay',
                title: '控制器命令管理',
                templateUrl: helper.basepath('contro/relay.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "relayJs", 'ngWig')
            })
            .state('app.contro_relay.view', {
                url: '/view/:id',
                title: '控制器命令详情查看',
                templateUrl: helper.basepath('contro/relay_view.html')
            })
            .state('app.contro_relay.add', {
                url: '/add',
                title: '添加控制器命令',
                templateUrl: helper.basepath('contro/relay_add.html')
            })
            .state('app.contro_relay.update', {
                url: '/update',
                title: '修改控制器命令',
                templateUrl: helper.basepath('contro/relay_update.html')
            })


            .state('app.store_control', {
                url: '/store_control',
                title: '控制器命令管理',
                templateUrl: helper.basepath('contro/storeControl.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "storeControlJs", 'ngWig')
            })
            .state('app.store_control.view', {
                url: '/view/:id',
                title: '控制器命令详情查看',
                templateUrl: helper.basepath('contro/storeControl_view.html')
            })
            .state('app.store_control.add', {
                url: '/add',
                title: '添加控制器命令',
                templateUrl: helper.basepath('contro/storeControl_add.html')
            })
            .state('app.store_control.update', {
                url: '/update',
                title: '修改控制器命令',
                templateUrl: helper.basepath('contro/storeControl_update.html')
            })
            //控制器管理----end

            //设备管理
            .state('app.switch', {
                url: '/la/switch',
                title: "设备管理",
                templateUrl: helper.basepath('la/switch.html'),
                resolve: helper.resolveFor('datatables', "angularBootstrapNavTree", "ngDialog", "switchJs", 'ngWig')
                // bussinfoJs  的引用在 下面  1666行
            })
            //------专家决策------start
            .state('zjjc', {
                url: '/zjjc',
                abstract: true,
                templateUrl: helper.basepath('app.html'),
                controller: 'AppController',
                resolve: helper.resolveFor('modernizr', 'jqDock', 'screenfull', 'icons')
            })
            .state('zjjc.index', {
                url: '/index',
                title: '专家决策首页',
                // templateUrl: helper.basepath('camera/index.html'),
                // resolve: helper.resolveFor('datatables',"ngDialog",'CameraJs','ngWig')
                templateUrl: helper.basepath('zjjc/index.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'zjjcindexJs', 'ngWig')
            })
            .state('zjjc.aeration', {
                url: '/aeration',
                title: '智能通风',
                // templateUrl: helper.basepath('camera/index.html'),
                // resolve: helper.resolveFor('datatables',"ngDialog",'CameraJs','ngWig')
                templateUrl: helper.basepath('zjjc/index.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'zjjcindexJs', 'ngWig')
            })
            .state('zjjc.aeration.view', {
                url: '/view',
                title: '智能通风查看',
                templateUrl: helper.basepath('zjjc/zjjcindex_view.html')
            })
            .state('zjjc.GrainData', {
                url: '/GrainData',
                title: '粮情数据展示',
                // templateUrl: helper.basepath('camera/index.html'),
                // resolve: helper.resolveFor('datatables',"ngDialog",'CameraJs','ngWig')
                templateUrl: helper.basepath('zjjc/GrainData.html'),
                resolve: helper.resolveFor('echartsjs', 'datatables', "ngDialog", 'GrainDataJs', 'ngWig')
            })
            .state('zjjc.GrainData.view', {
                url: '/view/:id/:name',
                title: '粮情数据详情',
                templateUrl: helper.basepath('zjjc/GrainData_view.html')
            })
            .state('zjjc.Fumigation', {
                url: '/Fumigation',
                title: '智能熏蒸',
                // templateUrl: helper.basepath('camera/index.html'),
                // resolve: helper.resolveFor('datatables',"ngDialog",'CameraJs','ngWig')
                templateUrl: helper.basepath('zjjc/Fumigation.html'),
                resolve: helper.resolveFor('echartsjs', 'datatables', "ngDialog", 'FumigationJs', 'ngWig')
            })
            .state('zjjc.Fumigation.view', {
                url: '/view/:id/:name',
                title: '熏蒸数据详情',
                templateUrl: helper.basepath('zjjc/Fumigation_view.html')
            })
            .state('zjjc.GrainTrend', {
                url: '/GrainTrend',
                title: '粮温分析',
                // templateUrl: helper.basepath('camera/index.html'),
                // resolve: helper.resolveFor('datatables',"ngDialog",'CameraJs','ngWig')
                templateUrl: helper.basepath('zjjc/GrainTrend.html'),
                resolve: helper.resolveFor('echartsjs', 'datatables', "ngDialog", 'GrainTrendJs', 'ngWig')
            })
            .state('zjjc.GrainDifference', {
                url: '/GrainDifference',
                title: '粮温差值分析',
                // templateUrl: helper.basepath('camera/index.html'),
                // resolve: helper.resolveFor('datatables',"ngDialog",'CameraJs','ngWig')
                templateUrl: helper.basepath('zjjc/GrainDifference.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'GrainDifferenceJs', 'ngWig')
            })
            .state('zjjc.SingleStorehouse', {
                url: '/SingleStorehouse',
                title: '决策分析',
                // templateUrl: helper.basepath('camera/index.html'),
                // resolve: helper.resolveFor('datatables',"ngDialog",'CameraJs','ngWig')
                templateUrl: helper.basepath('zjjc/SingleStorehouse.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'SingleStorehouseJs', 'ngWig')
            })
            .state('zjjc.warehousing', {
                url: '/warehousing',
                title: '出入库统计',
                // templateUrl: helper.basepath('camera/index.html'),
                // resolve: helper.resolveFor('datatables',"ngDialog",'CameraJs','ngWig')
                templateUrl: helper.basepath('zjjc/warehousing.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'warehousingJs', 'ngWig')
            })
            .state('zjjc.Qualityb', {
                url: '/Qualityb',
                title: '质量统计',
                // templateUrl: helper.basepath('camera/index.html'),
                // resolve: helper.resolveFor('datatables',"ngDialog",'CameraJs','ngWig')
                templateUrl: helper.basepath('zjjc/Qualityb.html'),
                resolve: helper.resolveFor('echartsjs', 'datatables', "ngDialog", 'QualitybJs', 'ngWig')
            })
            //------专家决策------end
            //------能耗监测------
            .state('nhjc', {
                url: '/nhjc',
                abstract: true,
                templateUrl: helper.basepath('public.html'),
                controller: 'AppController',
                resolve: helper.resolveFor('modernizr', 'jqDock', 'screenfull', 'icons')
            })
            .state('nhjc.index', {
                url: '/index',
                title: '能耗监测首页',
                templateUrl: helper.basepath('nhjc/index.html'),
                resolve: helper.resolveFor('datatables', "ngDialog", 'nhjcJs', 'ngWig', "dateTimePicker")
            })
            .state('nhjc.index.view', {
                url: '/view/:id',
                title: '能耗监测详情',
                templateUrl: helper.basepath('nhjc/nhjc_view.html')
            })
            //------能耗监测------end
            //------油脂测控------
            .state('Oilmonitor', {
                url: '/Oilmonitor',
                abstract: true,
                templateUrl: helper.basepath('public.html'),
                controller: 'AppController',
                resolve: helper.resolveFor('modernizr', 'jqDock', 'screenfull', 'icons')
            })
            .state('Oilmonitor.index', {
                url: '/index',
                title: '油脂测控首页',
                templateUrl: helper.basepath('Oilmonitor/index.html'),
                resolve: helper.resolveFor('echartsjs', 'datatables', "ngDialog", 'OilmonitorJs', 'ngWig')
            })
            .state('Oilmonitor.index.view', {
                url: '/view/:id',
                title: '油脂测控详情',
                templateUrl: helper.basepath('Oilmonitor/Oilmonitor_view.html')
            })
        //------油脂测控------end
    }]).config(['$ocLazyLoadProvider', 'APP_REQUIRES', function ($ocLazyLoadProvider, APP_REQUIRES) {
    'use strict';
    // 延迟加载设置
    $ocLazyLoadProvider.config({
        debug: false,
        events: true,
        modules: APP_REQUIRES.modules
    });
}]).config(['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
    function ($controllerProvider, $compileProvider, $filterProvider, $provide) {
        'use strict';
        // 引导注册组件
        App.controller = $controllerProvider.register;
        App.directive = $compileProvider.directive;
        App.filter = $filterProvider.register;
        App.factory = $provide.factory;
        App.service = $provide.service;
        App.constant = $provide.constant;
        App.value = $provide.value;
    }]).config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        prefix: 'app/i18n/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('ch');
    $translateProvider.useLocalStorage();
    $translateProvider.usePostCompiling(true);

}]).config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.latencyThreshold = 500;
    cfpLoadingBarProvider.parentSelector = '.wrapper > section';
}]).config(['$tooltipProvider', function ($tooltipProvider) {
    $tooltipProvider.options({appendToBody: true});
}]);
/******************************** 应用地址及配置（angularJs的路由功能实现） end ***************************************/


/******************************** 设置应用程序的常量begin *************************************************************/
App.constant('APP_COLORS', {
    'primary': '#5d9cec',
    'success': '#27c24c',
    'info': '#23b7e5',
    'warning': '#ff902b',
    'danger': '#f05050',
    'inverse': '#131e26',
    'green': '#37bc9b',
    'pink': '#f532e5',
    'purple': '#7266ba',
    'dark': '#3a3f51',
    'yellow': '#fad732',
    'gray-darker': '#232735',
    'gray-dark': '#3a3f51',
    'gray': '#dde6e9',
    'gray-light': '#e4eaec',
    'gray-lighter': '#edf1f2'
})
    .constant('APP_MEDIAQUERY', {
        'desktopLG': 1200,
        'desktop': 992,
        'tablet': 768,
        'mobile': 480
    })
    .constant('APP_REQUIRES', {
        // 加载独立的js脚本
        scripts: {
            'modernizr': ['vendor/modernizr/modernizr.js'],
            'maxNavigation': ['vendor/jquery-max-navigation/js/interface.js'],
            'jqDock': ['vendor/jquery-max-navigation/js/jqDock.js'],
            'screenfull': ['vendor/screenfull/dist/screenfull.js'],
            'echartsjs': ['vendor/echarts/echarts.js'],
            'icons': ['vendor/fontawesome/css/font-awesome.min.css',
                'vendor/simple-line-icons/css/simple-line-icons.css',
                'vendor/weather-icons/css/weather-icons.min.css'],
            'filestyle': ['vendor/bootstrap-filestyle/src/bootstrap-filestyle.js'],
            //'flot-chart': ['vendor/Flot/jquery.flot.js'],
            //'flot-chart-plugins': ['vendor/flot.tooltip/js/jquery.flot.tooltip.min.js',
            //    'vendor/Flot/jquery.flot.resize.js',
            //    'vendor/Flot/jquery.flot.pie.js',
            //    'vendor/Flot/jquery.flot.time.js',
            //    'vendor/Flot/jquery.flot.categories.js',
            //    'vendor/flot-spline/js/jquery.flot.spline.min.js'],
        },
        // 基于Angular的脚本
        modules: [
            {
                name: 'datatables', files: ['vendor/datatables/media/css/jquery.dataTables.css',
                    'vendor/datatables/media/js/jquery.dataTables.js',
                    'vendor/angular-datatables/dist/angular-datatables.js'], serie: true
            },
            {
                name: 'angularBootstrapNavTree', files: ['vendor/angular-bootstrap-nav-tree/dist/abn_tree_directive.js',
                    'vendor/angular-bootstrap-nav-tree/dist/abn_tree.css']
            },
            {
                name: 'ngDialog', files: ['vendor/ngDialog/js/ngDialog.min.js',
                    'vendor/ngDialog/css/ngDialog.min.css',
                    'vendor/ngDialog/css/ngDialog-theme-default.min.css']
            },
            {
                name: 'dateTimePicker', files: [
                    'vendor/datetimepicker/js/bootstrap-datetimepicker.min.js',
                    'vendor/datetimepicker/css/bootstrap-datetimepicker.min.css']
            },
            {
                name: 'qrcodeJs', files: [
                    'vendor/qrcode/jquery.barcode.js',
                    'vendor/qrcode/jquery.qrcode.js',
                    'vendor/qrcode/qrcode.utf.js']
            },
            {name: 'angularFileUpload', files: ['vendor/angular-file-upload/angular-file-upload.js']},
            {
                name: 'ngImgCrop', files: ['vendor/ng-img-crop/compile/unminified/ng-img-crop.js',
                    'vendor/ng-img-crop/compile/unminified/ng-img-crop.css']
            },
            {name: 'ngWig', files: ['vendor/ngWig/dist/ng-wig.min.js']},
            {name: 'indexJs', files: ['app/js/index.js', 'app/css/index/index.css']},
            {name: 'loginJs', files: ['app/js/sys/login.js']},
            {name: 'lockJs', files: ['app/js/sys/lock.js']},
            {name: 'bussindexJs', files: ['app/js/buss/index.js']},
            {name: 'bussFinanceJs', files: ['app/js/buss/finance.js']},
            {name: 'laHouseJs', files: ['app/js/la/house.js']},
            {name: 'laHousecfgJs', files: ['app/js/la/housecfg.js']},
            {name: 'laGrainJs', files: ['app/js/la/grain.js']},
            {name: 'laGranaryJs', files: ['app/js/la/granary.js']},
            {name: 'laGoodslocJs', files: ['app/js/la/goodsloc.js']},
            {name: 'laCustodyJs', files: ['app/js/la/custody.js']},
            {name: 'laRscustodyJs', files: ['app/js/la/rscustody.js']},
            {name: 'laOperationJs', files: ['app/js/la/operation.js']},
            {name: 'tplApprovalJs', files: ['app/js/tpl/approval.js']},
            {name: 'tplApprovalconfigJs', files: ['app/js/tpl/approvalcfg.js']},
            {name: 'tplReportsJs', files: ['app/js/tpl/reports.js']},
            {name: 'tplReceiptsJs', files: ['app/js/tpl/receipts.js']},
            {name: 'tplContractJs', files: ['app/js/tpl/contract.js']},
            {name: 'tplAerationJs', files: ['app/js/tpl/aeration.js']},
            {name: 'tplAerationconfigJs', files: ['app/js/tpl/aerationcfg.js']},
            {name: 'tplAirconditionJs', files: ['app/js/tpl/aircondition.js']},
            {name: 'tplAirconditionconfigJs', files: ['app/js/tpl/airconditioncfg.js']},
            {name: 'tplFumigationJs', files: ['app/js/tpl/fumigation.js']},
            {name: 'tplFumigationconfigJs', files: ['app/js/tpl/fumigationcfg.js']},
            {name: 'bussPlanJs', files: ['app/js/buss/plan.js']},
            {name: 'bussContractJs', files: ['app/js/buss/contract.js']},
            {name: 'bussRsplanJs', files: ['app/js/buss/rsplan.js']},
            {name: 'bussAttachJs', files: ['app/js/buss/attach.js']},
            {name: 'bussApprovalJs', files: ['app/js/buss/approval.js']},
            // add  by  BoBai 2016-12-14 9:33:59  begin
            {name: 'bussinfoJs', files: ['app/js/buss/bussinfo.js']},
            {name: 'clodopFuncsJs', files: ['app/js/print/CLodopfuncs.js']},
            {name: 'lodopFuncsJs', files: ['app/js/print/LodopFuncs.js']},
            {name: 'qainspectionJs', files: ['app/js/buss/qainspection.js']},
            {name: 'samplingJs', files: ['app/js/buss/sampling.js']},

            {name: 'samplingrecJs', files: ['app/js/buss/samplingrec.js']},
            {name: 'qaresultJs', files: ['app/js/buss/qaresult.js']},
            {name: 'laTaskJs', files: ['app/js/buss/latask.js']},
            {name: 'lataskRecJs', files: ['app/js/buss/latask_rec.js']},
            {name: 'qataskJs', files: ['app/js/buss/qatask.js']},
            {name: 'qataskRecJs', files: ['app/js/buss/qatask_rec.js']},
            {name: 'bussCustJs', files: ['app/js/buss/cust.js']},
            {name: 'bussReportJs', files: ['app/js/report/bussreport.js']},
            {name: 'laReportJs', files: ['app/js/report/lareport.js']},
            {name: 'rsgainReportJs', files: ['app/js/report/rsgainreport.js']},
            {name: 'laResJs', files: ['app/js/buss/res.js']},
            {name: 'laResRecJs', files: ['app/js/buss/res_rec.js']},
            {name: 'laDeviceJs', files: ['app/js/la/device.js']},
            {name: 'laDeviceUseJs', files: ['app/js/la/device_use.js']},
            {name: 'laDeviceMaintainJs', files: ['app/js/la/device_maintain.js']},
            {name: 'laDeviceGrainJs', files: ['app/js/la/device_grain.js']},
            // add  by  BoBai end
            {name: 'grainJs', files: ['app/js/grain/index.js']},
            {name: 'grainRealTimeJs', files: ['app/js/grain/grain_realtime.js']},
            {name: 'grainHistoryJs', files: ['app/js/grain/grain_history.js']},
            {name: 'inspectionTempJs', files: ['app/js/grain/inspection_temp.js']},
            {name: 'inspectionHumrityJs', files: ['app/js/grain/inspection_humrity.js']},
            {name: 'inspectionGasJs', files: ['app/js/grain/inspection_gas.js']},
            {name: 'inspectionPestJs', files: ['app/js/grain/inspection_pest.js']},
            {name: 'inspectionAllJs', files: ['app/js/grain/inspection_all.js']},
            {name: 'tempView', files: ['app/js/grain/temp_view.js']},
            {name: 'echarts-gljs',files:['vendor/echarts/echarts.js','vendor/echarts/echarts-gl.min.js']},
            {name: 'humrityView', files: ['app/js/grain/humrity_view.js']},
            {name: 'gasView', files: ['app/js/grain/gas_view.js']},
            {name: 'grainView', files: ['app/js/grain/grain_view.js']},
            {name: 'grainDeviceJs', files: ['app/js/grain/grain_device.js']},
            {name: 'grainStandardsJs', files: ['app/js/grain/grain_standards.js']},
            {name: 'pestView', files: ['app/js/grain/pest_view.js']},
            {name: 'aerateJs', files: ['app/js/aerate/index.js']},
            {name: 'layerJs', files: ['app/js/layer/layer.js', 'app/js/layer/theme/default/layer.css']},
            {name: 'aerateHistoryJs', files: ['app/js/aerate/aerate_history.js']},
            {name: 'aerateViewJs', files: ['app/js/aerate/aerate_view.js']},
            {name: 'aerateDeviceJs', files: ['app/js/aerate/aerate_device.js']},
            {name: 'aerateCaseJs', files: ['app/js/aerate/aerate_case.js']},
            {name: 'aircondJs', files: ['app/js/aircond/index.js']},
            {name: 'aircondHistoryJs', files: ['app/js/aircond/aircond_history.js']},
            {name: 'aircondDeviceJs', files: ['app/js/aircond/aircond_device.js']},
            {name: 'aircondViewJs', files: ['app/js/aircond/aircond_view.js']},
            {name: 'aircondCaseJs', files: ['app/js/aircond/aircond_case.js']},
            {name: 'fumJs', files: ['app/js/fum/index.js']},
            {name: 'fumHistoryJs', files: ['app/js/fum/fum_history.js']},
            {name: 'fumDeviceJs', files: ['app/js/fum/fum_device.js']},

            // 智能出入库，智能安防，远程监管系统  by chengzi  begin
            {name: 'OutinJs', files: ['app/js/outin/index.js']},
            {name: 'CardregJs', files: ['app/js/outin/cardreg.js']},
            {name: 'outinSamplingJs', files: ['app/js/outin/sampling.js']},
            {name: 'QualitytestingJs', files: ['app/js/outin/qualitytesting.js']},
            {name: 'GrossWeightJs', files: ['app/js/outin/grossweight.js']},
            {name: 'StoreJs', files: ['app/js/outin/store.js']},
            {name: 'TareWeightJs', files: ['app/js/outin/tareweight.js']},
            {name: 'SettlementJs', files: ['app/js/outin/settlement.js']},
            {name: 'WeightJs', files: ['app/js/outin/weight.js']},
            {name: 'ChukuJs', files: ['app/js/outin/chuku.js']},
            {name: 'OutDetailedJs', files: ['app/js/outin/out_detailed.js']},
            {name: 'OutinDetailJs', files: ['app/js/outin/outinDetail.js']},
            {name: 'InDetailedJs', files: ['app/js/outin/in_detailed.js']},
            {name: 'QualityJs', files: ['app/js/outin/quality.js']},
            {name: 'StateJs', files: ['app/js/outin/state.js']},
            {name: 'CarrierJs', files: ['app/js/outin/carrier.js']},
            {name: 'VehicleJs', files: ['app/js/outin/vehicle.js']},
            {name: 'CameraJs', files: ['app/js/camera/index.js']},
            {name: 'MonitoringJs', files: ['app/js/camera/monitoring.js']},
            {name: 'CangneiJs', files: ['app/js/camera/cangnei.js']},
            {name: 'webVideoCtrlJS', files: ['app/js/camera/webVideoCtrl.js']},
            {name: 'bsdWebVideoCtrlJS', files: ['app/js/camera/BsdWebVideoCtrl.js']},
            {name: 'CameraListJs', files: ['app/js/camera/cameraList.js']},
            {name: 'ImagesListJs', files: ['app/js/camera/imagesList.js']},
            {name: 'VedioListJs', files: ['app/js/camera/vedioList.js']},
            {name: 'WarningJs', files: ['app/js/camera/warning.js']},
            {name: 'RemoteJs', files: ['app/js/remote/index.js']},
            {name: 'RemoteEditJs', files: ['app/js/remote/edit.js']},
            {name: 'LogListJs', files: ['app/js/remote/logList.js']},
            {name: 'CommandLogList', files: ['app/js/remote/commandLogList.js']},
            // 智能出入库，智能安防，远程监管系统  by chengzi  end
            //控制器管理--begin
            {name: 'factoryJs', files: ['app/js/contro/factory.js']},
            {name: 'controInfoJs', files: ['app/js/contro/controinfo.js']},
            {name: 'firmCommandJs', files: ['app/js/contro/command.js']},
            {name: 'relayJs', files: ['app/js/contro/relay.js']},
            {name: 'storeControlJs', files: ['app/js/contro/storeControl.js']},
            //控制器管理--end
            {name: 'fumViewJs', files: ['app/js/fum/fum_view.js']},
            {name: 'fumCaseJs', files: ['app/js/fum/fum_case.js']},
            {name: 'switchJs', files: ['app/js/la/switch.js']},
            //专家决策和能耗--begin
            {name: 'zjjcindexJs', files: ['app/js/zjjc/zjjcindexJs.js']},
            {name: 'GrainDataJs', files: ['app/js/zjjc/GrainDataJs.js']},
            {name: 'FumigationJs', files: ['app/js/zjjc/FumigationJs.js']},
            {name: 'GrainTrendJs', files: ['app/js/zjjc/GrainTrendJs.js']},
            {name: 'GrainDifferenceJs', files: ['app/js/zjjc/GrainDifferenceJs.js']},
            {name: 'SingleStorehouseJs', files: ['app/js/zjjc/SingleStorehouseJs.js']},
            {name: 'warehousingJs', files: ['app/js/zjjc/warehousingJs.js']},
            {name: 'QualitybJs', files: ['app/js/zjjc/QualitybJs.js']},
            {
                name: 'nhjcJs',
                files: ['app/js/nhjc/index.js', 'app/css/nhjc/bootstrap.min.css', 'app/css/nhjc/index.css']
            },
            //专家决策和能耗--end
            //油脂测控--begin
            {
                name: 'OilmonitorJs',
                files: ['app/js/Oilmonitor/bootstrap.min.js', 'app/js/Oilmonitor/jquery.tempgauge.js', 'app/js/Oilmonitor/index.js', 'app/css/yzck/index.css']
            }
            //油脂测控--end
            // { name: 'toaster', files: ['vendor/angularjs-toaster/toaster.js','vendor/angularjs-toaster/toaster.css'] }
        ]
    });
/******************************** 设置应用程序的常量  end *************************************************************/

/******************************** 设置主要的控制器 begin **************************************************************/
App.controller('AppController',
    ['$rootScope', '$scope', '$state', '$translate', '$window', '$localStorage', '$timeout', '$http', 'toggleStateService', 'colors', 'browser', 'cfpLoadingBar',
        function ($rootScope, $scope, $state, $translate, $window, $localStorage, $timeout, $http, toggle, colors, browser, cfpLoadingBar) {
            "use strict";
            //退出当前登录
            $scope.to_mgt = function () {
                window.open(baseInfo.getInfo("mgtHref"));
            }
            //退出当前登录
            $scope.logout = function () {
                $http({
                    url: GserverURL + '/exit',
                    method: 'GET'
                }).success(function (data) {
                    alert(data);
                    //响应成功
                    if (data.success) {
                        window.location.href = "#/page/login"; //进入登录页面
                    } else {
                        alert("请刷新页面，重新登陆！");
                    }
                }).error(function () {
                    //处理响应失败
                    alert("请刷新页面，重新登陆！");
                });
            }
            // 布局模式
            $rootScope.app.layout.horizontal = ($rootScope.$stateParams.layout == 'app-h');
            // 加载 bar
            var thBar;
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                if ($('.wrapper > section').length) // 检查容器是否存在
                    thBar = $timeout(function () {
                        cfpLoadingBar.start();
                    }, 0); // 设置延迟
            });
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                event.targetScope.$watch("$viewContentLoaded", function () {
                    $timeout.cancel(thBar);
                    cfpLoadingBar.complete();
                });
            });
            // 未找到 hook
            $rootScope.$on('$stateNotFound',
                function (event, unfoundState, fromState, fromParams) {
                    //console.log(unfoundState.to);
                    //console.log(unfoundState.toParams);
                    //console.log(unfoundState.options);
                });
            // Hook 出错
            $rootScope.$on('$stateChangeError',
                function (event, toState, toParams, fromState, fromParams, error) {
                    console.log(error);
                });
            // Hook 成功
            $rootScope.$on('$stateChangeSuccess',
                function (event, toState, toParams, fromState, fromParams) {
                    // 从顶部显示新视图
                    $window.scrollTo(0, 0);
                    // 设置title
                    $rootScope.currTitle = $state.current.title;
                });
            $rootScope.currTitle = $state.current.title;
            $rootScope.pageTitle = function () {
                var title = $rootScope.app.name + ' - ' + ($rootScope.currTitle || $rootScope.app.description);
                document.title = title;
                return title;
            };
            // iPad 点击问题
            // 崩溃时关闭菜单栏
            $rootScope.$watch('app.layout.isCollapsed', function (newValue, oldValue) {
                if (newValue === false)
                    $rootScope.$broadcast('closeSidebarMenu');
            });
            //恢复布局设置
            if (angular.isDefined($localStorage.layout))
                $scope.app.layout = $localStorage.layout;
            else
                $localStorage.layout = $scope.app.layout;
            $rootScope.$watch("app.layout", function () {
                $localStorage.layout = $scope.app.layout;
            }, true);
            // 隐藏/显示 用户信息
            $scope.toggleUserBlock = function () {
                $scope.$broadcast('toggleUserBlock');
            };
            //跳转到首页
            $scope.toIndex = function () {
                window.location.href = "#/page/index";
            };
            // 允许使用品牌的颜色与插值
            $scope.colorByName = colors.byName;
            // 国际化
            $scope.language = {
                // 语言栏下拉
                listIsOpen: false,
                // 语言信息列表
                available: {
                    'ch': '中文',
                    'en': 'English'
                },
                // 显示当前用户界面语音
                init: function () {
                    var proposedLanguage = $translate.proposedLanguage() || $translate.use();
                    var preferredLanguage = $translate.preferredLanguage(); // 必须在app.config设置首选项
                    $scope.language.selected = $scope.language.available[(proposedLanguage || preferredLanguage)];
                },
                set: function (localeId, ev) {
                    // 设置新风格
                    $translate.use(localeId);
                    // 保存当前语言引用
                    $scope.language.selected = $scope.language.available[localeId];
                    // 最后切换下拉
                    $scope.language.listIsOpen = !$scope.language.listIsOpen;
                }
            };
            $scope.language.init(); //初始化
            // 恢复应用程序状态
            toggle.restoreState($(document.body));
            // 取消单击事件
            $rootScope.cancel = function ($event) {
                $event.stopPropagation();
            };
        }]);
/******************************** 设置主要的控制器 end ****************************************************************/

/******************************** 处理 sidebar 的侧边框 begin *********************************************************/
App.controller('SidebarController', ['$rootScope', '$scope', '$state', '$http', '$timeout', 'Utils',
    function ($rootScope, $scope, $state, $http, $timeout, Utils) {
        var collapseList = [];
        // 例如：当崩溃时，关闭所有项目
        $rootScope.$watch('app.layout.asideHover', function (oldVal, newVal) {
            if (newVal === false && oldVal === true) {
                closeAllBut(-1);
            }
        });
        // 检测子项目状态
        var isActive = function (item) {
            if (!item) return;
            if (!item.sref || item.sref == '#') {
                var foundActive = false;
                angular.forEach(item.submenu, function (value, key) {
                    if (isActive(value)) foundActive = true;
                });
                return foundActive;
            }
            else return $state.is(item.sref) || $state.includes(item.sref);
        };
        // 加载左导航列表  begin -----------------
        $scope.getMenuItemPropClasses = function (item) {
            return (item.heading ? 'nav-heading' : '') + (isActive(item) ? ' active' : '');
        };
        $scope.loadSidebarMenu = function () {
            var menuJson = 'server/sidebar-menu.json',
                menuURL = menuJson + '?v=' + (new Date().getTime()); // jumps cache
            $scope.menuItems = menuItems;

            //$http.get(menuURL)
            //    .success(function (items) {
            //        $scope.menuItems = items;
            //    })
            //    .error(function (data, status, headers, config) {
            //        alert(baseInfo.getInfo("loadFailure"));
            //    });
        };
        $scope.loadSidebarMenu();
        // 加载左导航列表  end --------------------------

        $scope.addCollapse = function ($index, item) {
            collapseList[$index] = $rootScope.app.layout.asideHover ? true : !isActive(item);
        };

        $scope.isCollapse = function ($index) {
            return (collapseList[$index]);
        };

        $scope.toggleCollapse = function ($index, isParentItem, modId, sonSize) { //modId为立坤扩展属性
            // 侧边框崩溃时，禁止切换
            if (Utils.isSidebarCollapsed() || $rootScope.app.layout.asideHover) return true;
            // make sure the item index exists
            if (angular.isDefined(collapseList[$index])) {
                if (!$scope.lastEventFromChild) {
                    collapseList[$index] = !collapseList[$index];
                    closeAllBut($index);
                }
            } else if (isParentItem) {
                // moduleId = modId; //模块栏目编码  by立坤扩展
                closeAllBut(-1);
            } else if (!isParentItem) {
                // moduleId = modId;//模块栏目编码  by立坤扩展
            }

            // if (!isParentItem) {
            //     moduleId=modId;//模块栏目编码  by立坤扩展
            // }
            if (sonSize < 1) {
                moduleId = modId;//模块栏目编码  by立坤扩展
            }

            $scope.lastEventFromChild = isChild($index);
            return true;
        };

        function closeAllBut(index) {
            index += '';
            for (var i in collapseList) {
                if (index < 0 || index.indexOf(i) < 0) collapseList[i] = true;
            }
        }

        function isChild($index) {
            return (typeof $index === 'string') && !($index.indexOf('-') < 0);
        }

    }]);
/******************************** 处理 sidebar 的侧边框 end ***********************************************************/

/******************************** 导航栏搜索显示开关自动关闭的ESC键 begin *********************************************/
App.directive('searchOpen', ['navSearch', function (navSearch) {
    'use strict';
    return {
        restrict: 'A',
        controller: ["$scope", "$element", function ($scope, $element) {
            $element
                .on('click', function (e) {
                    e.stopPropagation();
                })
                .on('click', navSearch.toggle);
        }]
    };
}]).directive('searchDismiss', ['navSearch', function (navSearch) {
    'use strict';
    var inputSelector = '.navbar-form input[type="text"]';
    return {
        restrict: 'A',
        controller: ["$scope", "$element", function ($scope, $element) {
            $(inputSelector)
                .on('click', function (e) {
                    e.stopPropagation();
                })
                .on('keyup', function (e) {
                    if (e.keyCode == 27) // ESC
                        navSearch.dismiss();
                });
            // 点击任何地方关闭搜索
            $(document).on('click', navSearch.dismiss);
            $element
                .on('click', function (e) {
                    e.stopPropagation();
                })
                .on('click', navSearch.dismiss);
        }]
    };
}]);
/******************************** 导航栏搜索显示开关自动关闭的ESC键 end ***********************************************/

/**=========================================================
 * Module: filestyle.js
 * Initializes the fielstyle plugin
 =========================================================*/

App.directive('filestyle', function () {
    return {
        restrict: 'A',
        controller: ["$scope", "$element", function ($scope, $element) {
            var options = $element.data();

            // old usage support
            options.classInput = $element.data('classinput') || options.classInput;

            $element.filestyle(options);
        }]
    };
});

/******************************** 全屏展示 begin **********************************************************************/
App.directive('toggleFullscreen', function () {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function (e) {
                e.preventDefault();
                if (screenfull.enabled) {
                    screenfull.toggle();
                    // 切换图标
                    if (screenfull.isFullscreen)
                        $(this).children('em').removeClass('fa-expand').addClass('fa-compress');
                    else
                        $(this).children('em').removeClass('fa-compress').addClass('fa-expand');
                } else {
                    $.error('Fullscreen not enabled');
                }
            });
        }
    };
});
/******************************** 全屏展示 end ************************************************************************/

/******************************** 用户头像信息 begin ******************************************************************/
App.controller('UserBlockController', ['$scope', function ($scope) {
    $scope.userBlockVisible = true;
    $scope.$on('toggleUserBlock', function (event, args) {
        $scope.userBlockVisible = !$scope.userBlockVisible;
    });
}]);
/******************************** 用户头像信息 end ********************************************************************/

/******************************** sidebar 折叠 begin ******************************************************************/
App.directive('sidebar', ['$rootScope', '$window', 'Utils', function ($rootScope, $window, Utils) {
    var $win = $($window);
    var $body = $('body');
    var $scope;
    var $sidebar;
    var currentState = $rootScope.$state.current.name;
    return {
        restrict: 'EA',
        template: '<nav class="sidebar" ng-transclude></nav>',
        transclude: true,
        replace: true,
        link: function (scope, element, attrs) {
            $scope = scope;
            $sidebar = element;
            var eventName = Utils.isTouch() ? 'click' : 'mouseenter';
            var subNav = $();
            $sidebar.on(eventName, '.nav > li', function () {
                if (Utils.isSidebarCollapsed() || $rootScope.app.layout.asideHover) {
                    subNav.trigger('mouseleave');
                    subNav = toggleMenuItem($(this));
                    // 检测工具栏的点击和触碰事件
                    sidebarAddBackdrop();
                }
            });
            scope.$on('closeSidebarMenu', function () {
                removeFloatingNav();
            });
            // 移动时调整状态
            $win.on('resize', function () {
                if (!Utils.isMobile())
                    $body.removeClass('aside-toggled');
            });
            // 路线调整
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                currentState = toState.name;
                // 停止工具栏自动移动
                $('body.aside-toggled').removeClass('aside-toggled');
                $rootScope.$broadcast('closeSidebarMenu');
            });
            // 允许关闭
            if (angular.isDefined(attrs.sidebarAnyclickClose)) {
                $('.wrapper').on('click.sidebar', function (e) {
                    // 看不到工具栏时停止检测
                    if (!$body.hasClass('aside-toggled')) return;
                    // 没有子集的工具栏
                    if (!$(e.target).parents('.aside').length) {
                        $body.removeClass('aside-toggled');
                    }
                });
            }
        }
    };

    function sidebarAddBackdrop() {
        var $backdrop = $('<div/>', {'class': 'dropdown-backdrop'});
        $backdrop.insertAfter('.aside-inner').on("click mouseenter", function () {
            removeFloatingNav();
        });
    }

    // Open the collapse sidebar submenu items when on touch devices
    // - desktop only opens on hover
    function toggleTouchItem($element) {
        $element
            .siblings('li')
            .removeClass('open')
            .end()
            .toggleClass('open');
    }

    // 在移动设备上打开工具栏崩溃
    function toggleMenuItem($listItem) {
        removeFloatingNav();
        var ul = $listItem.children('ul');
        if (!ul.length) return $();
        if ($listItem.hasClass('open')) {
            toggleTouchItem($listItem);
            return $();
        }
        var $aside = $('.aside');
        var $asideInner = $('.aside-inner'); // 计算上部偏移
        // 为额外的padding设置浮动
        var mar = parseInt($asideInner.css('padding-top'), 0) + parseInt($aside.css('padding-top'), 0);
        var subNav = ul.clone().appendTo($aside);
        toggleTouchItem($listItem);
        var itemTop = ($listItem.position().top + mar) - $sidebar.scrollTop();
        var vwHeight = $win.height();
        subNav
            .addClass('nav-floating')
            .css({
                position: $scope.app.layout.isFixed ? 'fixed' : 'absolute',
                top: itemTop,
                bottom: (subNav.outerHeight(true) + itemTop > vwHeight) ? 0 : 'auto'
            });
        subNav.on('mouseleave', function () {
            toggleTouchItem($listItem);
            subNav.remove();
        });
        return subNav;
    }

    function removeFloatingNav() {
        $('.dropdown-backdrop').remove();
        $('.sidebar-subnav.nav-floating').remove();
        $('.sidebar li.open').removeClass('open');
    }

}]);
/******************************** sidebar 折叠 end ********************************************************************/

/** 设置[toggle-state="CLASS-NAME-TO-TOGGLE"]避免浏览器在用户没有保存状态时，改变一个类名，导致了全局的改变 begin *****/
App.directive('toggleState', ['toggleStateService', function (toggle) {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var $body = $('body');
            $(element)
                .on('click', function (e) {
                    e.preventDefault();
                    var classname = attrs.toggleState;
                    if (classname) {
                        if ($body.hasClass(classname)) {
                            $body.removeClass(classname);
                            if (!attrs.noPersist)
                                toggle.removeState(classname);
                        }
                        else {
                            $body.addClass(classname);
                            if (!attrs.noPersist)
                                toggle.addState(classname);
                        }
                    }
                });
        }
    };
}]);
/** 设置[toggle-state="CLASS-NAME-TO-TOGGLE"]避免浏览器在用户没有保存状态时，改变一个类名，导致了全局的改变 begin *****/

/******************************** 浏览器检测 begin ********************************************************************/
App.service('browser', function () {
    "use strict";
    var matched, browser;
    var uaMatch = function (ua) {
        ua = ua.toLowerCase();
        var match = /(opr)[\/]([\w.]+)/.exec(ua) ||
            /(chrome)[ \/]([\w.]+)/.exec(ua) ||
            /(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(ua) ||
            /(webkit)[ \/]([\w.]+)/.exec(ua) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
            /(msie) ([\w.]+)/.exec(ua) ||
            ua.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec(ua) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
            [];
        var platform_match = /(ipad)/.exec(ua) ||
            /(iphone)/.exec(ua) ||
            /(android)/.exec(ua) ||
            /(windows phone)/.exec(ua) ||
            /(win)/.exec(ua) ||
            /(mac)/.exec(ua) ||
            /(linux)/.exec(ua) ||
            /(cros)/i.exec(ua) ||
            [];
        return {
            browser: match[3] || match[1] || "",
            version: match[2] || "0",
            platform: platform_match[0] || ""
        };
    };
    matched = uaMatch(window.navigator.userAgent);
    browser = {};
    if (matched.browser) {
        browser[matched.browser] = true;
        browser.version = matched.version;
        browser.versionNumber = parseInt(matched.version);
    }
    if (matched.platform) {
        browser[matched.platform] = true;
    }
    // 移动设备浏览器
    if (browser.android || browser.ipad || browser.iphone || browser["windows phone"]) {
        browser.mobile = true;
    }
    // 桌面浏览器
    if (browser.cros || browser.mac || browser.linux || browser.win) {
        browser.desktop = true;
    }
    // Chrome, Opera 15+，Safari 等基于 webkit 的浏览器
    if (browser.chrome || browser.opr || browser.safari) {
        browser.webkit = true;
    }
    // 为ie11分配数字证书，以防止访问禁止
    if (browser.rv) {
        var ie = "msie";
        matched.browser = ie;
        browser[ie] = true;
    }
    // Opera 15+ 标注为 opr
    if (browser.opr) {
        var opera = "opera";
        matched.browser = opera;
        browser[opera] = true;
    }
    // Android的浏览器标记为Safari浏览器
    if (browser.safari && browser.android) {
        var android = "android";
        matched.browser = android;
        browser[android] = true;
    }
    // 指定名称和平台变量
    browser.name = matched.browser;
    browser.platform = matched.platform;
    return browser;
});
/******************************** 浏览器检测 end **********************************************************************/

/******************************** 检索全局颜色 begin ******************************************************************/
App.factory('colors', ['APP_COLORS', function (colors) {
    return {
        byName: function (name) {
            return (colors[name] || '#fff');
        }
    };
}]);
/******************************** 检索全局颜色 end ********************************************************************/

/******************************** 服务共享导航栏的搜索功能 begin ******************************************************/
App.service('navSearch', function () {
    var navbarFormSelector = 'form.navbar-form';
    return {
        toggle: function () {
            var navbarForm = $(navbarFormSelector);
            navbarForm.toggleClass('open');
            var isOpen = navbarForm.hasClass('open');
            navbarForm.find('input')[isOpen ? 'focus' : 'blur']();
        },
        dismiss: function () {
            $(navbarFormSelector)
                .removeClass('open')      // Close control
                .find('input[type="text"]').blur() // remove focus
                .val('')                    // Empty input
            ;
        }
    };
});
/******************************** 服务共享导航栏的搜索功能 end ********************************************************/

/******************************** 提供路由定义的辅助函数 begin ********************************************************/
App.provider('RouteHelpers', ['APP_REQUIRES', function (appRequires) {
    "use strict";
    // 在此基础上设置相对路径
    // 应用视图
    this.basepath = function (uri) {
        return 'app/views/' + uri;
    };
    // 通过脚本名称生成解决对象
    // 在constant.app_requires先前配置
    this.resolveFor = function () {
        var _args = arguments;
        return {
            deps: ['$ocLazyLoad', '$q', function ($ocLL, $q) {
                // 为每个参数创建一个承诺链
                var promise = $q.when(1); // 空承诺链
                for (var i = 0, len = _args.length; i < len; i++) {
                    promise = andThen(_args[i]);
                }
                return promise;

                // 创建动态承诺链
                function andThen(_arg) {
                    // 支持一个函数，返回一个承诺
                    if (typeof _arg == 'function')
                        return promise.then(_arg);
                    else
                        return promise.then(function () {
                            // 如果是一个模块，通过名称。如果没有，通过数组
                            var whatToLoad = getRequired(_arg);
                            // 简单的错误检查
                            if (!whatToLoad) return $.error('Route resolve: Bad resource name [' + _arg + ']');
                            // 最后，返回一个承诺
                            return $ocLL.load(whatToLoad);
                        });
                }

                // 检查并返回所需的数据
                // 模块项目的形式 [name: '', files: []]
                // 简单的脚本文件数组
                function getRequired(name) {
                    if (appRequires.modules)
                        for (var m in appRequires.modules)
                            if (appRequires.modules[m].name && appRequires.modules[m].name === name)
                                return appRequires.modules[m];
                    return appRequires.scripts && appRequires.scripts[name];
                }
            }]
        };
    };
    this.$get = function () {
    };
}]);
/******************************** 提供路由定义的辅助函数 end **********************************************************/

/******************************** 共享切换状态功能的服务 begin ********************************************************/
App.service('toggleStateService', ['$rootScope', function ($rootScope) {
    var storageKeyName = 'toggleState';
    // 帮助对象在短语中检查单词
    var WordChecker = {
        hasWord: function (phrase, word) {
            return new RegExp('(^|\\s)' + word + '(\\s|$)').test(phrase);
        },
        addWord: function (phrase, word) {
            if (!this.hasWord(phrase, word)) {
                return (phrase + (phrase ? ' ' : '') + word);
            }
        },
        removeWord: function (phrase, word) {
            if (this.hasWord(phrase, word)) {
                return phrase.replace(new RegExp('(^|\\s)*' + word + '(\\s|$)*', 'g'), '');
            }
        }
    };

    // 返回服务公共方法
    return {
        // 将一个状态添加到浏览器存储中，稍后恢复
        addState: function (classname) {
            var data = angular.fromJson($rootScope.$storage[storageKeyName]);
            if (!data) {
                data = classname;
            }
            else {
                data = WordChecker.addWord(data, classname);
            }
            $rootScope.$storage[storageKeyName] = angular.toJson(data);
        },

        // 从浏览器存储中删除一个状态
        removeState: function (classname) {
            var data = $rootScope.$storage[storageKeyName];
            // nothing to remove
            if (!data) return;
            data = WordChecker.removeWord(data, classname);
            $rootScope.$storage[storageKeyName] = angular.toJson(data);
        },

        // 加载合格的恢复名单
        restoreState: function ($elem) {
            var data = angular.fromJson($rootScope.$storage[storageKeyName]);
            // 没有恢复
            if (!data) return;
            $elem.addClass(data);
        }
    };
}]);
/******************************** 共享切换状态功能的服务 end **********************************************************/

/******************************** 在主题内使用jar包 begin *************************************************************/
App.service('Utils', ["$window", "APP_MEDIAQUERY", function ($window, APP_MEDIAQUERY) {
    'use strict';
    var $html = angular.element("html"),
        $win = angular.element($window),
        $body = angular.element('body');
    return {
        support: {
            transition: (function () {
                var transitionEnd = (function () {
                    var element = document.body || document.documentElement,
                        transEndEventNames = {
                            WebkitTransition: 'webkitTransitionEnd',
                            MozTransition: 'transitionend',
                            OTransition: 'oTransitionEnd otransitionend',
                            transition: 'transitionend'
                        }, name;
                    for (name in transEndEventNames) {
                        if (element.style[name] !== undefined) return transEndEventNames[name];
                    }
                }());
                return transitionEnd && {end: transitionEnd};
            })(),
            animation: (function () {
                var animationEnd = (function () {
                    var element = document.body || document.documentElement,
                        animEndEventNames = {
                            WebkitAnimation: 'webkitAnimationEnd',
                            MozAnimation: 'animationend',
                            OAnimation: 'oAnimationEnd oanimationend',
                            animation: 'animationend'
                        }, name;
                    for (name in animEndEventNames) {
                        if (element.style[name] !== undefined) return animEndEventNames[name];
                    }
                }());
                return animationEnd && {end: animationEnd};
            })(),
            requestAnimationFrame: window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                },
            touch: (
                ('ontouchstart' in window && navigator.userAgent.toLowerCase().match(/mobile|tablet/)) ||
                (window.DocumentTouch && document instanceof window.DocumentTouch) ||
                (window.navigator['msPointerEnabled'] && window.navigator['msMaxTouchPoints'] > 0) || //IE 10
                (window.navigator['pointerEnabled'] && window.navigator['maxTouchPoints'] > 0) || //IE >=11
                false
            ),
            mutationobserver: (window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null)
        },
        isInView: function (element, options) {
            var $element = $(element);
            if (!$element.is(':visible')) {
                return false;
            }
            var window_left = $win.scrollLeft(),
                window_top = $win.scrollTop(),
                offset = $element.offset(),
                left = offset.left,
                top = offset.top;
            options = $.extend({topoffset: 0, leftoffset: 0}, options);
            if (top + $element.height() >= window_top && top - options.topoffset <= window_top + $win.height() &&
                left + $element.width() >= window_left && left - options.leftoffset <= window_left + $win.width()) {
                return true;
            } else {
                return false;
            }
        },
        langdirection: $html.attr("dir") == "rtl" ? "right" : "left",
        isTouch: function () {
            return $html.hasClass('touch');
        },
        isSidebarCollapsed: function () {
            return $body.hasClass('aside-collapsed');
        },
        isSidebarToggled: function () {
            return $body.hasClass('aside-toggled');
        },
        isMobile: function () {
            return $win.width() < APP_MEDIAQUERY.tablet;
        }
    };
}]);
/******************************** 在主题内使用jar包 end ***************************************************************/

// 调用 myappname模块，运营程序
var myApp = angular.module('myAppName', ['angle']);
myApp.run(["$log", function ($log) {
    $log.log('I\'m a line from custom.js');
}]);

myApp.config(["RouteHelpersProvider", function (RouteHelpersProvider) {
    // 自定义路由
}]);

myApp.controller('oneOfMyOwnController', ["$scope", function ($scope) {
    /* 控制器代码 */
}]);

myApp.directive('oneOfMyOwnDirectives', function () {
    /*指令代码*/
});

myApp.config(["$stateProvider", function ($stateProvider /* ... */) {
    /* 具体地址 (config.js文件) */
}]);


/**=========================================================
 * Module: form-wizard.js
 * Handles form wizard plugin and validation
 =========================================================*/
App.directive('formWizard', ["$parse", function ($parse) {
    'use strict';
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attribute) {
            var validate = $parse(attribute.validateSteps)(scope),
                wiz = new Wizard(attribute.steps, !!validate, element);
            scope.wizard = wiz.init();
        }
    };

    function Wizard(quantity, validate, element) {
        var self = this;
        self.quantity = parseInt(quantity, 10);
        self.validate = validate;
        self.element = element;
        self.init = function () {
            self.createsteps(self.quantity);
            self.go(1); // always start at fist step
            return self;
        };
        self.go = function (step) {
            if (angular.isDefined(self.steps[step])) {

                if (self.validate && step !== 1) {
                    var form = $(self.element),
                        group = form.children().children('div').get(step - 2);
                    if (false === form.parsley().validate(group.id)) {
                        return false;
                    }
                }
                self.cleanall();
                self.steps[step] = true;
            }
        };

        self.active = function (step) {
            return !!self.steps[step];
        };

        self.cleanall = function () {
            for (var i in self.steps) {
                self.steps[i] = false;
            }
        };

        self.createsteps = function (q) {
            self.steps = [];
            for (var i = 1; i <= q; i++) self.steps[i] = false;
        };

    }

}]);
/**=========================================================
 *  echarts 图表组件
 =========================================================*/
App.directive('rzhecharts', function () {
    return {
        scope: {
            rid: "@",
            option: "=",
            width: "=",
            height: "="
        },
        restrict: 'E',
        template: '<div></div>',
        replace: true,
        link: function ($scope, element, attrs, controller) {
            var opr;
            if ($scope.height > 0) {
                opr = {
                    height: $scope.height
                };
            }
            var myChart = echarts.init(document.getElementById($scope.rid), 'macarons', opr);

            $scope.$watch('option', function (n, o) {
                if (n === o || !n) return;
                myChart.setOption(n, true);
            });

            $scope.$on('$destory', function () {
                window.removeEventListener('resize', chartResize);
            })

            function chartResize() {
                myChart.resize();
            }

            myChart.setOption($scope.option);
        }
    };
});
/************************************************* 扩展  by 立坤  *****************************************************/
//业务管理底部导航处理
App.controller('businessInfoFooterController', ['$scope', '$http', '$state', function ($scope, $http, $state) {
    $scope.businessInfoFooterItems = indexMenuItems;
    //进入子模块
    $scope.getMod = function (code, uri) {
        var pData = {id: code};
        angularParamString($http); //解决post提交接收问题，json方式改为string方式
        footerMenuUrl = uri;
        $http({
            url: GserverURL + '/sys/user/queryMenus',
            method: 'POST',
            data: pData
        }).success(function (result) {
            if (result.success) {
                var menu = result.data;
                if (menu != null && menu != "") menuItems = JSON.parse(menu);
                $state.go(uri);
            } else {
                alert("跳转失败！");
            }
        }).error(function (result) { //提交失败
                alert("跳转失败！");
            }
        );
    };
}]);

/**
 * @author 立坤 更新于2016.06.27
 * 获取一个静态页面的html代码信息并进行简单操作
 * @param url
 * @param but_name
 * @param but_id
 * @returns {*}
 */
function getHtmlInfos(url, but_name, but_id) {
    var result;
    $.ajax({ //ajax方式获取html的信息
        cache: false,
        async: false,
        url: url, //这里是静态页的地址
        type: "GET", //静态页用get方法，否则服务器会抛出405错误
        success: function (data) {
            result = data;
        }
    });
    //改变按钮名称
    if (result != null && result != "" && but_name != null && but_name != "") {
        if (url.indexOf("to_add") > -1 || url.indexOf("grid_add") > -1) result = result.replace(new RegExp("添加", "g"), but_name);
        if (url.indexOf("to_build") > -1 || url.indexOf("grid_build") > -1) result = result.replace(new RegExp("生成", "g"), but_name);
        if (url.indexOf("to_delete") > -1 || url.indexOf("grid_delete") > -1) result = result.replace(new RegExp("删除", "g"), but_name);
        if (url.indexOf("to_download") > -1 || url.indexOf("grid_download") > -1) result = result.replace(new RegExp("下载", "g"), but_name);
        if (url.indexOf("to_remove") > -1 || url.indexOf("grid_remove") > -1) result = result.replace(new RegExp("取消", "g"), but_name);
        if (url.indexOf("to_search") > -1 || url.indexOf("grid_search") > -1) result = result.replace(new RegExp("搜索", "g"), but_name);
        if (url.indexOf("to_start") > -1 || url.indexOf("grid_start") > -1) result = result.replace(new RegExp("启用", "g"), but_name);
        if (url.indexOf("to_stop") > -1 || url.indexOf("grid_stop") > -1) result = result.replace(new RegExp("停用", "g"), but_name);
        if (url.indexOf("to_submit") > -1 || url.indexOf("grid_submit") > -1) result = result.replace(new RegExp("提交", "g"), but_name);
        if (url.indexOf("to_update") > -1 || url.indexOf("grid_update") > -1) result = result.replace(new RegExp("修改", "g"), but_name);
        if (url.indexOf("to_upload") > -1 || url.indexOf("grid_upload") > -1) result = result.replace(new RegExp("上传", "g"), but_name);
        if (url.indexOf("to_details") > -1 || url.indexOf("grid_details") > -1) result = result.replace(new RegExp("详情", "g"), but_name);
        if (url.indexOf("to_back") > -1 || url.indexOf("grid_back") > -1) result = result.replace(new RegExp("返回", "g"), but_name);
    }
    //改变对应的id
    if (result != null && result != "" && but_id != null && but_id != "") {
        if (url.indexOf("to_add") > -1) result = result.replace("toAdd", but_id);
        if (url.indexOf("to_build") > -1) result = result.replace("toBuild", but_id);
        if (url.indexOf("to_delete") > -1) result = result.replace("toDelete", but_id);
        if (url.indexOf("to_download") > -1) result = result.replace("toDownload", but_id);
        if (url.indexOf("to_remove") > -1) result = result.replace("toRemove", but_id);
        if (url.indexOf("to_search") > -1) result = result.replace("toSearch", but_id);
        if (url.indexOf("to_start") > -1) result = result.replace("toStart", but_id);
        if (url.indexOf("to_stop") > -1) result = result.replace("toStop", but_id);
        if (url.indexOf("to_submit") > -1) result = result.replace("toSubmit", but_id);
        if (url.indexOf("to_update") > -1) result = result.replace("toUpdate", but_id);
        if (url.indexOf("to_upload") > -1) result = result.replace("toUpload", but_id);
        if (url.indexOf("to_details") > -1) result = result.replace("toDetails", but_id);
        if (url.indexOf("to_back") > -1) result = result.replace("toBack", but_id);
        if (url.indexOf("grid_add") > -1) result = result.replace("gridAdd", but_id);
        if (url.indexOf("grid_build") > -1) result = result.replace("gridBuild", but_id);
        if (url.indexOf("grid_delete") > -1) result = result.replace("gridDelete", but_id);
        if (url.indexOf("grid_download") > -1) result = result.replace("gridDownload", but_id);
        if (url.indexOf("grid_remove") > -1) result = result.replace("gridRemove", but_id);
        if (url.indexOf("grid_search") > -1) result = result.replace("gridSearch", but_id);
        if (url.indexOf("grid_start") > -1) result = result.replace("gridStart", but_id);
        if (url.indexOf("grid_stop") > -1) result = result.replace("gridStop", but_id);
        if (url.indexOf("grid_agree") > -1) result = result.replace("gridAgree", but_id);
        if (url.indexOf("grid_reject") > -1) result = result.replace("gridReject", but_id);
        if (url.indexOf("grid_submit") > -1) result = result.replace("gridSubmit", but_id);
        if (url.indexOf("grid_update") > -1) result = result.replace("gridUpdate", but_id);
        if (url.indexOf("grid_upload") > -1) result = result.replace("gridUpload", but_id);
        if (url.indexOf("grid_details") > -1) result = result.replace("gridDetails", but_id);
        if (url.indexOf("grid_back") > -1) result = result.replace("gridBack", but_id);
    }
    return result;
}



/**
 * @author 立坤 更新于2016.07.30
 * 格式化日期
 * @param str
 * @returns {string}
 */
function formatDate(str) {
    if (str.indexOf("-")<0) {
        return str.substring(0, 4) + "-" + str.substring(4, 6) + "-" + str.substring(6, 8) + " " + str.substring(8, 10) + ":" + str.substring(10, 12) + ":" + str.substring(12, 14);
    }else{
        return str;
    }
}

function viewImg(str) {
    if (str.length<1) {
        return str;
    }else{
        return "<a href='"+str+"' target='_blank'>照片</a>";
    }
}

function formatDateNum14(str) {
    if (str !=null && str!='' && str.indexOf("-")>0) {
    return str.replace(/-/g, "").replace(" ", "").replace(/:/g, "");
    }else{
        return str;
    }
}


/**
 * @author 伯谦 更新于2016.12.27
 * 格式化日期
 * @param str
 * @returns {string}
 */
function formatDay(str) {
    if(str !=null && str.length>=8) {
        return str.substring(0, 4) + "-" + str.substring(4, 6) + "-" + str.substring(6, 8);
    }else{
        return null;
    }
}

function formatDayNum8(str) {
    return str.replace(/-/g, "");
}

//列表信息控制
// 全选
function gridInfoCheckAll(id) {
    $('#' + id + ' #grid-check-all').click(function () {
        $('#' + id + " :checkbox:not(#grid-check-all)").attr("checked", this.checked);
        $('#' + id + " :checkbox:not(#grid-check-all)").prop("checked", this.checked);
        $('#' + id + " tr").toggleClass('checked');
    });
}

//点击列表，自动勾选
function ckClickTr(id) {
    var isClick = true;
    $("#" + id + " tbody tr button").click(function () {
        isClick = false;
    });
    $("#" + id + " tbody tr").click(function (e) {
        if (isClick) {
            var _this = $(this);
            var ckeck = _this.find("input[type=checkbox]:checked");
            if (ckeck.is(':checked')) {
                _this.find("input[type=checkbox]").attr("checked", false);
                _this.find("input[type=checkbox]").prop("checked", false);
                _this.removeClass("checked");
            } else {
                _this.find("input[type=checkbox]").attr("checked", true);
                _this.find("input[type=checkbox]").prop("checked", true);
                _this.addClass('checked');
            }
        }
        isClick = true;
    });
}

//封装弹出框
function rzhdialog(ngDialog, msg, type) {
    var html = "";
    if (type == "help") {
        html = '<p class="fa fa-question-circle" style="color:dodgerblue;"> ' + msg + '</p>';
    } else if (type == "success") {
        html = '<p class="fa fa-check-circle" style="color:green;"> ' + msg + '</p>';
    } else if (type == "error") {
        html = '<p class="fa fa-exclamation-circle" style="color:orangered;"> ' + msg + '</p>';
    } else {
        html = '<p class="fa fa-info-circle"> ' + msg + '</p>';
    }
    var dialog = ngDialog.open({
        template: html,
        plain: true,
        closeByDocument: false,
        closeByEscape: false
    });
    setTimeout(function () {
        dialog.close();
    }, 3000);
}

//封装弹出框
function rzhdialogTime(ngDialog, msg, type,times) {
    var html = "";
    if (type == "help") {
        html = '<p class="fa fa-question-circle" style="color:dodgerblue;"> ' + msg + '</p>';
    } else if (type == "success") {
        html = '<p class="fa fa-check-circle" style="color:green;"> ' + msg + '</p>';
    } else if (type == "error") {
        html = '<p class="fa fa-exclamation-circle" style="color:orangered;"> ' + msg + '</p>';
    } else {
        html = '<p class="fa fa-info-circle"> ' + msg + '</p>';
    }
    var dialog = ngDialog.open({
        template: html,
        plain: true,
        closeByDocument: false,
        closeByEscape: false
    });
    setTimeout(function () {
        dialog.close();
    }, times);
    return dialog;
}


//获得选中行数
function getTableDataList(table) {
    var datas = table.rows(".checked").data();
    return datas;
}


//获得选中行数
function getTableData(table) {
    var datas = table.rows(".checked").data();
    if (datas.length == 1) return datas[0];
    return null;
}

//获得选中行数
function getTableSelectedCount(table) {
    var datas = table.rows(".checked").data();
    return datas.length;
}

/**
 * 打开文件
 * @param ngDialog
 * @param file
 */
function openfile(ngDialog, file) {
    if (typeof(file) == "undefined" || file == null || file == "") return;
    //获取类型树信息
    $.ajax({ //查询按钮权限
        url: GserverURL + "/buss/attach/file?p=" + file,
        method: 'POST'
    }).success(function (response) {
        if (response.success) {
            window.open(response.data);
        } else {
            rzhdialog(ngDialog, response.info, "error")
        }
    });
}