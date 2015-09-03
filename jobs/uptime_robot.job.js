var request = require('request');

var token = process.env.UPTIME_ROBOT_API_KEY;
var url = 'http://http://api.uptimerobot.com/getAccountDetails?noJsonCallback=1&format=json&apiKey=' + token;

var updateMonitors = function() {
  fetchAccountDetail();
};

function fetchAccountDetail(offset, monitors) {
  request(
    url,
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var accountDetail = JSON.parse(body);
        var upMonitors = parseInt(accountDetail.account.upMonitors);
        var downMonitors = parseInt(accountDetail.account.downMonitors);
        var pausedMonitors = parseInt(accountDetail.account.pausedMonitors);
        var totalMonitors = upMonitors + downMonitors + pausedMonitors;

        send_event(
          'up_monitors',
          {
            value: upMonitors,
            max: totalMonitors
          }
        );
        send_event(
          'down_monitors',
          {
            value: downMonitors,
            max: totalMonitors
          }
        );
        send_event(
          'paused_monitors',
          {
            value: pausedMonitors,
            max: totalMonitors
          }
        );
      }
    }
  );
}

updateMonitors();
setInterval(updateMonitors, 5 * 60 * 1000);
