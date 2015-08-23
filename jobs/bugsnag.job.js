var request = require('request');

var token = process.env.BUGSNAG_API_KEY;
var url = 'https://api.bugsnag.com/accounts/508ea9d12511bbfe2300001a/projects?per_page=100';

var headers = {
  'Authorization': 'token ' + token,
};
var requestOptions = {
  url: url,
  method: 'GET',
  headers: headers
};

var updateBugsnag = function() {
  request(
    requestOptions,
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var errorsPerProject = [];
        var projects = JSON.parse(body);


        for (var i = 0; i < projects.length; i++) {
          var project = projects[i];
          getErrorCountForProject(projects, project, errorsPerProject);
        }


      }
    }
  );
};

function getErrorCountForProject(projects, project, errorsPerProject) {
  request(
    {
      url: project.errors_url + '?per_page=100&status=open',
      headers: headers
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        errorsPerProject.push(
          {
            label: project.name,
            value: JSON.parse(body).length
          }
        );

        if (projects.length === errorsPerProject.length) {
          errorsPerProject = errorsPerProject.sort(function(a, b) {
            if (a.value > b.value) return -1;
            if (a.value < b.value) return 1;
            return 0;
          });

          send_event('bugsnag', { items: errorsPerProject.slice(0, 18) });
        }
      }
    }
  );
}


updateBugsnag();
setInterval(updateBugsnag, 10 * 60 * 1000);
