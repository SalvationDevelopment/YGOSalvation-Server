app.controller('tournamentCtrl', ['$scope', '$http','$rootScope','$location','$state','localStorageService', function($scope, $http,$rootScope,$location,$state,localStorageService)
{
  $scope.tournamentOpt = {
    processing : false,
    buttonLabel : "S'inscrire",
    error : false,
    canSuscribe : false,
    isAdmin : false,
    canGenerate : false
  };

  $http({
    method: 'GET',
    url: $rootScope.apiAddress+'/tournaments/'+$state.params.id+'?access_token=' + $rootScope.access_token
  }).then(function successCallback(r) {
    $scope.tournament = r.data;
    console.log("TOURNAMENT");
    console.log(r.data);
    $scope.tournament.players_count = $scope.tournament.accounts.length;

    var i = _.findLastIndex($scope.tournament.accounts, { 'id': $scope.me.id });

    //check if current user is the admin
    if($scope.tournament.account.id === $scope.me.id){
      console.log("I am an admin");
      $scope.tournamentOpt.isAdmin = true;
      //the tournament is full and can be generated
      if($scope.tournament.players_count === $scope.tournament.player_max && $scope.tournament.state !== "Verrouillé"){
        console.log("Tournament is full, can be generated");
        $scope.tournamentOpt.canGenerate = true;
      }
    }

    //check if the user is already in the tournament
    if(i >= 0){
      $scope.tournamentOpt.canSuscribe = false;
      $scope.tournament.accounts[i].me = true;
    }
    else{
      if($scope.tournament.state === "Ouvert"){
        $scope.tournamentOpt.canSuscribe = true;
      }
    }

    //un suscribe from the tournament
    $scope.unsuscribe = function(){
      $http({
        method: 'DELETE',
        url: $rootScope.apiAddress+'/tournament/'+$state.params.id+'/unsubscribe?access_token='+ $rootScope.access_token,
        data : $scope.me
      }).then(function successCallback(r) {
        console.log("Unsuscribed");
        location.reload();
      }, function errorCallback(r) {
        console.log("Error while Unsuscribing");
      });
    }

    $scope.setReady = function(){
      $http({
        method: 'POST',
        url: $rootScope.apiAddress+'/battle/'+$scope.currentBattle.id+'/ready?access_token='+ $rootScope.access_token,
        data : $scope.me
      }).then(function successCallback(r) {
        $(".battle-alert").fadeOut();
      }, function errorCallback(r) {
        console.log("Error while try to set ready");
        console.log(r);
      });
    };

    $scope.setWin = function(){
      $http({
        method: 'POST',
        url: $rootScope.apiAddress+'/battle/'+$scope.currentBattle.id+'/win?access_token='+ $rootScope.access_token,
        data : $scope.me
      }).then(function successCallback(r) {
        $(".battle-alert").fadeOut();
      }, function errorCallback(r) {
        console.log("Error while try to set win");
        console.log(r);
      });
    };

    //retreive the tournament battle list
    $http({
      method: 'GET',
      url: $rootScope.apiAddress+'/tournaments/'+$state.params.id+'/battles?access_token=' + $rootScope.access_token
    }).then(function successCallback(r) {
      $scope.tournament.battles = r.data;
      console.log("Battles :");
      console.log(r.data);
      if($scope.tournament.state === "Verrouillé"){
        generateBracket($scope.tournament);
      }
    });

    //retreive current battle
    //retreive the tournament battle list
    $http({
      method: 'GET',
      url: $rootScope.apiAddress+'/tournaments/'+$state.params.id+'/current/battle?access_token=' + $rootScope.access_token
    }).then(function successCallback(r) {
      console.log("Current battle receive");
      if(r.data[0] !== undefined){
        $scope.currentBattle = r.data[0];
      }

    });

    console.log($scope.tournament);

  }, function errorCallback(r) {
      console.log("This tournament does no exist !");
      $state.go('main');
  });


  //join the tournament
  $scope.tournamentOpt.join = function(){
    if(!$scope.tournamentOpt.canSuscribe){
      return;
    }

    var obl = $scope.tournamentOpt.buttonLabel;
    $scope.tournamentOpt.buttonLabel = "Inscription...";
    $scope.tournamentOpt.processing = true;
    $http({
      method: 'POST',
      url: $rootScope.apiAddress+'/tournaments/'+$state.params.id+'/registers?access_token=' + $rootScope.access_token
    }).then(function successCallback(r) {
      location.reload();
      console.log(r.data);
    }, function errorCallback(r) {
        $scope.tournamentOpt.processing = false;
        $scope.tournamentOpt.buttonLabel = obl;
        console.log("Unable to register to this tournament");
    });
  }

  //join the tournament
  $scope.tournamentOpt.generate = function(){
    if(!$scope.tournamentOpt.canGenerate){
      return;
    }

    $http({
      method: 'POST',
      url: $rootScope.apiAddress+'/tournaments/'+$state.params.id+'/validates?access_token=' + $rootScope.access_token
    }).then(function successCallback(r) {
      location.reload();
    }, function errorCallback(r) {
        console.log("Unable to generate this tournament");
    });
  }

  function generateBracket(tournament){
    console.log("Generating bracket...");
      var data = {
          teams : [],
          results : []
        }

        //count the max number of rounds
        var max_round = 0;
        for (var i = 0; i < tournament.battles.length; i++) {

          if(tournament.battles[i].round > max_round){
            max_round = tournament.battles[i].round;
          }
        }

        // add the empty round array to the results list
        for (var i = 0; i < max_round; i++) {
          var t = [];
          data.results.push(t);
        }

        console.log(data);

        //loop on every battles
        for (var i = 0; i < tournament.battles.length; i++) {

          var finished = true;

          //add player to list only for round one, the plugin will do the rest
          if(tournament.battles[i].round === 1){
            var t = [tournament.battles[i].player_one.nickname,tournament.battles[i].player_two.nickname];
            data.teams.push(t);
          }

          //read and add the round results
          var roundIndex = tournament.battles[i].round-1;
          var battleScore = [0,1];
          //if their is no winner, stop all
          if(tournament.battles[i].winner === null || tournament.battles[i].player_one === null || tournament.battles[i].player_two === null){
            finished = false;
            battleScore = [0,0];
            data.results[roundIndex].push(battleScore);
          }

          // we assign the result depending of the winner
          if(finished){
            if(tournament.battles[i].winner === tournament.battles[i].player_one.id){
              battleScore = [1,0];
            }
          }

          if(data.results[roundIndex]){
            data.results[roundIndex].push(battleScore);
          }

        }


          $(function() {
            $('#bracket').bracket({init: data});
          });
        }

}]);
