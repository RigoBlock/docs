
# GlusterFS

GlusterFS is a scale-out network-attached storage file system. It has found applications including cloud computing, streaming media services, and content delivery networks. GlusterFS aggregates various storage servers over Ethernet or Infiniband RDMA interconnect into one large parallel network file system.

## Installation of a two node setup

Example setup:

- Minimum two separate storage (can be cloud or bare metal boxes)
- Each server needs a separate partition or disk for GlusterFS.
- A private network (LAN/VLAN) between servers
- Ubuntu Linux 16.04 LTS on both servers

The two servers have the following IPs:

    192.168.133.216		gfs01
    192.168.165.47		gfs02

First setup `/etc/hosts` files and set correct private IP address:

    192.168.133.216		gfs01
    192.168.165.47		gfs02

Check that both machines can see each other:

    ping -c2 gfs01
    ping -c2 gfs02

Configure iptables to accept all traffic between gfs01 and gfs02

Type the following on **gfs01** to allow all traffic from lan node gfs02:

    ufw allow proto any from 192.168.165.47 to 192.168.133.216

Type the following on **gfs02** to allow all traffic from lan node gfs01:

    ufw allow proto any from 192.168.133.216 to 192.168.165.47

Type the following command on both gfs01 and gfs02 server to install latest stable GlusterFS server:

    add-apt-repository ppa:gluster/glusterfs-3.11
    apt-get update
	apt-get install glusterfs-server -y

Your shared storage brick might corrupt if GlusterFS upgraded while running it. It is best to filter out of automatic updates for safety. Later you learn how to upgrade GlusterFS safety. Type the following command on both gfs01 and gfs02 server:

    apt-mark hold glusterfs*

We disable running the service on start-up as we want to have more control over it:

    systemctl disable glustereventsd

You need to type the following commands on gfs01 server (**be careful with device names while partition block devices**). `/dev/sdc` will be our block device for the cluster storage in both machines:

**gfs01**

    mkfs.ext4 /dev/sdc
    mkdir -p /nodirectwritedata/brick1
    echo '/dev/sdc /nodirectwritedata/brick1 ext4 defaults 1 2' >> /etc/fstab
    mount -a
    mkdir /nodirectwritedata/brick1/gvol0
    df -H

You need to type the following commands on gfs02 server:

**gfs02**

    mkfs.ext4 /dev/sdc
    mkdir -p /nodirectwritedata/brick2
    echo '/dev/sdc /nodirectwritedata/brick2 ext4 defaults 1 2' >> /etc/fstab
    mount -a
    df -H
    mkdir /nodirectwritedata/brick2/gvol0

**WARNING: Do not edit or write files directly to a /nodirectwritedata/brick1/ or /nodirectwritedata/brick2/ brick on each server. A direct write will corrupt your volume.**

Start GlusterFS service on both machines:

    service glustereventsd start
	service glustereventsd status

Configure the trusted pool:

From **gfs01** server type:

    gluster peer probe gfs02


From **gfs02** server type:

    gluster peer probe gfs01

Set up a GlusterFS volume from gfs01 (or gfs02) sever type:

    gluster volume create gvol0 replica 2 gfs01:/nodirectwritedata/brick1/gvol0 gfs02:/nodirectwritedata/brick2/gvol0

Start it:

    gluster volume start gvol0
    
Check the status:

    gluster volume status

To see info about your volume, enter:

    gluster volume info

We can now mount the volume:

**gfs01**

    mount -t glusterfs gfs01:/gvol0 /home/rigoblock/cluster/
	chown rigoblock:rigoblock cluster/

**gfs02**

    mount -t glusterfs gfs02:/gvol0 /home/rigoblock/cluster/
	chown rigoblock:rigoblock cluster/

Update the `/etc/fstab` file:

**gfs01**

    echo 'gfs01:/gvol0 /home/rigoblock/cluster/ glusterfs defaults,_netdev 0 0' >> /etc/fstab

**gfs02**

	echo 'gfs02:/gvol0 /home/rigoblock/cluster/ glusterfs defaults,_netdev 0 0' >> /etc/fstab

Finally run the following command on both gfs02 and gfs01 to set network ping timeout to 5 seconds from default 42:

    gluster volume set gvol0 network.ping-timeout "5"

Source:

[https://www.cyberciti.biz/faq/howto-glusterfs-replicated-high-availability-storage-volume-on-ubuntu-linux/](https://www.cyberciti.biz/faq/howto-glusterfs-replicated-high-availability-storage-volume-on-ubuntu-linux/)

# Adding a third node gfs03

On the new node run:

	add-apt-repository ppa:gluster/glusterfs-3.11
	apt-get update
	apt-get install glusterfs-server
	apt-mark hold glusterfs*

Format and setup the disk:

    mkfs.ext4 /dev/sdc
    mkdir -p /nodirectwritedata/brick3
    echo '/dev/sdc /nodirectwritedata/brick3 ext4 defaults 1 2' >> /etc/fstab
    mount -a
    mkdir /nodirectwritedata/brick3/gvol0
    df -H

Set firewall on the other nodes:

	ufw allow proto any from gfs03ip

Set firewall on gfs03:

	ufw allow proto any from gfs01ip
	ufw allow proto any from gfs02ip

Run the following command from any one of the node:

	gluster peer probe gfs03

Start GlusterFS service::

    service glustereventsd start
	service glustereventsd status

Add a new brick to an existing replicated volume:

	gluster volume add-brick gvol0 replica 3 gfs03:/nodirectwritedata/brick3/gvol0

Verify the new setup:

	gluster vol status
	gluster peer status

Update the `/etc/fstab` file and mount:

   	mkdir /mnt/cluster 
	echo 'gfs03:/gvol0 /mnt/cluster glusterfs defaults,_netdev 0 0' >> /etc/fstab
	mount -a

Source:

[https://www.cyberciti.biz/faq/howto-add-new-brick-to-existing-glusterfs-replicated-volume/](https://www.cyberciti.biz/faq/howto-add-new-brick-to-existing-glusterfs-replicated-volume/)

