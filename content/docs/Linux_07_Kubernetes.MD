# Kubernetes CentOS

Documentation:  

https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/

Create a new CentOS VM on Kimchi.

Login and configure.

Set nano as default editor:

    touch /etc/profile.d/nano.sh
    echo "export EDITOR=/usr/bin/nano" > /etc/profile.d/nano.sh

Temporarily disable firewall:

    systemctl disable firewalld
    systemctl stop firewalld
    yum install net-tools

Swap disabled. You MUST disable swap in order for the kubelet to work properly.

    swapoff -a

Edit `/etc/fstab` and comment any references to swap

Install Docker using your operating system’s bundled package:

    yum install -y docker
    systemctl enable docker && systemctl start docker

Disable selinux

    setenforce 0
    sed -i --follow-symlinks 's/^SELINUX=.*/SELINUX=disabled/g' /etc/sysconfig/selinux
    
Some users on RHEL/CentOS 7 have reported issues with traffic being routed incorrectly due to iptables being bypassed. You should ensure `net.bridge.bridge-nf-call-iptables` is set to 1 in your sysctl config, e.g.

    cat <<EOF >  /etc/sysctl.d/k8s.conf
    net.bridge.bridge-nf-call-ip6tables = 1
    net.bridge.bridge-nf-call-iptables = 1
    EOF
    sysctl --system

Install kubeadm, kubelet and kubectl:

    cat <<EOF > /etc/yum.repos.d/kubernetes.repo
    [kubernetes]
    name=Kubernetes
    baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
    enabled=1
    gpgcheck=1
    repo_gpgcheck=1
    gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
    EOF
    yum install -y kubelet kubeadm kubectl
    systemctl enable kubelet && systemctl start kubelet

Make sure that the cgroup driver used by kubelet is the same as the one used by Docker. Verify that your Docker cgroup driver matches the kubelet config:

    docker info | grep -i cgroup
    cat /etc/systemd/system/kubelet.service.d/10-kubeadm.conf

If the Docker cgroup driver and the kubelet config don’t match, change the kubelet config to match the Docker cgroup driver. The flag you need to change is `--cgroup-driver`. If it’s already set, you can update like so:

    sed -i "s/cgroup-driver=systemd/cgroup-driver=cgroupfs/g" /etc/systemd/system/kubelet.service.d/10-kubeadm.conf

Otherwise, you will need to open the systemd file and add the flag to an existing environment line.

Then restart kubelet:

    systemctl daemon-reload
    systemctl restart kubelet

To initialize the master, pick one of the machines you previously installed kubeadm on, and run:

    kubeadm init --pod-network-cidr=10.244.0.0/16

Installing a pod network:

    kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/v0.9.1/Documentation/kube-flannel.yml
    kubectl get pods --all-namespaces

Repeat the same configuraion on a pod server. Do not run `kubeadmin init`.

Run the join command as requeste ad the end of `kuberadmin init`. For example:

    kubeadm join --token 36cac6.65b178b405c65a1f 185.31.65.125:6443 --discovery-token-ca-cert-hash sha256:8a1be4262487026ec2dc9b6e02bbcb077ebb1a94c4a071cfd8bb6c3e72b84df5

Ingress

    https://github.com/kubernetes/ingress-nginx

# Installing Dashboad

Documentation: https://github.com/kubernetes/dashboard/wiki/Installation

This setup requires, that certificates are stored in a secret named `kubernetes-dashboard-certs` in kube-system namespace. Assuming that you have `dashboard.crt` and `dashboard.key` files stored under `$HOME/certs` directory, you should create secret with contents of these files:

    mkdir $HOME/certs

Copy the crt and key file inside the above directory.

Delete any previous installation of the Dashboard:

    kubectl delete -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml

Create di secret:

    kubectl create secret generic kubernetes-dashboard-certs --from-file=$HOME/certs -n kube-system

Deploy the dashboard:

    kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml

Creating an user do access Dashboard:

    https://github.com/kubernetes/dashboard/wiki/Creating-sample-user

Heapster:

    https://docs.giantswarm.io/guides/kubernetes-heapster/