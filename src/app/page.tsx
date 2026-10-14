import { ssh_config } from "@/lib/lib-ssh-config"
import { PageTitle } from "@/ui/ui-commons"
import { cn } from "cn"
import { refresh } from "next/cache"
import Link from "next/link"

export const instant = false


export default async function Home() {

  const ssh_config_res = await ssh_config.get_all()

  return (
    <>
      <h1 className={cn(
        "text-base font-semibold tracking-tighter text-color-fg/25"
      )}>WebSSH</h1>
      <PageTitle>
        Select SSH
      </PageTitle>

      {ssh_config_res.ok ?
        <div className="fcol gap-2">
          {ssh_config_res.data.length === 0 && <>
            <div className="text-muted frow">
              No ssh configured in this app
            </div>
          </>}
          <div className="fcol gap-1">
            {ssh_config_res.data.map((ssh) => {
              return <Link
                href={`/ssh/${ ssh.name }`}
                key={ssh.name} className={cn(
                  "p-3",
                  "self-stretch",
                  "frow",
                  "border border-color-fg/10",
                  "rounded-md",
                  "h-auto items-start",
                  "button-ghost",
                )}>
                <div className="grow fcol gap-1.5">
                  <div className="text-base">
                    {ssh.name}
                  </div>
                  <div className="text-color-fg/75 font-mono text-sm">
                    <span>{ssh.username}</span>
                    <span>@</span>
                    <span>{ssh.address}</span>
                  </div>
                </div>
              </Link>
            })}
          </div>

          <Link className='button-ghost' href='/add-ssh'>
            Add SSH
          </Link>
        </div> :
        <div className="error-card">
          <p className="">
            Error loading ssh config file!
          </p>
          <p className="text-sm text-muted">
            {ssh_config_res.error.msg}
          </p>
          <form action={async () => {
            "use server"
            await ssh_config.reset()
            refresh()
          }}>
            <button className="button">Reset config file</button>
          </form>
        </div>
      }
    </>
  )
}
