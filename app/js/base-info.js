/**
 * @author 立坤 创建于2016.06.15
 * @remark 该文件用于记录平台的一些基础信息
 *
 */
var baseInfo = (function() {
    var constants = {//定义常量
        name: "",
        phone: "0371-63596111",
        description: "智慧粮食综合管理平台",
        keyword:"智慧,智能,粮食,粮库,智慧粮食,智慧粮库,管理系统，粮食系统,粮食平台",
        unjquery:"未引入jquery，请引入",
        loadFailure:"数据加载失败",
        mgtHref:"http://127.0.0.1:8090/",//权限系统链接
    }
    var Test={};
    // 定义了一个静态方法
    Test.getInfo=function(name){//获取常量的方法
        return constants[name];
    }
    return Test
})();