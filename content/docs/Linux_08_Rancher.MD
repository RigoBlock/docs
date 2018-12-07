# Install Rancher

https://rancher.com/

## Install Docker

Rancher supports versions 1.11.x 1.12.x 1.13.x 17.03.x. It will not work with 18.03.1-ce or later.

As root:

    apt-get update
    apt-get install \
        apt-transport-https \
        ca-certificates \
        curl \
        software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    apt-key fingerprint 0EBFCD88
    add-apt-repository \
      "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) \
      stable"
    apt-get update
    apt-get install docker-ce=17.03.2~ce-0~ubuntu-xenial -y


## To Install Rancher Using a Let’s Encrypt Certificate:

Crete a directory for persistent data:

    mkdir -p /mnt/rancher-node
    mkdir -p /mnt/rancher-agent

### Install node    

Run the following commands from your Linux host:

    docker run -d --restart=unless-stopped \
      --name rancher-node \
      -p 80:80 -p 443:443 \
      -v /mnt/rancher-node:/var/lib/rancher \
      rancher/rancher:latest \
      --acme-domain rb-rancher.endpoint.network 

### Install agent

In the situation where you want to use a single node to run Rancher and to be able to add the same node to a cluster, you have to adjust the host ports mapped for the rancher/rancher container.

If a node is added to a cluster, it deploys the nginx ingress controller which will use port 80 and 443. This will conflict with the default ports we advice to expose for the rancher/rancher container.

Please note that this setup is not recommended for production use, but can be convenient for development/demo purposes.

To change the host ports mapping, replace the following part `-p 80:80 -p 443:443` with `-p 8080:80 -p 8443:443`:

    docker run -ti --restart=unless-stopped \
      --name rancher-agent \
      -p 8080:80 -p 8443:443 \
      -v /mnt/rancher-agent:/var/lib/rancher \
      rancher/rancher:latest

# Set-up

Browse to `https://rb-rancher.endpoint.network/`
      