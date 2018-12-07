# Server info

    IP:         185.31.65.127
    Host:       dev-01.endpoint.network
    App URLs:   http://<app>.dev-01.endpoint.network


# Connecting to VM

    username: rigoblock
    SSH port: 5555

Contact sysadmin for password.

# Connecting to Dokku Server

Contact sysadmin and ask for a pair of public and private keys.  
Configure your SSH client accodingly to connect to Dokku server.  

Example:

https://stackoverflow.com/questions/2419566/best-way-to-use-multiple-ssh-private-keys-on-one-client

Example test command:

    whitenoise@X1-Carbon:~$ ssh dokku@185.31.65.127 -p 5555 version
    0.11.6
    whitenoise@X1-Carbon:~$



