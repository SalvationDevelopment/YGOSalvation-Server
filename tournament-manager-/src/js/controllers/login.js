app.controller('loginCtrl', ['$scope', '$http','$rootScope','$location','$state','localStorageService', function($scope, $http,$rootScope,$location,$state,localStorageService)
{
  $scope.login = {
    processing : false,
    buttonLabel : "Connexion",
    error : false
  };

  $scope.signup = {
    processing : false,
    buttonLabel : "Créer mon compte",
    error : false,
    success : false
  }

  $scope.login.send = function(){
    var oldLabel = this.buttonLabel;
    this.processing = true;
    this.buttonLabel = "Patientez...";
    $http({
      method: 'POST',
      url: $rootScope.apiAddress+'/login_check',
      data : $scope.login
    }).then(function successCallback(r) {
      localStorageService.set("access_token", r.data.token);
      $state.go('main');
      setTimeout(function(){
        location.reload();
      },500);
    }, function errorCallback(r) {
      $scope.login.error = "Echec de la connexion";
      $scope.login.processing = false;
      $scope.login.buttonLabel = oldLabel;
    });
  };


  $scope.signup.send = function(){
    var oldLabel = this.buttonLabel;
    this.processing = true;
    this.buttonLabel = "Patientez...";
    $http({
      method: 'POST',
      url: $rootScope.apiAddress+'/accounts',
      data : $scope.signup
    }).then(function successCallback(r) {
      $rootScope.access_token = r.data.token;
      localStorageService.set("access_token", r.data.token);
      $scope.signup.success = true;
    }, function errorCallback(r) {
      if(r.data.error){
        $scope.signup.error = r.data.error.exception[0].message;
      }
      else{
        $scope.signup.error = "Echec de l'inscription";
      }
      $scope.signup.processing = false;
      $scope.signup.buttonLabel = oldLabel;
    });
  };

}]);
