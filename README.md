# incus-docker
A project to run incus in docker/podman

Incus is a fork of lxd. Please see here:
https://linuxcontainers.org/incus/

This project aims to maintain a Dockerfile to run incus in a docker/podman container.
It also installs the incus-ui-canonical to have a Web-based UI.

*Versions*
Debian version: I recommend using this with any glibc-based distributions. This is based off of zabbly/incus builds ( https://github.com/zabbly/incus )

*(Dockerfile-only) versions*
Alpine versions are also available, only in Dockerfile form. These will not be prioritized at present.

How to use it:

*Note*: If you use the environment variable SETIPTABLES=true, it will be adding:
```
iptables-legacy -I DOCKER-USER -j ACCEPT
ip6tables-legacy -I DOCKER-USER -j ACCEPT
```

The reason is that, without doing this, docker's iptables settings will be blocking the connections from the incus bridge you create, and your containers/vms will not be able to access the internet. If you use podman, it's not needed from my testing.

*Note*: If you want to use LXCFS support, you can set the environment variable USELXCFS=true and mount your volume at /var/lib/lxcfs

*Note*: If you want to use LVM, you can pass mount /dev as /dev in the container.

*Note*: ZFS support should also be working as of 25 February, 2024 update.

# To use the image

First, make the directory to hold incus configuration:
``` mkdir /var/lib/incus ```

With Docker:

```
docker run -d \
--name incus \
--privileged \
--env SETIPTABLES=true \
--restart unless-stopped \
--device /dev/kvm \
--device /dev/vsock \
--device /dev/vhost-vsock \
--device /dev/vhost-net \
--network host \
--volume /var/lib/incus:/var/lib/incus \
--volume /lib/modules:/lib/modules:ro \
ghcr.io/cmspam/incus-docker:latest
```

With Podman:
```
podman run -d \
--name incus \
--privileged \
--device /dev/kvm \
--device /dev/vsock \
--device /dev/vhost-vsock \
--device /dev/vhost-net \
--network host \
--volume /var/lib/incus:/var/lib/incus \
--volume /lib/modules:/lib/modules:ro \
ghcr.io/cmspam/incus-docker:latest
```

If you use OpenVSwitch, add:
```
--volume /run/openvswitch:/run/openvswitch
```

If you use LVM, it's easiest to add:
```
--volume /dev:/dev
```

NOTE: If you are using the alpine version with a glibc-based image, you can't depend on the ability to load the modules for VMs automatically. You should set up your environment to automatically load vhost_vsock and kvm modules. You can do it like this:

```
echo "vhost_vsock" > /etc/modules-load.d/incus.conf
echo "kvm" >> /etc/modules-load.d/incus.conf
```


After you start the container, incus will be running. If you used the folder I suggested and used host networking, you can manage it immediately with the incus binary from the same machine. Grab the binary from the latest releases here:

https://github.com/lxc/incus/releases

For example, I use bin.linux.incus.x86_64 from the Assets at the above link.

You can then run **chmod +x bin.linux.incus.x86_64** to make it executable. Let's rename it to incus by running  **mv bin.linux.incus.x86_64 incus**

Now we can check it's working by running

```./incus admin init```

And we can proceed to configure incus.

I find it easiest to move the binary to /usr/local/bin so that I can just run **incus admin init** or whatever other incus command I need from PATH.

If you configure it to be manageable from the network, we can access the web UI, at https://{YOUR IP}:8443

I have tested on both arm64 and x86_64.

Other platforms may work if you build the alpine Dockerfile.
