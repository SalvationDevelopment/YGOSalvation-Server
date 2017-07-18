app.controller('profilCtrl', ['$scope', '$http','$rootScope','$location','$state','localStorageService', function($scope, $http,$rootScope,$location,$state,localStorageService)
{
  $scope.profil = {};
  $scope.avatarFile;
  $scope.isMine = false;
  if($rootScope.me){
    if($rootScope.me.id === $state.params.id){
      $scope.isMine = true;
    }
  }

  if($scope.isMine){
    $scope.profil = $scope.me;
  }
  else{
    $http({
      method: 'GET',
      url: $rootScope.apiAddress+'/accounts/'+$state.params.id+'?access_token=' + $rootScope.access_token
    }).then(function successCallback(r) {
      $scope.profil = r.data;
      console.log(r.data);
    }, function errorCallback(r) {
        console.log("This profil does no exist !");
        $state.go('main');
    });
  }

  //retreive comments
  console.log("Retreiving comments...");
  $http({
    method: 'GET',
    url: $rootScope.apiAddress+'/comments/'+$state.params.id+'?access_token=' + $rootScope.access_token
  }).then(function successCallback(rc) {
    $scope.profil.comments = rc.data;
    $scope.comment.processing = false;
    console.log(rc.data);
  }, function errorCallback(rc) {
      console.log("Unable to retreive profil comments");
  });

  $scope.comment = {
    processing : true,
    error : false,
    message : null
  }

  $scope.comment.post = function(){
    this.processing = true;
    this.error = false;
    $http({
      method: 'POST',
      data : $scope.comment,
      url: $rootScope.apiAddress+'/comments/'+$state.params.id+'?access_token=' + $rootScope.access_token
    }).then(function successCallback(r) {

      $scope.comment.processing = false;
      var c = {
        id : r.data.id,
        message : $scope.comment.message,
        send_by : $scope.me
      };
      $scope.profil.comments.push(c);
      if(!$scope.$$phase) {
				$scope.$apply();
			}
      $scope.comment.message = "";
    }, function errorCallback(r) {
      $scope.comment.processing = false;
      $scope.comment.error = "Une erreur s'est produite lors du post du commentaire";
    });
  };

  $scope.comment.delete = function(comment){
    if($scope.profil.id !== $rootScope.me.id){
      return;
    }

    $http({
      method: 'DELETE',
      url: $rootScope.apiAddress+'/comments/'+comment+'?access_token=' + $rootScope.access_token
    }).then(function successCallback(r) {
      $("#comment-"+comment).fadeOut();
    }, function errorCallback(r) {
      $scope.comment.processing = false;
      $scope.comment.error = "Une erreur s'est produite lors de la suppression du commentaire";
    });

  };

}]);
