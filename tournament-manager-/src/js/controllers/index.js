app.controller('indexCtrl', ['$scope', '$http','$rootScope','$location','$state','localStorageService', function($scope, $http,$rootScope,$location,$state,localStorageService)
{
  $scope.tournaments = {};

  //current rournaments
  $http({
    method: 'GET',
    url: $rootScope.apiAddress+'/tournaments/current/all?access_token=' + $rootScope.access_token
  }).then(function successCallback(r) {
    console.log(r.data);
    $scope.tournaments.current = r.data;
  }, function errorCallback(r) {
      console.log("Unable to retreive current tournaments");
  });

  //last finished
  $http({
    method: 'GET',
    url: $rootScope.apiAddress+'/tournaments/last/finished?access_token=' + $rootScope.access_token
  }).then(function successCallback(r) {
    console.log(r.data);
    $scope.tournaments.last = r.data;
  }, function errorCallback(r) {
      console.log("Unable to retreive last finished tournaments");
  });

  //top users
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
