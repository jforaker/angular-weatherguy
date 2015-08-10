
angular.module( 'ngBoilerplate.home', [
	'ui.router',
	'ForecastIOService',
	'IconService',
	'c3weather'
])

	.config(function config( $stateProvider ) {
		$stateProvider.state( 'home', {
			url: '/home',
			views: {
				"main": {
					controller: 'HomeCtrl',
					controllerAs: 'CurrentWeather',
					templateUrl: 'home/home.tpl.html'
				}
			},
			data:{ pageTitle: 'Home' },
			resolve: {
				searchData: function(ForecastIOService, $q) {
					return ForecastIOService.api().then(function (response) {
						return response;
					});
				}
			}
		});
	})

	.controller( 'HomeCtrl', function HomeController( $scope, Flickr, ForecastIOService, Geo, searchData, IconService ) {

		var vm = this;

		var id = 'city_' + Math.floor(Math.random()*100000)+1;
		var skykon = IconService.get(searchData.currently.icon);

		vm.weather = {
			forecast: {
				icon: skykon,
				iconSize: 100
			},
			data: {
				selectedInterval: '',
				currently: searchData.currently.data,
				summary: searchData.currently.summary,
				apparentTemperature: 'right now it is ' + searchData.currently.apparentTemperature,
				icon: searchData.currently.icon,
				location: searchData.location,
				_id: id,
				hourly: searchData.hourly.data,
				daily: searchData.daily.data,
				dailyIcon: searchData.daily.icon,
				dailySummary: searchData.daily.summary,
				minutely: searchData.minutely.data,
				minutelySummary: searchData.minutely.summary,
				minutelyIcon: searchData.minutely.icon
			}
		};

		vm.getCurrent = function (lat, lng, locString) {
			ForecastIOService.getAtLocation(lat, lng).then(function (resp) {
				$scope.current = resp.data;
				console.log('GOT CURRENT', $scope.current);
			}, function (error) {
				alert('Unable to get current conditions');
				console.error(error);
			});
		};

		vm.getBackgroundImage = function (lat, lng, locString) {
			Flickr.search(locString, lat, lng).then(function (resp) {
				var photos = resp.photos;
				if (photos.photo.length) {
					$scope.bgImages = photos.photo;
					console.log('photos.photo', photos.photo);
					//_this.cycleBgImages();
				}
			}, function (error) {
				console.error('Unable to get Flickr images', error);
			});
		};

		$scope.refreshData = function () {
			Geo.getLocation().then(function (position) {
				var lat = position.coords.latitude;
				var lng = position.coords.longitude;

				Geo.reverseGeocode(lat, lng).then(function (locString) {
					$scope.currentLocationString = locString;
					vm.getBackgroundImage(lat, lng, locString);
					console.log('lat, lng, locString', lat, lng, locString);
				});
				//_this.getCurrent(lat, lng);
			}, function (error) {
				alert('Unable to get current location: ' + error);
			});
		};

		$scope.refreshData();
	})
;

