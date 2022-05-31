# How to install on dokku

### Add a deployment user

Get access to the dokku repo, if you're new:

```bash
dokku@dokku1$ cat > newperson_rsa.pub
dokku@dokku1$ dokku ssh-keys:add newperson /root/newperson_rsa.pub
```

### Create application

```bash
dokku@dokku1$ dokku apps:create trials-tracker
local$ git clone git@github.com:ebmdatalab/trialstracker.git
local$ cd trialstracker
local$ git remote add dokku dokku@dokku1.ebmdatalab.net:trials-tracker
local$ git push dokku master
```

### Ports & domains

```bash
dokku@dokku1$ dokku domains:add trials-tracker trialstracker.ebmdatalab.net
```

### add datafile

Generate your data file (outside the scope of this document), and then move it into place:

```bash
dokku@dokku1$ mkdir -p /var/lib/dokku/data/storage/trials-tracker/data/
dokku@dokku1$ chown -R www-data:dokku /var/lib/dokku/data/storage/trials-tracker
dokku@dokku1$ dokku storage:mount trials-tracker /var/lib/dokku/data/storage/trials-tracker/data/:/usr/share/nginx/html/data/
dokku@dokku1$ cp completed.csv /var/lib/dokku/data/storage/trials-tracker/data/
```
