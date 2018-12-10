---
title: "Kvm Server"
category: "kb"
---

# KVM web management (Kimchi)

    username: kimchi
    password: <ask to sysadmin>
    https://185.31.66.103:8001/ - node-01.endpoint.network

# DELL management

    iDRAC: https://185.31.66.102/
    OMSA: https://185.31.66.103:1311/

# Networking

    Netmask: 255.255.255.0
    GW: 185.31.66.1

    KVM host IP: 185.31.66.103

Available IPs:

    185.31.66.104
    185.31.66.105
    185.31.66.106
    185.31.66.107
    185.31.66.108
    185.31.66.109
    185.31.66.110
    185.31.66.111
    185.31.66.112
    185.31.66.113 - dev-04.endpoint.network - Stats collection server
    185.31.66.114 - dev-01.endpoint.network - Blockchain dev
    185.31.66.115 - dev-03.endpoint.network - Rancher
    185.31.66.116 - dev-01.endpoint.network - Blockchain dev
    185.31.66.117 - dev-02.endpoint.network - Flynn

# Server installation

## Initial configuration

Installing some useful packages

    yum update
    yum upgrade
    yum install nano wget perl screen mailx lsof dstat -y
    yum install dkms gcc make kernel-devel perl -y
    yum install dbus dmidecode dnsmasq ebtables libcgroup lzop nfs-utils numad polkit radvd libnl numactl netcf-libs libpcap -y
    yum install compat-libstdc++-33.i686 libstdc++.i686 libxml2.i686 nano -y
    yum install ntp system-config-date lvm2 -y
    yum install unison227 -y
    yum install vsftpd -y
    yum install e4fsprogs -y
    ln -s /sbin/resize2fs /sbin/resize4fs


Disable selinux

    setenforce 0
    sed -i --follow-symlinks 's/^SELINUX=.*/SELINUX=disabled/g' /etc/sysconfig/selinux


Configuring FTP:

    openssl req -x509 -nodes -days 3650 -newkey rsa:1024 \
    -keyout /etc/vsftpd/vsftpd.pem \
    -out /etc/vsftpd/vsftpd.pem

Configuring NTP:

    chkconfig --levels 235 ntpd on
    ntpdate 0.pool.ntp.org
    /etc/init.d/ntpd start
    system-config-date

Configuring the text editor:

    export VISUAL="nano"
    export EDITOR="nano"
    echo "set nowrap" >>/etc/nanorc
    cat <<EOF >>/etc/profile.d/nano.sh
    export VISUAL="nano"
    export EDITOR="nano"
    EOF

Centos changed the naming conventions for eth cards. Renaming em1 to eth0, and em2 to eth1.

Edit the Grub configuration file :

    nano /etc/default/grub

Locate the line “GRUB_CMDLINE_LINUX=” and append the following parameter :

    net.ifnames=0 biosdevname=0

Rebuild the Grub configuration :

    grub2-mkconfig -o /boot/grub2/grub.cfg

Copy the network configuration file, matching the new interface name :

    mv /etc/sysconfig/network-scripts/ifcfg-em1 /etc/sysconfig/network-scripts/ifcfg-eth0
    mv /etc/sysconfig/network-scripts/ifcfg-em2 /etc/sysconfig/network-scripts/ifcfg-eth1

Edit the net interface configuration :

    nano /etc/sysconfig/network-scripts/ifcfg-eth0
    nano /etc/sysconfig/network-scripts/ifcfg-eth1

Check the following files and add/modify as necessary:

    /etc/hosts
    /etc/sysconfig/network
    /etc/sysconfig/network-scripts/ifcfg-eth0
    /etc/sysconfig/network-scripts/ifcfg-eth1

## DELL server management tools

Documentation:

http://linux.dell.com/repo/hardware/latest/
https://linux.dell.com/repo/hardware/dsu/

    wget -q -O - http://linux.dell.com/repo/hardware/latest/bootstrap.cgi | bash
    yum install srvadmin-all
    yum install dell-system-update
    srvadmin-services.sh restart
    dsu

    adduser whitenoise
    nano /etc/sysctl.conf

    net.ipv4.conf.all.rp_filter=1
    net.ipv4.icmp_echo_ignore_broadcasts=1
    net.ipv4.ip_forward=1
    net.ipv6.conf.all.forwarding=1
    net.ipv4.conf.default.proxy_arp=1
    sysctl -p

## bcache

### Installation

Documentation:
https://wiki.archlinux.org/index.php/Bcache#Setting_up_a_bcache_device_on_an_existing_system  https://fedoraproject.org/wiki/QA:Testcase_bcache-tools_home_on_bcache_(LVM)

Add a LVM partition in /dev/sda4 with fdisk

    fdisk /dev/sda
    partprobe

Installing lastest kernel with bcache support:

    yum -y install
    rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
    rpm -Uvh http://www.elrepo.org/elrepo-release-7.0-2.el7.elrepo.noarch.rpm
    yum repolist
    yum --enablerepo=elrepo-kernel install kernel-ml
    awk -F\' '$1=="menuentry " {print i++ " : " $2}' /etc/grub2.cfg
    grub2-set-default 0
    reboot

Installing bcache-tools:

    yum install git libuuid libuuid-devel
    yum install libblkid libblkid-devel
    git clone http://evilpiepirate.org/git/bcache-tools.git
    cd bcache-tools
    make
    sudo make install

### Configuration

Backing device (HDD): /dev/sda4
Caching device (SSD): /dev/sdb

Creating backing and caching device:

    make-bcache -B /dev/sda4 --wipe-bcache
    make-bcache -C /dev/sdb --wipe-bcache

After your cache device and backing device are registered, the backing device
must be attached to your cache set to enable caching.
Attaching a backing
device to a cache set is done thusly, with the UUID of the cache set in
/sys/fs/bcache:

    bcache-super-show /dev/sdb | grep cset.uuid
    echo cset.uuid > /sys/block/bcache0/bcache/attach
    echo writeback > /sys/block/bcache0/bcache/cache_mode
    cat /sys/block/bcache0/bcache/state

 ### Removing bcache

    cd /sys/fs/bcache/<UUID>
    echo 1 > stop
    echo 1 >/sys/block/bcache0/bcache/stop
    dd if=/dev/zero if=/dev/sdb bs=512 count=8
    dd if=/dev/zero if=/dev/sda4 bs=512 count=8

## LVM

Setting up LVM

    pvcreate /dev/bcache0
    vgcreate vg_kvm /dev/bcache0

## KVM and Kimchi

Installation:

    yum -y install qemu-kvm libvirt virt-install bridge-utils bind-utils \
    virt-manager wget net-tools virt-viewer genisoimage epel-release
    systemctl start libvirtd
    systemctl enable libvirtd
    systemctl disable firewalld
    systemctl stop firewalld


Now we'll bridge your primary network interface. This bridge will also be used for our virtual machines. In this example we'll create a bridge named "bridge0". We'll then bridge interface "eth0" to "bridge0" followed by a server reboot.

Copy ifcfg-eth0 to ifcfg-bridge0:

    cp /etc/sysconfig/network-scripts/ifcfg-eth0 /etc/sysconfig/network-scripts/ifcfg-bridge0

Edit /etc/sysconfig/network/network-scripts/ifcfg-bridge0.

Change DEVICE=eth0 to DEVICE=bridge0
Change TYPE=Ethernet to TYPE="Bridge"

      DEVICE=bridge0
      ONBOOT=yes
      TYPE="Bridge"
      BOOTPROTO=none
      IPADDR=10.41.175.178
      NETMASK=255.255.255.0
      DNS1=4.2.2.2
      DNS2=8.8.8.8

Edit /etc/sysconfig/network-scripts/ifcfg-eth0 and bridge it to bridge0

      DEVICE=eth0
      ONBOOT=yes
      TYPE=Ethernet
      BOOTPROTO=none
      BRIDGE="bridge0"
      DNS1=4.2.2.2
      DNS2=8.8.8.8

Restart the network:

    service network restart

Kimchi:

    cd /tmp
    wget http://kimchi-project.github.io/wok/downloads/latest/wok.el7.centos.noarch.rpm
    wget http://kimchi-project.github.io/gingerbase/downloads/latest/ginger-base.el7.centos.noarch.rpm
    wget http://kimchi-project.github.io/kimchi/downloads/latest/kimchi.el7.centos.noarch.rpm
    yum -y install wok.el7.centos.noarch.rpm
    yum -y install ginger-base.el7.centos.noarch.rpm
    yum -y install kimchi.el7.centos.noarch.rpm
    sed -i  's/^#session_timeout = .*/session_timeout = 1440/g' /etc/wok/wok.conf
    systemctl enable wokd
    systemctl start wokd

Adding non-root user for Kimchi access:

    useradd -s /bin/false kimchi
    passwd kimchi
    visudo

Add:

    kimchi ALL=(ALL)        NOPASSWD: ALL

Edit `/etc/nginx/conf.d/wok.conf` and add in `server` section:

    server_name  YOUR_KVM_SERVER_DOMAIN_NAME;

Also comment out any existing SSL configuration line.

Reload nginx:

    systemctl reload nginx

Creating a SSL certificate with Let's Encrypt:

    yum install certbot-nginx -y
    certbot --nginx -d YOUR_KVM_SERVER_DOMAIN_NAME

Updating Diffie-Hellman Parameters. Edit `/etc/nginx/conf.d/wok.conf` and past the following line anywhere within the `server` block:

    ssl_dhparam /etc/ssl/certs/dhparam.pem;

Save the file and quit your editor, then verify the configuration:

    nginx -t

Restart nginx:

    service nginx restart

Setting Up Auto Renewal:

    crontab -e

Add:

    15 3 * * * /usr/bin/certbot renew --quiet

Finally:

Go to https://YOUR_KVM_SERVER_DOMAIN_NAME:8001 in your web browswer and login using kimchi or root credentials.













