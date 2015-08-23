var request = require('request');
var htmlparser = require('htmlparser');
var select = require('soupselect').select;

var lang = 'ruby';
var period = 'dayly';
var url = 'https://github.com/trending?l=' + lang + '&since=' + period;

var blacklist = [
  'rails/rails',
  'Homebrew/homebrew',
  'mitchellh/vagrant',
  'gitlabhq/gitlabhq',
  'venmo/slather', // iOS Testing Tool
  'venmo/synx', // iOS
  'jekyll/jekyll',
  'ruby/ruby',
  'twbs/bootstrap-sass',
  'KrauseFx/fastlane', // iOS Deployment Tool
  'sass/sass',
  'plataformatec/devise',
  'discourse/discourse',
  'middleman/middleman',
  'fastlane/gym', // iOS Tool
  'sinatra/sinatra',
  'CocoaPods/CocoaPods'
];

var getTrending = function() {
  request(
    url,
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        parseTrending(body);
      }
    }
  );
};

function parseTrending(body) {
  var handler = new htmlparser.DefaultHandler(function (error, dom) {
    if (!error) {
      var repos = [];

      select(dom, "ol.repo-list li.repo-list-item").forEach(function(element) {
        var repo = {};

        select(element, ".repo-list-name a").forEach(function(subElement) {
          if (subElement.attribs && subElement.attribs.href) {
            repo.name = subElement.attribs.href.substring(1);
          }
        });

        select(element, ".repo-list-meta").forEach(function(subElement) {
          var meta = "";
          for (var i = 0; i < subElement.children.length; i++) {
            var child = subElement.children[i];

            if (child.type === 'text') {
              meta += child.raw;
            }
          }

          meta = meta.trim().split("&#8226;");

          if (meta.length < 3) {
            repo.star_count = 0;
          } else {
            repo.star_count = parseInt(meta[1].trim().split(' ')[0]);
          }
        });

        select(element, ".repo-list-description").forEach(function(subElement) {
          var description = "";
          for (var i = 0; i < subElement.children.length; i++) {
            var child = subElement.children[i];

            if (child.type === 'text') {
              description += child.raw;
            } else {
              description += '<' + child.raw + '>';
            }
          }

          repo.description = description.trim();
        });

        repos.push(repo);
      });

      repos = repos.sort(function(a, b) {
        if (a.star_count > b.star_count) return -1;
        if (a.star_count < b.star_count) return 1;
        return 0;
      });

      for (var i = 0; i < repos.length; i++) {
        var repo = repos[i];

        var index = blacklist.indexOf(repo.name);
        if (index > -1) {
          repos.splice(i, 1);
          i -= 1;
        }
      }

      send_event('github_trending', { items: repos.slice(0, 4) });
    }
  });

  var parser = new htmlparser.Parser(handler);

  parser.parseComplete(body);
}

getTrending();
setInterval(getTrending, 3 * 60 * 60 * 1000);
