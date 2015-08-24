var request = require('request');

var token = process.env.CODELIMATE_API_KEY;
var host = 'https://codeclimate.com';

function reposPath() {
  return host + '/api/repos' + '?api_token=' + token;
}

function repoPath(repo_id) {
  return host + '/api/repos/' + repo_id + '?api_token=' + token;
}

function updateCodeClimate() {
  request(
    reposPath(),
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var repoObjects = [];
        var repos = JSON.parse(body);

        for (var i = 0; i < repos.length; i++) {
          var repo = repos[i];
          getRepoStats(repos, repo, repoObjects);
        }
      }
    }
  );
}

function getRepoStats(repos, repo, repoObjects) {
  request(
    repoPath(repo.id),
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var repoDetails = JSON.parse(body);

        if (repoDetails.last_snapshot) {
          var snapshot = repoDetails.last_snapshot;

          repoObjects.push(
            {
              title: repoDetails.name,
              gpa: '' + (snapshot.gpa || 0.0) + ' GPA',
              coverage: '' + (snapshot.covered_percent || 0.0) + '% COV',
              security: 0.0
            }
          );
        }

        if (repoObjects.length < repos.length) {
          return;
        }

        repoObjects = repoObjects.sort(function(a, b) {
          var aScore = a.gpa + a.coverage + a.security;
          var bScore = b.gpa + b.coverage + b.security;

          if (aScore > bScore) return -1;
          if (aScore < bScore) return 1;
          return 0;
        });


        send_event('code_climate', { items: repoObjects.slice(0, 9) });
      }
    }
  );
}

updateCodeClimate();
setInterval(updateCodeClimate, 1 * 60 * 60 * 1000);
