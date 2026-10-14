import { ssh_config } from "@/lib/lib-ssh-config"
import { BackButton, PageTitle } from "@/ui/ui-commons"

export const instant = false

export default async function SSHPage(props: PageProps<'/ssh/[name]'>) {

  const name_prop = (await props.params).name
  const ssh = await ssh_config.get(name_prop)
  if (ssh === null) return <>
    <BackButton href="/" />
    <PageTitle>
      SSH Not Found
    </PageTitle>
    <div className="max-w-80 leading-5">
      Can't find SSH with the name "{name_prop}" in the SSH config file!
    </div>
  </>

  return <>
    <BackButton href="/" />
    <header className="fcol gap-1">
      <div className="text-sm text-muted">SSH Overview</div>
      <PageTitle>
        {ssh.name}
      </PageTitle>
      <div className="font-mono">
        <span>{ssh.username}</span>
        <span>@</span>
        <span>{ssh.address}</span>
      </div>
    </header>

  </>
}