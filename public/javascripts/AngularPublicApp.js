                                                       //Now that we have ui-router included, we need to configure it. In our app.js, we're going to use the Angular config() function to setup a home state.
var app = angular.module('basicRedditClone', ['ui.router']);

app
    //*******************************************************************************************************************************CONFIG
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

            $stateProvider
                .state('accueil', {
                    url: '/accueil',
                    templateUrl: 'templates/accueil.html',
                    controller: 'ControlleurPrincipal',
                    //Le resolve est la promesse , affichera le contenu si le getAll s'execute bien
                    resolve: {
                                postPromise: ['postsFactory', function(posts){
                                    return posts.getAll();
                                }]
                            }
                })
                .state('posts', {
                    url: '/posts/:id',
                    templateUrl: 'templates/post-details.html',
                    controller: 'PostsCtrl',
                    resolve: {
                        post: ['$stateParams', 'postsFactory', function($stateParams, postsFactory) {
                            return postsFactory.get($stateParams.id);
                        }]
                    }
                });

            $urlRouterProvider.otherwise('accueil');
        }])
    //*******************************************************************************************************************************CONTROLLEUR
    // ***************************************************************************************ControlleurPrincipal
    .controller('ControlleurPrincipal', ['$scope','$filter','postsFactory',function($scope,$filter,postsFactory){
        // Vas chercher dans le factory les data
        $scope.posts = postsFactory.posts;
        console.log($scope.posts);
        var date= new Date;
        // Fn pour ajouter un post
        $scope.ajouterPost = function(){
            // Eviter que le user laisse le champs vide
            if(!$scope.titre || $scope.titre === '') { return; }
            // Ajouter au le post au tableau de posts   STATIQUE !!!!!!!
            //$scope.posts.push({
            //    id:$scope.posts.length,
            //    titre: $scope.titre,
            //    description:$scope.description,
            //    votesPositifs: 0,
            //    voteNegatifs: 0,
            //    lien:$scope.lien,
            //    date:date,
            //    comments: [
            //        {auteur: 'Joe', body: 'Cool post!', votePositifs: 0,voteNegatifs: 0},
            //        {auteur: 'Bob', body: 'Great idea but everything is wrong!', votePositifs: 0,voteNegatifs: 0}
            //    ]
            //});
            // Ajouter au le post au tableau de posts   DYNAMIQUE !!!!!!!

            postsFactory.create({
                titre: $scope.titre,
                description:$scope.description,
                votePositifs: 0,
                voteNegatifs: 0,
                lien:$scope.lien,
                date:date
            });
            // rendre les champs vide
            $scope.titre=''
            $scope.lien=''
            $scope.description=''
            //Appelle la directive pour cacher le formulaire
            $scope.cacherLaModal();
        };


        // Fn pour augmenter le vote d'un post
        $scope.AugmenterVotePositif = function(post) {
            postsFactory.plus(post);
        };
        // Fn pour diminuer le vote d'un post
        $scope.DiminuerVotePositif = function(post) {
            postsFactory.moins(post);
        };

        $scope.sortType     = 'date'; // set the default sort type
        $scope.sortReverse  = false;  // set the default sort order



      //  var orderBy = $filter('orderBy');
      //  //cette fn se retrouve dans le html, elle est appelée et recoit l'ordre de tri
      //  $scope.order = function(laFaconDeTrier) {
      //      $scope.posts = orderBy($scope.posts, laFaconDeTrier);
      //  };

}])
    // *****************************************************************************************************        PostsCtrl
    // On crée un controlleur pour les posts, à ce controlleur on injecte le factory posts pour avoir les data dispo
    .controller('PostsCtrl', ['$scope','$stateParams','postsFactory','post', function($scope, $stateParams, postsFactory,post){
        // Pour avoir l'id du post(bien faire attention au pluriel 's' ou pas 's')

        $scope.post = post;
        //$scope.post =  postsFactory.posts[$stateParams.id];
        //console.log($scope.post);
//
        //$scope.ajoutCommentaire = function(){
        //    // Si commentaire vide, ne fait rien
        //    if($scope.body === '' ||null) { return; }
        //    $scope.post.comments.push({
        //        body: $scope.body,
        //        auteur: 'user',
        //        voteNegatifs: 0,
        //        votePositifs: 0
        //    });
        //    $scope.body = '';
        //};

        $scope.AugmenterVotePositif = function(comment) {
            comment.votePositifs += 1;
        };
        // Fn pour diminuer le vote d'un post
        $scope.DiminuerVotePositif = function(comment) {
            comment.voteNegatifs += 1;
        };


        $scope.ajoutCommentaire = function(){
            if($scope.body === '') { return; }
            postsFactory.AjoutCommentaireDB(post._id, {
                body: $scope.body,
                auteur: 'user',
                voteNegatifs: 0,
                votePositifs: 0
            }).success(function(comment) {
                $scope.post.comments.push(comment);
            });
            $scope.body = '';
        };

        $scope.AugmenterVoteComPositif = function(comment){
            postsFactory.plusSurCommentaire(post, comment);
        };
        $scope.DiminuerVoteComPositif = function(comment){
            postsFactory.moinsSurCommentaire(post, comment);
        };
    }])


    // *****************************************************************************************************DIRECTIVES
    //Permet de cacher la modal à l'envoi du formu
    .directive('permetDeCacherLaModalAuSubmit', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            scope.cacherLaModal = function() {
                element.modal('hide');
            };
        }
    }
})
    // ******************************************************************************************FACTORY/SERVICE(l'usine, le constructeur) rappel les controlleur doivent etre léger, de ctrl à actions
    //Incovénient de stocker des data dans le controlleur :
            //when the controller goes out of scope, we lose the data
            //that data cannot be easily accessed from other controllers or directives
            //the data is difficult to mock, which is important when writing automated tests
    //Donc on crée un service
    // You may be wondering why we're using the keyword factory instead of service. In angular, factory and service are related in that they are both instances of a third entity called provider.
    //... someone trying to have persistent data in his or her controller. That’s just not the purpose of a controller
    //For memory purposes, controllers are instantiated only when they are needed and discarded when they are not. Because of this, every time you switch a route or reload a page, Angular
    //cleans up the current controller. Services however provide a means for keeping data around for the lifetime of an application while they also can be used across different controllers in a consistent manner.


    //Le service postsFactory
    .factory('postsFactory', ['$http',function($http){

        //You'll note that we could have simply exported the posts array directly,
        // however, by exporting an object that contains the posts array we can add new objects and methods to our services in the future.

       var o = {
           posts: []
       };

// Recuperer les data sur mongoDB
       o.getAll = function () {
           return $http.get('/posts')
               .success(function (data) {
                   angular.copy(data, o.posts);
               });
       };

// creer  des data pour un post sur mongoDB

        o.create = function(post) {
            return $http.post('/posts', post).success(function(data){
                o.posts.push(data);
            });
        };

  //Voter sur un post
        o.plus = function(post) {
            return $http.put('/posts/' + post._id + '/votePositifs')
                .success(function(data){
                    post.votePositifs += 1;
                });
        };
        //Votersur un post
        o.moins = function(post) {
            return $http.put('/posts/' + post._id + '/voteNegatifs')
                .success(function(data){
                    post.voteNegatifs += 1;
                });
        };

        //Recuperer les infos d'un post
        o.get = function(id) {
            return $http.get('/posts/' + id).then(function(res){
                return res.data;
            });
        };

        //Ajouter un commentaire
        o.AjoutCommentaireDB = function(id, comment) {
            return $http.post('/posts/' + id + '/comments', comment);
        };

        o.plusSurCommentaire = function(post, comment) {
            return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/voteSurComPositifs')
                .success(function(data){
                    comment.votePositifs += 1;
                });
        };
        o.moinsSurCommentaire = function(post, comment) {
            return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/voteSurComNegatifs')
                .success(function(data){
                    comment.voteNegatifs += 1;
                });
        };
        //*************************DATA STATIQUES
   //       var o={
   //           posts:[
   //            {"id":0,"titre": ' la chasse',"lien":"http://www.google.fr", "description":"Je suis 0 la description du post, je peux faire autant de caractères que je veux, je suis la description !!!!!! ", "voteNegatifs":1,"votesPositifs": 55,
   //                date:"2015-10-26T13:03:20.711Z",comments: [
   //                {auteur: 'Joe', body: 'Cool post!', votePositifs: 0,voteNegatifs: 0},
   //                {auteur: 'Bob', body: 'Great idea but everything is wrong!', votePositifs: 0,voteNegatifs: 0}
   //            ]},
   //            {"id":1,"titre": ' la voiture',"lien":"http://www.google.fr", "description":"Je suis 1 la description du post, je peux faire autant de caractères que je veux, je suis la description !!!!!! ", "voteNegatifs":1,"votesPositifs": 55,
   //                date:"2015-10-26T16:03:20.711Z",comments: [
   //                {auteur: 'Joe', body: 'Cool post!', votePositifs: 0,voteNegatifs: 0},
   //                {auteur: 'Bob', body: 'Great idea but everything is wrong!', votePositifs: 0,voteNegatifs: 0}
   //            ]},
   //            {"id":2,"titre": ' la course',"lien":"http://www.google.fr", "description":"Je suis 2 la description du post, je peux faire autant de caractères que je veux, je suis la description !!!!!! ", "voteNegatifs":1,"votesPositifs": 66,
   //                date:"2015-10-26T17:03:20.711Z",comments: [
   //                {auteur: 'Joe', body: 'Cool post!', votePositifs: 0,voteNegatifs: 0},
   //                {auteur: 'Bob', body: 'Great idea but everything is wrong!', votePositifs: 0,voteNegatifs: 0}
   //            ]},
   //            {"id":3,"titre": ' l\'aviation',"lien":"http://www.google.fr", "description":"Je suis 3 la description du post, je peux faire autant de caractères que je veux, je suis la description !!!!!! ", "voteNegatifs":1,"votesPositifs": 15,
   //                date:"2015-10-26T23:03:20.711Z",comments: [
   //                {auteur: 'Joe', body: 'Cool post!', votePositifs: 0,voteNegatifs: 0},
   //                {auteur: 'Bob', body: 'Great idea but everything is wrong!', votePositifs: 0,voteNegatifs: 0}
   //            ]},
   //            {"id":4,"titre": ' la danse',"lien":"http://www.google.fr", "description":"Je suis 4 la description du post, je peux faire autant de caractères que je veux, je suis la description !!!!!! ", "voteNegatifs":1,"votesPositifs":  9,
   //                date:"2015-10-26T21:03:20.711Z",comments: [
   //                {auteur: 'Joe', body: 'Cool post!', votePositifs: 0,voteNegatifs: 0},
   //                {auteur: 'Bob', body: 'Great idea but everything is wrong!', votePositifs: 0,voteNegatifs: 0}
   //            ]},
   //            {"id":5,"titre": ' la cuisine',"lien":"http://www.google.fr", "description":"Je suis 5 la description du post, je peux faire autant de caractères que je veux, je suis la description !!!!!! ", "voteNegatifs":111,"votesPositifs":4,
   //                date:"2015-10-26T11:03:20.711Z",comments: [
   //                {auteur: 'Joe', body: 'Cool post!', votePositifs: 0,voteNegatifs: 0},
   //                {auteur: 'Bob', body: 'Great idea but everything is wrong!', votePositifs: 0,voteNegatifs: 0}
   //            ]},
   //            {"id":6,"titre": ' le sport',"lien":"http://www.google.fr", "description":"Je suis 6 la description du post, je peux faire autant de caractères que je veux, je suis la description !!!!!! ", "voteNegatifs":1,"votesPositifs":  0,
   //                date:"2015-10-26T06:03:20.711Z",comments: [
   //                {auteur: 'Joe', body: 'Cool post!', votePositifs: 0,voteNegatifs: 0},
   //                {auteur: 'Bob', body: 'Great idea but everything is wrong!', votePositifs: 0,voteNegatifs: 0}
   //            ]},
   //            {"id":7,"titre": ' le web',"lien":"http://www.google.fr", "description":"Je suis 7 la description du post, je peux faire autant de caractères que je veux, je suis la description !!!!!! ", "voteNegatifs":15,"votesPositifs": 1,
   //                date:"2015-10-26T03:03:20.711Z",comments: [
   //                {auteur: 'Joe', body: 'Cool post!', votePositifs: 0,voteNegatifs: 0},
   //                {auteur: 'Bob', body: 'Great idea but everything is wrong!', votePositifs: 0,voteNegatifs: 0}
   //            ]}
   //        ]
   //};
        return o;
}]);

