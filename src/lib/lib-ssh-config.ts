import { JsonFile, JsonParser } from "./util-file"

type SSHConfig = {
  name: string,
  username: string,
  address: string,
}[]

const ssh_config_parser = new JsonParser((o) => {
  if (Array.isArray(o) === false) {
    console.warn(`sshcfg is not an array, returning empty array.`)
    return []
  }
  const valid_ssh: SSHConfig = []
  for (let i = 0; i < o.length; i++) {
    const item = o[ i ] as unknown
    if (!item || typeof item !== "object") {
      console.warn(`sshcfg[${ i }] is not an object, skipping.`)
      continue
    }
    if ('name' in item === false || typeof item.name !== "string") {
      console.warn(`sshcfg[${ i }].name is not a string, skipping.`)
      continue
    }
    if ('username' in item === false || typeof item.username !== "string") {
      console.warn(`sshcfg[${ i }].username is not a string, skipping.`)
      continue
    }
    if ('address' in item === false || typeof item.address !== "string") {
      console.warn(`sshcfg[${ i }].address is not a string, skipping.`)
      continue
    }
    valid_ssh.push({
      name: item.name,
      address: item.address,
      username: item.username
    })
  }
  return valid_ssh
})

const ssh_config_file = new JsonFile('./data/ssh.json', ssh_config_parser, () => {
  return []
})

let ssh_config_cache: SSHConfig | null = null

export const ssh_config = {
  async refresh_cache() {
    ssh_config_cache = null
    return await this.get_all()
  },


  async get_all() {
    if (ssh_config_cache === null) {
      const res = await ssh_config_file.read()
      if (res.ok) ssh_config_cache = res.data
      return res
    } else {
      return { ok: true as const, data: ssh_config_cache }
    }
  },

  async reset() {
    await ssh_config_file.reset()
    ssh_config_cache = null
    await this.get_all()
  },

  async get(id: string) {
    const res = await this.get_all()
    if (!res.ok) throw res.error.ref
    const ssh = res.data.find(ssh => ssh.name === id)
    if (!ssh) return null
    return ssh
  },

  async add(payload: SSHConfig[ number ]) {
    const res = await this.get_all()
    if (!res.ok) throw res.error.ref
    const existing = res.data.find(ssh => ssh.name === payload.name)
    if (existing)
      return `name exists` as const
    const new_config = [ ...res.data, payload ]
    await ssh_config_file.write(new_config)
    return this.refresh_cache()
  }


}







