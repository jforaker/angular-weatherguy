angular.module( 'weatherguy', [
	'templates-app',
	'templates-common',
	'ngBoilerplate.home',
	'ngBoilerplate.about',
	'ngResource',
	'ui.router',
	'angular-skycons',
	'IconService',
	'ForecastIOService',
	'FlickrService',
	'GeoService'
])

	.constant('FORECASTIO_KEY', '4cd3c5673825a361eb5ce108103ee84a')

	.constant('FLICKR_API_KEY', '504fd7414f6275eb5b657ddbfba80a2c')

	.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
		$urlRouterProvider.otherwise( '/home' );
	})

	.run( function run () {

	})

	.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
		$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
			if ( angular.isDefined( toState.data.pageTitle ) ) {
				$scope.pageTitle = toState.data.pageTitle + ' | ngBoilerplate' ;
			}
		});
	})

;

