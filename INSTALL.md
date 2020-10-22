# How to install on dokku

### Add a deployment user

Get access to the dokku repo, if you're new:

```bash
root@dokku$ cat > newperson_rsa.pub
root@dokku$ dokku ssh-keys:add newperson /root/newperson_rsa.pub
```

### Create application

```bash
root@dokku$ dokku apps:create trialstracker
local$ git clone git@github.com:ebmdatalab/trialstracker.git
local$ cd trialstracker
local$ git remote add dokku dokku@DOKU_HOSTNAME:trialstracker
local$ git push dokku master
```

### Ports & domains

```bash
$ dokku domains:add trialstracker trialstracker-dokku.ebmdatalab.net 
```

### add datafile

Generate your data file (outside the scope of this document), and then move it into place:

```bash
root@dokku$ mkdir -p /var/lib/dokku/data/storage/trialstracker/data/
root@dokku$ chown -R www-data:dokku /var/lib/dokku/data/storage/trialstracker
root@dokku$ dokku storage:mount thedatalab /var/lib/dokku/data/storage/trialstracker/data/:/usr/share/nginx/html/data/
root@dokku$ cp completed.csv /var/lib/dokku/data/storage/trialstracker/data/
```
