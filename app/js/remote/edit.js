App.controller('commondController', ['$scope', '$http', 'ngDialog','$stateParams', function ($scope, $http, ngDialog,$stateParams) {

    $scope.commandName=$stateParams.commandName;
    if($scope.commandName!=null) {
        $.ajax({
            url: '/remote/command/view',
            method: 'POST',
            data: {
                commandName: $stateParams.commandName
            },
            async: false
        }).success(function (result) {
            if (result.success) {
                $scope.commandInfoList = result.data;
            }
        });
    }
    $scope.edit=function(commandDetail) {
        $.ajax({
            url: '/remote/command/update',
            method: 'POST',
            data:{
                commandName:$scope.commandName,
                par:commandDetail
            },
            async: false
        }).success(function (result) {
            if (result.success) {
                rzhdialog(ngDialog,"修改成功！","success");
            }
        });
    }

}]);


