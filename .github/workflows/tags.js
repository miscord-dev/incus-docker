const { $ } = require('zx')

/*
incus | 1:6.7-debian12-202411151825 | https://pkgs.zabbly.com/incus/stable bookworm/main arm64 Packages
incus | 1:6.6-debian12-202411092101 | https://pkgs.zabbly.com/incus/stable bookworm/main arm64 Packages
*/

module.exports = async ({github, context, core}) => {
    const baseImage = `apt-${process.env.BASE_IMAGE}`

    await $`docker build --target base --build-arg BASE_IMAGE=${process.env.BASE_IMAGE} -f ./debian-version/Dockerfile -t ${baseImage} .`

    const result = await $`docker run --rm ${baseImage} apt-cache madison incus`

    const versions = result.stdout.split('\n').map(line => {
        const [_, version] = line.split('|').filter(Boolean).map(col => col.trim())

        return version
    }).filter(Boolean)

    const date = new Date()
    const dateStr = `${date.getFullYear()}${date.getMonth()+1}${date.getDate()}`

    for (const version of versions) {
        const image = `ghcr.io/${process.env.IMAGE_NAME}-${baseImage}-${version}-${dateStr}`

        await $`docker buildx build --platforms linux/amd64,linux/arm64 --build-arg BASE_IMAGE=${baseImage} --build-arg INCUS_VERSION=${version} -f ./debian-version/Dockerfile -t  .`
        
        await $`docker push ${image}`
    }
}
