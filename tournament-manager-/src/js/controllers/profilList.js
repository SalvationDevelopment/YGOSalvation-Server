app.controller('profilListCtrl', ['$scope', '$http','$rootScope','$location','$state','localStorageService', function($scope, $http,$rootScope,$location,$state,localStorageService)
{
  if(!$rootScope.me){
    $state.go('login');
  }

  $http({
    method: 'GET',
    url: $rootScope.apiAddress+'/accounts?access_token=' + $rootScope.access_token
  }).then(function successCallback(r) {
    $scope.profils = r.data;
    var t = _.orderBy($scope.profils, ['level.level'], ['desc']);
    $scope.topUsers = t.slice(0,5);
    console.log(r.data);
  }, function errorCallback(r) {
      console.log(r);
  });

}]);
