var request = require('request');

var token = process.env.MEETUP_API_KEY;
var url = 'https://api.meetup.com/2/events?&group_id=13140052&page=1&key=' + token;

var updateMeetup = function() {
  request(
    url,
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var meetup = JSON.parse(body);


        var nextMeetupTime = Number(meetup.results[0].time);
        var currentTime = new Date().getTime();
        var deltaTime = nextMeetupTime - currentTime;

        var minInMillis = 60 * 1000;
        var hourInMillis = 60 * minInMillis;
        var dayInMillis = 24 * hourInMillis;

        var daysUntill = deltaTime / dayInMillis;
        var hoursUntill = (deltaTime - daysUntill * dayInMillis) / hourInMillis;
        var minutesUntill = (deltaTime - daysUntill * dayInMillis - hoursUntill * hourInMillis) / minInMillis;

        nextMeetupString = '- TBA -';

        if (daysUntill > 0) {
          nextMeetupString = '' + Math.floor(daysUntill) + ' days';
        } else if (hoursUntill > 0) {
          nextMeetupString = '' + Math.floor(hoursUntill) + ' days';
        } else if (minutesUntill > 0) {
          nextMeetupString = '' + Math.floor(minutesUntill) + ' minutes';
        }

        send_event('nextmeetup', { current: nextMeetupString });
      }
    }
  );
};

updateMeetup();
setInterval(updateMeetup, 5 * 60 * 1000);
