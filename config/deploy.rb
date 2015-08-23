require 'mina/git'
require 'mina/dotenv'
require 'mina/npm'

set :domain, '192.168.1.38'
set :deploy_to, '/home/pi/www/rails-team-dashboard'
set :repository, 'git@github.com:Stankec/rails-team-dashboard.git'
set :branch, 'master'
set :user, 'pi'
set :server_port, 80

set :shared_paths, ['node_modules', 'out.log']

task :environment do
end

task setup: :environment do
end

desc 'Deploys the current version to the server.'
task deploy: :environment do
  to :before_hook do
  end
  deploy do
    invoke :'git:clone'
    invoke :'deploy:link_shared_paths'
    invoke :'dotenv:push'
    invoke :'npm:install'
    invoke :'deploy:cleanup'

    to :launch do
      queue 'forever stop server.js'
      queue "PORT=#{server_port} forever start server.js"
    end
  end
end
