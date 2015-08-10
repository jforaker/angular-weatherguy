
angular.module( 'ForecastIOService', [])

	.factory('ForecastIOService', function ForecastIOService($http, $q, FORECASTIO_KEY) {

		var baseurl = 'https://api.forecast.io/forecast/' + FORECASTIO_KEY + '/';

		var weather = {
			cached: []
		};
		var deferred = $q.defer();

		weather.api = function (successCB) {
			var url = 'https://api.forecast.io/forecast/c6ff3174b600aa0ebb178e6dbdc2f1cb/40.7657,-73.9158?callback=JSON_CALLBACK';
			$http.jsonp(url).success(function(data, status, headers, config) {
					deferred.resolve(data);
					weather.cached = data;
				})
				.error(function(data, status, headers, config) {
					deferred.resolve(data);
				});

			return deferred.promise;
		};

		weather.search = function() {
			return weather.api().then(function (response) {
				weather.cached = response;
				return response;
			});
		};

		weather.getAtLocation = function (lat, lng) {
			return $http.jsonp(baseurl + lat + ',' + lng + '?callback=JSON_CALLBACK');
		};

		return weather;
	})
;
