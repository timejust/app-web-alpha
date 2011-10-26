INSTALL
=======

Prérequis :
 * Google :
  * Obtenir une clef google api pour le système d'autorisation
  OAuth (https://code.google.com/apis/console).
  * Configurer le "Redirect URIs" à `http://MY_HOST/oauth2/callback`
  * Ajouter les clefs google de cet environnement dans le fichier
  `config/configatron_data/gapps.yml` dans la section correspondant à
  l'environnement rails utilisé.
 * Dépendances logiciel :
  * Ruby 1.9
  * Rubygems
  * mongodb
   * Configuration dans config/mongoid.yml
  * redis
  * Sur un systeme Debian: `ruby1.9.1 ruby1.9.1-dev rubygems make libxml2-dev libxslt1-dev g++ git mongodb-server libcurl4-gnutls-dev redis-server`
 * Déploiement capistrano : (cap -T est votre ami pour la liste des tâches de déploiement disponibles)
  * Installer la gem capistrano sur le poste de déploiement.
  * Avoir accès au serveur en ssh pour le dépoiement capistrano.
  * Configurer le déploiement pour l'environnement voulu dans config/deploy/
  * lancer le setup de l'aplication via capistrano : cap {ENVIRONNEMENT} deploy:setup
  * lancer un déploiement du code et de l'application web : cap {ENVIRONNEMENT} deploy
  * lancer les workers resque : cap {ENVIRONNEMENT} resque:start
 * Virtual Host :
  * Exemple de virtual host Apache avec en mode recette, configuré sur l'environnement rail staging les thin étant configuré sur les ports 7001 et 7002 (avec htaccess) :

    <VirtualHost *:80>
        ServerName timejust-staging.af83.com
        ServerAlias api.timejust-staging.af83.com

        DocumentRoot /var/www/timejust/staging/timejust-api/current/public
        <Location />
        AuthName     "Private Area"
        AuthType     Basic
        AuthUserFile /var/www/timejust/htpasswd
        require valid-user
        </Location>

        <Location /gadget/>
            Order Deny,Allow
            Allow from all
            Satisfy any
        </Location>

        SetEnv proxy-initial-not-pooled 1
        SetEnv proxy-nokeepalive 1

        <Proxy balancer://main>
            BalancerMember http://127.0.0.1:7001 max=1 retry=5
            BalancerMember http://127.0.0.1:7002 max=1 retry=5
            ProxySet timeout=5 maxattempts=4 lbmethod=byrequests
            Allow from all
        </Proxy>

        RewriteEngine On

        RewriteCond %{DOCUMENT_ROOT}/%{REQUEST_FILENAME} !-f
        RewriteRule (.*) balancer://main$1 [P,L]

        ErrorLog  /var/log/apache2/timejust-staging.af83.com/error.log
        CustomLog /var/log/apache2/timejust-staging.af83.com/access.log combined
    </VirtualHost>


Exemple de virtual host Apache en mode production, les thin étant configuré sur les ports 7001 et 7002 :

    <VirtualHost *:80>
        ServerName timejust.com
        ServerAlias api.timejust.com

        DocumentRoot /var/www/timejust/prod/timejust-api/current/public

        SetEnv proxy-initial-not-pooled 1
        SetEnv proxy-nokeepalive 1

        <Proxy balancer://main>
            BalancerMember http://127.0.0.1:7001 max=1 retry=5
            BalancerMember http://127.0.0.1:7002 max=1 retry=5
            ProxySet timeout=5 maxattempts=4 lbmethod=byrequests
            Allow from all
        </Proxy>

        RewriteEngine On

        RewriteCond %{DOCUMENT_ROOT}/%{REQUEST_FILENAME} !-f
        RewriteRule (.*) balancer://main$1 [P,L]

        ErrorLog  /var/log/apache2/timejust.com/error.log
        CustomLog /var/log/apache2/timejust.com/access.log combined
    </VirtualHost>
