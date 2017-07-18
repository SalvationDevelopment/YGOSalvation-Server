var app = angular.module('tournament', [
'ui.router',
'ui.bootstrap',
'LocalStorageModule'
    ]);

app.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /
  $urlRouterProvider.otherwise("/");
  //
  // Now set up the states
  $stateProvider
    .state('main', {
      url: "/",
      templateUrl: "views/index.html",
      reload:true
    })
    .state('login', {
      url: "/login",
      templateUrl: "views/login.html",
      controller : "loginCtrl"
    })
    .state('tournament', {
      url: "/tournament/{id:int}",
      templateUrl: "views/tournament/tournament.html",
      controller : "tournamentCtrl"
    })
    .state('tournamentList', {
      url: "/tournament/list",
      templateUrl: "views/tournament/list.html",
      controller : "tournamentListCtrl"
    })
    .state('tournamentNew', {
      url: "/tournament/new",
      templateUrl: "views/tournament/new.html",
      controller : "newTournamentCtrl"
    })
    .state('tournamentProfil', {
      url: "/tournament/edit",
      templateUrl: "views/tournament/edit.html",
      controller : "edittournamentCtrl"
    })
    .state('profil', {
      url: "/profil/{id:int}",
      templateUrl: "views/profil/profil.html",
      controller : "profilCtrl"
    })
    .state('profilList', {
      url: "/profil/list",
      templateUrl: "views/profil/list.html",
      controller : "profilListCtrl"
    })
    .state('editProfil', {
      url: "/profile/edit",
      templateUrl: "views/profil/edit.html",
      controller : "editProfilCtrl"
    });
});



app.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeHandler);
    }
  };
});

app.directive('fallbackSrc', function () {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        angular.element(this).attr("src", iAttrs.fallbackSrc);
      });
    }
   }
   return fallbackSrc;
});

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);

app.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('colab');
});

app.controller('mainCtrl', ['$scope', '$http','$rootScope','$location','$state','localStorageService', function($scope, $http,$rootScope,$location,$state,localStorageService)
{
  var apiAddress = "http://"+$location.host()+":"+$location.port()+"/api";
  var imgBasePath = "http://"+$location.host()+":"+$location.port()+"/image";
  var bannerBasePath = "http://"+$location.host()+":"+$location.port()+"/banners";

  $rootScope.apiAddress = apiAddress;
  $rootScope.imgBasePath = imgBasePath;
  $rootScope.bannerBasePath = bannerBasePath;

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    // called when a state change
  });
  $rootScope.$on('$stateChangeSuccess', function (event) {
    // called when a state has changed
  });

  $rootScope.logout = function(){
    localStorageService.remove("access_token");
    delete $rootScope.access_token;
    delete $rootScope.me;
    setTimeout(function(){
      location.reload();
    },500);
  }

  $rootScope.getImagePath = function(imgName){
    return imgBasePath+"/"+imgName;
  }

  $rootScope.getBannerPath = function(bannerName){
    return bannerBasePath+"/"+bannerName;
  }

  //check if the user is logged in and define the current one
  if(localStorageService.get("access_token")){

    console.log("Token is defined ... login the user...");

    $rootScope.access_token = localStorageService.get("access_token");
    $http({
      method: 'GET',
      url: $rootScope.apiAddress+'/me?access_token=' + $rootScope.access_token
    }).then(function successCallback(r) {
      console.log("... logged in successfully !");
      //token valid and user connected

      $rootScope.me = r.data;
      $rootScope.me.birth_date_o = $rootScope.me.birth_date;
      $rootScope.me.birth_date = new Date(moment($rootScope.me.birth_date).format("YYYY-MM-DD"));
      $rootScope.me.image = $rootScope.getImagePath(r.data.img);
      console.log($rootScope.me);

    }, function errorCallback(r) {

        console.log("... Invalid token !");

      //token is invalid, remove the token and logout the user
    });
  }

  $scope.notification = {
    unread : false
  }

  function checkNotif(){
    $http({
      method: 'GET',
      url: $rootScope.apiAddress+'/notification/last?access_token=' + $rootScope.access_token
    }).then(function successCallback(r) {
      console.log("Notif");
      if(r.data.length > 0){
        $scope.notification.data = r.data[0];
        $scope.notification.unread = true;
        console.log($scope.notification);
      }
    }, function errorCallback(r) {
        console.log("Unable to check for nnotification");
    });
  }



  $scope.notification.view = function(){
    $scope.notification.unread = false;
    $http({
      method: 'POST',
      url: $rootScope.apiAddress+'/notification/'+$scope.notification.data.id+'/seen?access_token=' + $rootScope.access_token
    }).then(function successCallback(r) {
      console.log("Notification set as read");
      $(".notification").addClass("slideOutRight").removeClass('slideInRight');
    }, function errorCallback(r) {
        console.log("Unable to set notification as read");
    });
  };

  //initialize Bootstrap components
  $(function () {
    //check notif on load and every 15 sec
    checkNotif();
    var r = setInterval(function(){
      checkNotif();
    },15000);

    $('[data-toggle="tooltip"]').tooltip()
  })

}]);
