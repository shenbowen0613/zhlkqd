function tanc() {
    layer.open({
        type: 2,
        skin: 'layui-layer-lan', //加上边框
        area: ['630px', '460px'], //宽高
        content: '/xxsw/tpl/demo1.html'
    });
};

function tana() {
    layer.open({
        type: 2,
        title: '一键通风',
        resize:false,
        skin: 'layui-layer-lan', //加上边框
        area: ['680px', '390px'], //宽高
        content: '/xxsw/tpl/2.html'
    });
};

function tanb() {
    layer.open({
        type: 2,
        title: '一键熏蒸',
        resize:false,
        skin: 'layui-layer-lan', //加上边框
        area: ['680px', '390px'], //宽高
        content: '/xxsw/tpl/2.html'
    });
};
function xinxinchun(data) {
    var name = data.substr(5,2);
    layer.open({
        content: '<div style="text-align:center;font-size: 20px;">'+ name + '仓房</div>',
        area: ['1000px', '160px'],
        btnAlign: 'c',
        offset: 't',
        btn: ['关闭','保管人员', '仓房信息', '出入库','设施设备', '监督检测', '粮情','粮食品种', '粮食质量', '熏蒸信息']
        ,yes: function(){
            layer.closeAll();
        }
        ,btn2: function(){
            layer.open({
                type: 1
                ,title:'保管人员信息'
                ,skin: 'layui-layer-lan'
                ,content: '<div style="margin: 30px 0 0 90px;' +
                '    font-size: 20px;"><table>' +
                '<tr><td width="25%">工号：</td><td width="75%">00001</td></tr>' +
                '<tr><td width="25%">姓名：</td><td width="75%">张三</td></tr>' +
                '<tr><td width="25%">职务：</td><td width="75%">保管员</td></tr>' +
                '<tr><td width="25%">电话：</td><td width="75%">13838152233</td></tr>' +
                '<tr><td width="25%">部门：</td><td width="75%">后勤</td></tr></table></div>' //这里content是一个普通的String
                ,btn: '关闭'
                ,area: ['400px', '300px']
                ,btnAlign: 'c' //按钮居中
                ,shade: 0 //不显示遮罩
                ,yes: function(){
                    layer.closeAll('page');
                }
            });
            return false;
        }
        ,btn3: function(){
            //按钮【按钮三】的回调
            layer.open({
                type: 1
                ,title:'仓房信息'
                ,skin: 'layui-layer-lan'
                ,content: '<div style="margin: 30px 0 0 90px;' +
                '    font-size: 20px;"><table>' +
                '<tr><td width="35%">仓房编号：</td><td width="65%">01</td></tr>' +
                '<tr><td width="35%">仓房库容：</td><td width="65%">1000吨</td></tr>' +
                '<tr><td width="35%">储粮类型：</td><td width="65%">小麦</td></tr>' +
                '<tr><td width="35%">储粮等级：</td><td width="65%">1级</td></tr>' +
                '<tr><td width="35%">储粮限高：</td><td width="65%">6米</td></tr>' +
                '<tr><td width="35%">仓门数量：</td><td width="65%">2</td></tr></table></div>'
                ,btn: '关闭'
                ,area: ['400px', '300px']
                ,btnAlign: 'c' //按钮居中
                ,shade: 0 //不显示遮罩
                ,yes: function(){
                    layer.closeAll('page');
                }
            });
            return false;
            //return false 开启该代码可禁止点击该按钮关闭
        }
        ,btn4: function(){
            layer.open({
                type: 1
                ,title:'出入库信息'
                ,skin: 'layui-layer-lan'
                ,content: '出入库信息' //这里content是一个普通的String
                ,btn: '关闭'
                ,area: ['400px', '300px']
                ,btnAlign: 'c' //按钮居中
                ,shade: 0 //不显示遮罩
                ,yes: function(){
                    layer.closeAll('page');
                }
            });
            return false;
        }
        ,btn5: function(){
            layer.open({
                type: 1
                ,title:'设施设备信息'
                ,skin: 'layui-layer-lan'
                ,content: '设施设备信息' //这里content是一个普通的String
                ,btn: '关闭'
                ,area: ['400px', '300px']
                ,btnAlign: 'c' //按钮居中
                ,shade: 0 //不显示遮罩
                ,yes: function(){
                    layer.closeAll('page');
                }
            });
            return false;
        }
        ,btn6: function(){
            layer.open({
                type: 1
                ,title:'监督检测信息'
                ,skin: 'layui-layer-lan'
                ,content: '监督检测信息' //这里content是一个普通的String
                ,btn: '关闭'
                ,area: ['400px', '300px']
                ,btnAlign: 'c' //按钮居中
                ,shade: 0 //不显示遮罩
                ,yes: function(){
                    layer.closeAll('page');
                }
            });
            return false;
        }
        ,btn7: function(){
            layer.open({
                type: 1
                ,title:'粮情信息'
                ,skin: 'layui-layer-lan'
                ,content: '粮情信息' //这里content是一个普通的String
                ,btn: '关闭'
                ,area: ['400px', '300px']
                ,btnAlign: 'c' //按钮居中
                ,shade: 0 //不显示遮罩
                ,yes: function(){
                    layer.closeAll('page');
                }
            });
            return false;
        }
        ,btn8: function(){
            layer.open({
                type: 1
                ,title:'粮食品种信息'
                ,skin: 'layui-layer-lan'
                ,content: '粮食品种信息' //这里content是一个普通的String
                ,btn: '关闭'
                ,area: ['400px', '300px']
                ,btnAlign: 'c' //按钮居中
                ,shade: 0 //不显示遮罩
                ,yes: function(){
                    layer.closeAll('page');
                }
            });
            return false;
        }
        ,btn9: function(){
            layer.open({
                type: 1
                ,title:'粮食质量信息'
                ,skin: 'layui-layer-lan'
                ,content: '粮食质量信息' //这里content是一个普通的String
                ,btn: '关闭'
                ,area: ['400px', '300px']
                ,btnAlign: 'c' //按钮居中
                ,shade: 0 //不显示遮罩
                ,yes: function(){
                    layer.closeAll('page');
                }
            });
            return false;
        }
        ,btn10: function(){
            layer.open({
                type: 1
                ,title:'熏蒸信息信息'
                ,skin: 'layui-layer-lan'
                ,content: '熏蒸信息信息' //这里content是一个普通的String
                ,btn: '关闭'
                ,area: ['400px', '300px']
                ,btnAlign: 'c' //按钮居中
                ,shade: 0 //不显示遮罩
                ,yes: function(){
                    layer.closeAll('page');
                }
            });
            return false;
        }
        ,cancel: function(){
            //右上角关闭回调

            //return false 开启该代码可禁止点击该按钮关闭
        }
    });
}