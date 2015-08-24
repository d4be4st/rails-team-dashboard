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
          count = Math.floor(daysUntill);
          measure = count === 1 ? 'day' : 'days';
          nextMeetupString = '' + count + ' ' + measure;
        } else if (hoursUntill > 0) {
          count = Math.floor(hoursUntill);
          measure = count === 1 ? 'hour' : 'hours';
          nextMeetupString = '' + count + ' ' + measure;
        } else if (minutesUntill > 0) {
          count = Math.floor(minutesUntill);
          measure = count === 1 ? 'minute' : 'minutes';
          nextMeetupString = '' + count + ' ' + measure;
        }

        send_event('nextmeetup', { current: nextMeetupString });
      }
    }
  );
};

updateMeetup();
setInterval(updateMeetup, 5 * 60 * 1000);
