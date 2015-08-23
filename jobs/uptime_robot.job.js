var request = require('request');

var token = process.env.UPTIME_ROBOT_API_KEY;
var url = 'http://api.uptimerobot.com/getMonitors?noJsonCallback=1&customUptimeRatio=30&format=json&apiKey=' + token;

var updateMonitors = function() {
  var monitors = [];
  fetchMonitors(0, monitors);
};

function fetchMonitors(offset, monitors) {
  request(
    url + '&offset=' + offset,
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var monitorList = JSON.parse(body);
        monitors = monitors.concat(monitorList.monitors.monitor);
        var total = parseInt(monitorList.total);

        if (monitors < total) {
          fetchMonitors(offset + 50, monitors);
          return;
        }

        var upMonitors = 0;
        var downMonitors = 0;

        for (var i = 0; i < monitors.length; i++) {
          if (monitors[i].status === '2') {
            upMonitors++;
          }
          else if (monitors[i].status === '8' || monitors[i].status === '9') {
            downMonitors++;
          }
        }

        send_event(
          'up_monitors',
          {
            value: upMonitors,
            max: upMonitors + downMonitors
          }
        );
        send_event(
          'down_monitors',
          {
            value: downMonitors,
            max: upMonitors + downMonitors
          }
        );
        send_event(
          'paused_monitors',
          {
            value: total - (downMonitors + upMonitors),
            max: total
          }
        );
      }
    }
  );
}

updateMonitors();
setInterval(updateMonitors, 5 * 60 * 1000);
