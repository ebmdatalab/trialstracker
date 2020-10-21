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
