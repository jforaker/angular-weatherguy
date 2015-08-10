angular.module( 'IconService', [])

	.factory('IconService', function IconService() {
		var icons = {};
		icons.get = function  (type) {
			var skyconMap = {
				'clear-day' : Skycons.CLEAR_DAY,
				'clear-night' : Skycons.CLEAR_NIGHT,
				'partly-cloudy-day' : Skycons.PARTLY_CLOUDY_DAY,
				'partly-cloudy-night' : Skycons.PARTLY_CLOUDY_NIGHT,
				'cloudy' : Skycons.CLOUDY,
				'rain' : Skycons.RAIN,
				'sleet' : Skycons.SLEET,
				'snow' : Skycons.SNOW,
				'wind' : Skycons.WIND,
				'fog' : Skycons.FOG
			};
			return skyconMap[type] || skyconMap['default'];
		};
		return icons;
	})
;
