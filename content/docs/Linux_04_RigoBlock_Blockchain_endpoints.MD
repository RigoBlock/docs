# Servers

We are running a cluster of Parity client for the production environment. These instances are running with flag `--public-node`, which means that there are no accounts stored locally on the client. They only act as a gateway to the blockchain.

We are currently supporting Kovan and Ropsten networks.

With regards to development, we are running a single node with support for Kovan and Ropsten networks. The Parity UI is exposed remotely and be accessed with credential supplied by the sysadmin. This node has a test account.

Parity documentation: https://wiki.parity.io/  
Web3 documentation: https://web3js.readthedocs.io/en/1.0/index.html

HTTPs and Wss endpoints:

```javascript
    https: {
        kovan: {
            dev: "https://srv03.endpoint.network:8545",
            prod: "https://kovan.endpoint.network:8545"
        },
        ropsten: {
            dev: "https://srv03.endpoint.network:8645",
            prod: "https://ropsten.endpoint.network:8645"
        },
        mainnet: {
            dev: "https://srv03.endpoint.network:8745",
            prod: "https://mainnet.endpoint.network:8745"
        },
    },
    wss: {
        kovan: {
            dev: "wss://srv03.endpoint.network:8546",
            prod: "wss://kovan.endpoint.network:8546"
        },
        ropsten: {
            dev: "wss://srv03.endpoint.network:8646",
            prod: "wss://ropsten.endpoint.network:8646"
        },
        mainnet: {
            dev: "wss://srv03.endpoint.network:8746",
            prod: "wss://mainnet.endpoint.network:8746"
        },
    }
```

## Production

Parity UI:

Kovan: https://kovan.endpoint.network/  
Ropsten: https://ropsten.endpoint.network:453


`bal-endpoing` load balance traffic to `srv01-endpoint` and `srv02-endpoint` backends.  
On each backend Nginx reverse proxy the traffic to the local Parity instance.

### bal-endpoint

    Hosts: kovan.endpoint.network  
    Public IP: 185.3.93.109  

Services:

    LoadBalancer
  
### srv01-endpoint

    Hosts: kovan01.endpoint.network / srv01.endpoint.network    
    Public IP:	139.162.250.237  
    Private IP:	192.168.133.216 

Ethereum networks: 

    Kovan, Ropsten  

Services: 

    nginx reverse proxy, Parity
  
### srv02-endpoint

    Hosts: kovan02.endpoint.network / srv02.endpoint.network    
    Public IP: 176.58.113.96  
    Private IP: 192.168.165.47  

Ethereum network: 

    Kovan, Ropsten 

Services: 

    nginx reverse proxy, Parity

## Development

Parity UI:

Kovan: https://srv03.endpoint.network/  
Ropsten: https://srv03.endpoint.network:453/

  
### srv03-endpoint

    Hosts: kovan03.endpoint.network / srv03.endpoint.network   
    Public IP: 139.162.238.183  
    Private IP: 192.168.205.249 

Ethereum network: 

    Kovan, Ropsten 

Services: 

    nginx reverse proxy, Apache web server, MySQL, Parity


Parity and Nginx configuration file are available on this Git inside the [cluster-config](https://github.com/RigoBlock/Books/tree/master/cluster-config) folder.

# Logins

Login credentials for each server:

SSH:  

	username: rigoblock  
	Port: 5555

FTP:  

	username: rigoblock


# Cluster configuration

## Folder structure

Folder structure of `/home/rigoblock`

    ├── cluster
    │   └── parity-config
    │   	├── dapps
    │   	├── keys
    │   	│   └── kovan
    │   	└── signer
    ├── logs
    ├── openresty
    │   ├── conf
    │   │   ├── conf.d
    │   │   ├── sites-available
    │   │   ├── sites-enabled
    │   │   └── snippets
    │   └── logs
    └── scripts

### ├── cluster

This folder is replicated within the cluster with GlusterFS. Any modification is instantly propagated to the other nodes, which means that file modifications, deletion and creation will be replicated on each node.

File permissions follows the POSIX standard, therefore on each node a file could show up as belonging to different users depending on the user id owing that file.

### ├── logs
Parity logs
### ├── openresty
OpenResty configuration files.
### ├── scripts
Various utility scripts

## Starting a node

Make sure that openresty is running. If not then:

    sudo /etc/init.d/openresty-endpoint start

Enter `/home/rigoblock/cluster` and run `start-parity-node.sh` as `rigoblock` user:

    ./start-parity-node.sh

Output:

    USAGE: ./start-parity-node.sh options

    This script will start a Parity node inside a screen session.
    Default config file: /home/rigoblock/cluster/parity-config/config_cluster.toml
    Development config file: /home/rigoblock/cluster/parity-config/config_dev_node.toml

    OPTIONS:
    -p      Start Parity production
    -d      Start Parity development: options kovan,ropsten
    -h      Show this message
    -o      Additional parity option

    EXAMPLE: ./start-parity-node.sh -p kovan -o --public-mode

Then run the command with flags `-p` or `-d` and `<NETWORK_NAME>`, i.e.:

    ./start-parity-node.sh -d kovan

This script will carry out a few checks and start Parity in a screen session. Once started you can detach with `CTRL+A+D`.

You can reattach to the screen session with the following command:

    screen -r parity_kovan

If you get a message such as:

    rigoblock@srv01:/root$ screen -r parity_kovan
    Cannot open your terminal '/dev/pts/0' - please check.

then first run

    script /dev/null 

and retry.


