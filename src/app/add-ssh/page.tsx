import { ssh_config } from "@/lib/lib-ssh-config"
import { AddSSHForm } from "@/ui/app-form-add-ssh"
import { BackButton, PageTitle } from "@/ui/ui-commons"

export default function AddSSHPage() {
  return <>
    <BackButton href="/"/>

    <div className="p-8 fcol gap-6 border rounded-lg border-color-fg/10">

      <PageTitle>
        Add SSH
      </PageTitle>

      <AddSSHForm action={async (input) => {
        "use server"
        console.log("Hello server!")
        const err = await ssh_config.add({
          name: input.name,
          address: input.ipaddress,
          username: input.username
        })
        if (err === "name exists") return {
          field_error: {
            "ssh_name": `SSH with name "${ input.name }" already exists`
          }
        }
        return { success: "SSH added successfully!" }
      }} />

    </div>


  </>
}