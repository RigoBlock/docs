# Linode NodeBalancer

NodeBalancers are highly-available, managed, and cloud-based "load balancers as a service." They can adapt to any workload, from a blog to a large application cluster and beyond. These guides explain how to set up a NodeBalancer and configure the settings.

[https://www.linode.com/docs/platform/nodebalancer/](https://www.linode.com/docs/platform/nodebalancer/)

# Basic configuration

Set time zone and time synchronization:

    dpkg-reconfigure tzdata
    timedatectl set-ntp no
    apt-get install ntp -y

System update:

    apt-get update
    apt-get upgrade -y

Edit `/etc/hostname` and add the following:

	srv0x.endpoint.network

where `srv0x.endpoint.network` the machine hostname.

Edit `/etc/hosts` and add the following:

	serverip	srv0x.endpoint.network

where `serverip` is the public ip of the server and `srv0x.endpoint.network` the machine hostname.

Reboot.

# System tools

    apt-get install screen wget unison dstat software-properties-common -y

# Users

Parity will run under the user `rigoblock`

    adduser rigoblock

Edit `/home/rigoblock/.bashrc` and add the following alias:

    alias parity='echo "Please run ./cluster/start-parity.sh"'

Create a few folders that we will need later on:

	su - rigoblock -c "mkdir /home/rigoblock/logs"
	su - rigoblock -c "mkdir /home/rigoblock/cluster"

Create a SSH key for remote password less login. Do this on each server. For example if you are setting up srv03, on srv03 do the following:

    ssh-keygen
    ssh-copy-id -i /home/rigoblock/.ssh/id_rsa.pub 'srv01.endpoint.network' -p5555
	ssh-copy-id -i /home/rigoblock/.ssh/id_rsa.pub 'srv02.endpoint.network' -p5555

Check that you can connect without a password:

    ssh -p '5555' 'srv01.endpoint.network'
	ssh -p '5555' 'srv02.endpoint.network'

On servers srv01 and srv02 do the following:

	ssh-copy-id -i /home/rigoblock/.ssh/id_rsa.pub 'srv03.endpoint.network -p5555'

# SSH daemon

Edit `/etc/ssh/sshd_config` and change the following settings to:

    Port 5555
    PermitRootLogin no

Restart:

    service sshd restart

# Nginx

We will proxy to Parity with OpenResty but still we install the default Ubuntu nginx, should we need it.

Installation:

    apt-get install nginx-extras
    mkdir /etc/nginx/ssl/endpoint.network -p

Copy SSL certificates into `/etc/nginx/ssl/endpoint.network` folder. OpenResty will use these SSL certificates.

Protect the keys:

    chmod 0400 /etc/nginx/ssl/endpoint.network/*

Disable nxing service:

	service nginx stop
    update-rc.d -f nginx remove

# OpenResty

OpenResty® is a full-fledged web platform that integrates the standard Nginx core, LuaJIT, many carefully written Lua libraries, lots of high quality 3rd-party Nginx modules, and most of their external dependencies. It is designed to help developers easily build scalable web applications, web services, and dynamic web gateways.

[https://openresty.org/en/](https://openresty.org/en/)

## Installation

Source:

[https://openresty.org/en/installation.html](https://openresty.org/en/installation.html)

Instructions:

    wget -qO - https://openresty.org/package/pubkey.gpg | sudo apt-key add -
    
    # for installing the add-apt-repository command
    # (you can remove this package and its dependencies later):
    apt-get -y install software-properties-common
    
    # add the our official APT repository:
    add-apt-repository -y "deb http://openresty.org/package/ubuntu $(lsb_release -sc) main"
    
    # to update the APT index:
    apt-get update
    apt-get install openresty -y
	service openresty stop
	update-rc.d -f openresty remove
    cp /etc/init.d/openresty /etc/init.d/openresty-endpoint

Edit `/etc/init.d/openresty-endpoint` and add the following line after `DESC="full-fledged web platform"`

    DAEMON_OPTS="-c /home/rigoblock/openresty/conf/nginx.conf"

Edit #BEGIN INIT INFO and replace the text with the following:

    ### BEGIN INIT INFO
    # Provides:   openresty-endpoint
    # Required-Start:$local_fs $remote_fs $network $syslog $named
    # Required-Stop: $local_fs $remote_fs $network $syslog $named
    # Default-Start: 2 3 4 5
    # Default-Stop:  0 1 6
    # Short-Description: starts openresty-endpoint
    # Description:   starts openresty-endpoint using start-stop-daemon
    ### END INIT INFO

If you want it to run at start-up then enable `openresty-endpoint` service:

    systemctl enable openresty-endpoint

## Log rotation

Create a new logrotate config file:

    touch /etc/logrotate.d/openresty-endpoint

Edit `/etc/logrotate.d/openresty-endpoint` as follows:

    /home/rigoblock/openresty/logs/*.log {
	    daily
	    missingok
	    rotate 14
	    compress
	    delaycompress
	    notifempty
	    create 0640 www-data adm
	    sharedscripts
	    prerotate
	    if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
	    	run-parts /etc/logrotate.d/httpd-prerotate; \
	    fi \
	    endscript
	    postrotate
	    	invoke-rc.d openresty-endpoint rotate >/dev/null 2>&1
	    endscript
    }

# ProFTPd

Install ProFTPd:

    apt-get install proftpd -y

Connections will be allowed only over TLS.

Edit `/etc/proftpd/proftpd.conf` and uncomment `DefaultRoot ~` and `PassivePorts 49152 65534`.

Configure TLS:

	openssl req -x509 -newkey rsa:1024 -keyout /etc/ssl/private/proftpd.key -out /etc/ssl/certs/proftpd.crt -nodes -days 365
	chmod 0600 /etc/ssl/private/proftpd.key
	chmod 0640 /etc/ssl/private/proftpd.key

Edit `/etc/proftpd/tls.conf` and activate desired options.

Edit `/etc/proftpd/proftpd.conf` and uncomment the line:

    Include /etc/proftpd/tls.conf

Restart:

    service proftpd restart

# Firewall

We do not need ipv6, so edit `/etc/default/ufw` and and set the following to:

    IPV6=no

then edit `/etc/sysctl.conf` and set the followings to:

    net.ipv6.conf.all.disable_ipv6 = 1
    net.ipv6.conf.default.disable_ipv6 = 1
    net.ipv6.conf.lo.disable_ipv6 = 1

and:

    sysctl -p

Set default rules:

    ufw default allow outgoing
    ufw default deny incoming

Allow NTP:

`ufw allow ntp` 

Allow DNS:

    ufw allow out 53

Allow SSH:

    ufw allow 5555/tcp
	ufw allow 22/tcp

Allow FTP:

    ufw allow 21/tcp
	ufw allow 49152:65534/tcp

Allow HTTP and HTTPS:

    ufw allow 80/tcp
    ufw allow 443/tcp

Allow Parity ports (Kovan):

	ufw allow 8545/tcp
	ufw allow 8546/tcp
	ufw allow 30303

Allow Parity ports (Ropsten):

	ufw allow 8645/tcp
	ufw allow 8646/tcp
	ufw allow 31303
    ufw allow 453
    ufw allow 90

Enable the firewall:

    ufw enable

Check status:

	ufw status verbose




