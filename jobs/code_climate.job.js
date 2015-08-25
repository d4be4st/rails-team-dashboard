var request = require('request');

var token = process.env.CODELIMATE_API_KEY;
var host = 'https://codeclimate.com';

var repoCount = 0;

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
        repoCount = repos.length;

        for (var i = 0; i < repos.length; i++) {
          var repo = repos[i];
          // console.log("Sending: " + repo.url);
          getRepoStats(repo, repoObjects);
        }
      } else {
        console.log("CodeClimate server error: " + body);
        send_event('code_climate', { moreinfo: '- Server error -' });
      }
    }
  );
}

function publishData(repoObjects) {
  if (repoObjects.length < repoCount) {
    return;
  }

  repoObjects = repoObjects.sort(function(a, b) {
    if (a.score > b.score) return -1;
    if (a.score < b.score) return 1;
    return 0;
  });

  // console.log(repoObjects);

  send_event(
    'code_climate',
    {
      items: repoObjects.slice(0, 9),
      moreinfo: ''
    }
  );
}

function getRepoStats(repo, repoObjects) {
  request(
    repoPath(repo.id),
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var repoDetails = JSON.parse(body);
        var snapshot = repoDetails.last_snapshot;

        if (snapshot) {
          var gpa = snapshot.gpa || 0.0;
          var coverage = snapshot.covered_percent || 0.0;

          repoObjects.push(
            {
              title: repoDetails.name,
              gpa: '' + gpa + ' GPA',
              coverage: '' + coverage + '% COV',
              score: gpa + coverage
            }
          );
        } else {
          repoObjects.push(
            {
              title: repoDetails.name,
              gpa: '0.0 GPA',
              coverage: '0% COV',
              score: 0.0
            }
          );
        }

        publishData(repoObjects);
      } else {
        repoCount -= 1;
        publishData(repoObjects);
      }
    }
  );
}

updateCodeClimate();
setInterval(updateCodeClimate, 20 * 60 * 1000);
