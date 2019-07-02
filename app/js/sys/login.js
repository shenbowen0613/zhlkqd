App.controller('LoginFormController', ['$scope', '$http', '$state', function ($scope, $http, $state) {
    // 拉取数据
    $scope.account = {};
    // 错误信息
    $scope.authMsg = '';
    $scope.login = function () {
        $scope.authMsg = '';
        if ($scope.loginForm.$valid) {
            var password = $scope.user.password;
            /*password = encodeURI(password);
            password = window.btoa(password);*/
            var pData = {
                username: $scope.user.username,
                password: password
            };
            angularParamString($http); //解决post提交接收问题，json方式改为string方式
           $http({
                url: GserverURL +'/userLogin',
                method: 'POST',
                data: pData
            }).success(function (result) {
                // alert("----result--------"+result);
                    if(result.success){
                        var menu = result.data;
                        if(menu == null || menu == ""||menu=="[]"){
                            $("#authMsg").html("登录失败");
                            return;
                        }
                        indexMenuItems = menu;
                        // alert("---menu---"+menu);
                        // alert("---indexMenuItems---"+indexMenuItems);
                        $state.go('page.index');
                    }else{
                        $("#authMsg").html(result.info);
                        //$scope.authMsg = result.info;
                    }
                }).error(function (result) { //提交失败
                    $("#authMsg").html("登录失败");
                    //$scope.authMsg = '登录失败！';
                }
            );
        }
        else {
            $scope.loginForm.username.$dirty = true;
            $scope.loginForm.account_password.$dirty = true;
        }
    };

}]);