app.controller('newTournamentCtrl', ['$scope', '$http','$rootScope','$location','$state','localStorageService', function($scope, $http,$rootScope,$location,$state,localStorageService)
{

  //if not logged in, go to login page
  if(!$rootScope.me){
    $state.go('login');
    return;
  }

  $scope.tournament = {
    processing : false,
    buttonLabel : "Créer le tournoi",
    error : false,
    success : false
  }

  $scope.tournament.send = function(){
    var oldLabel = this.buttonLabel;
    this.processing = true;
    this.buttonLabel = "Patientez...";
    $http({
      method: 'POST',
      url: $rootScope.apiAddress+'/tournaments?access_token='+$rootScope.access_token,
      data : $scope.tournament
    }).then(function successCallback(r) {
      $scope.tournament.success = true;
      $state.go('tournament',{id : r.data.id});
    }, function errorCallback(r) {
      if(r.data.error){
        $scope.tournament.error = r.data.error.exception[0].message;
      }
      else{
        $scope.tournament.error = "Echec de la création du tournoi";
      }
      $scope.tournament.processing = false;
      $scope.tournament.buttonLabel = oldLabel;
    });
  };

}]);
