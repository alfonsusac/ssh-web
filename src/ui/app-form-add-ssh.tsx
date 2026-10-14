"use client"

import { cn } from "cn"
import { useActionState, type ComponentProps } from "react"

function createForm<
  T extends {
    [ K in keyof T ]: {
      label: string,
      parse: (o: string | File | null) => { error: string } | { ok: any },
    }
  }
>(opts_init: {
  initialData?: { [ key in keyof T ]?: string | File | null },
  fields: T
}) {


  function useForm(opts: {
    onSubmit: (payload: {
      [ key in keyof T ]: (ReturnType<T[ key ][ 'parse' ]> & { ok: any })[ 'ok' ]
    }) => Promise<FormActionReturn<keyof T>>
  }) {
    const [ state, dispatch, isPending ] = useActionState<
      {
        error?: string,
        success?: string,
        field_error: Map<keyof T, string>,
        input: { [ key in keyof T ]?: string | File | null }
      },
      FormData
    >(
      async (state, formDataPayload) => {
        const field_error = new Map<keyof T, string>
        const input: { [ key in keyof T ]?: string | File | null } = {}

        type Payload = { [ key in keyof T ]: ReturnType<T[ key ][ 'parse' ]> }
        const payload: Partial<Payload> = {}

        for (const key in opts_init.fields) {
          const def = opts_init.fields[ key ]
          const value = formDataPayload.get(key)
          input[ key ] = value
          // console.log(key, typeof value, value)
          const parsed = def.parse(value)
          if ('error' in parsed) {
            field_error.set(key, parsed.error)
          } else {
            payload[ key ] = parsed.ok
          }
        }

        if (field_error.size > 0) {
          // console.log("Has error!")
          return {
            input,
            field_error,
          }
        }

        // console.log("Hellooo", field_error, input, payload)
        const res = await opts.onSubmit(payload as Payload)

        for (const field_err_key in res?.field_error ?? {}) {
          const key = field_err_key as keyof T
          const field_err = res?.field_error?.[ key ]
          if (!field_err) continue
          field_error.set(key, field_err)
        }

        return {
          input,
          field_error,
          error: res?.error,
          success: res?.success
        }
      },
      {
        input: opts_init.initialData ?? {},
        field_error: new Map(),
      }
    )

    return {
      action: (form: FormData) => dispatch(form),
      isPending,
      error: state.error,
      input: state.input,
      field: Object.fromEntries(
        Object.entries(opts_init.fields).map(([ _key, value ]) => {
          const key = _key as keyof T
          const prevInput = state.input[ key ]
          return [ key, {
            label: opts_init.fields[ key ].label,
            name: key as string,
            error: state.field_error.get(key),
            defaultValue: typeof prevInput === "string" ? prevInput : undefined,
          } ]
        })
      ) as { [ key in keyof T ]: {
        label: string,
        name: string,
        error?: string,
        defaultValue: string | undefined,
      } },
    }
  }

  return {
    useForm,
    formActionReturnType: {} as FormActionReturn<keyof T>
  }
}

type FormActionReturn<T extends PropertyKey> = undefined | {
  error?: string,
  success?: string,
  field_error?: {
    [ key in T ]?: string
  }
}


type AddSSHInput = {
  name: string,
  username: string,
  ipaddress: string,
}


const {
  useForm,
  formActionReturnType
} = createForm({
  fields: {
    "ssh_name": {
      label: "SSH Name",
      parse: (val) => {
        if (!val || typeof val !== "string") return { error: "SSH Name is required" }
        return { ok: val }
      }
    },
    "ssh_username": {
      label: "SSH Username",
      parse: (val) => {
        if (!val || typeof val !== "string") return { error: "SSH Username is required" }
        return { ok: val }
      }
    },
    "ssh_ipaddress": {
      label: "SSH Address",
      parse: (val) => {
        if (!val || typeof val !== "string") return { error: "SSH Username is required" }
        return { ok: val }
      }
    },
  },
})


export function AddSSHForm(props: {
  action: (p: AddSSHInput) => Promise<typeof formActionReturnType>,
} & Omit<ComponentProps<'form'>, 'action'>) {
  const { action, error, field } = useForm({
    onSubmit: async (payload) => {
      return await props.action({
        name: payload[ "ssh_name" ],
        username: payload[ 'ssh_username' ],
        ipaddress: payload[ 'ssh_ipaddress' ],
      })
    }
  })

  return <form {...props} className={cn(
    "fcol w-full gap-4",
    props.className
  )} autoComplete="off"
    action={async form => action(form)}
  >
    <div className="input-group">
      <label>{field.ssh_name.label}</label>
      <input className="input-box" name={field.ssh_name.name} defaultValue={field.ssh_name.defaultValue} />
      <p className="text-sm text-red-400">{field.ssh_name.error}</p>
    </div>

    <div className="input-group">
      <label>{field.ssh_username.label}</label>
      <input className="input-box" name={field.ssh_username.name} defaultValue={field.ssh_username.defaultValue} />
      <p className="text-sm text-red-400">{field.ssh_username.error}</p>
    </div>

    <div className="input-group">
      <label>{field.ssh_ipaddress.label}</label>
      <input className="input-box" name={field.ssh_ipaddress.name} defaultValue={field.ssh_ipaddress.defaultValue} />
      <p className="text-sm text-red-400">{field.ssh_ipaddress.error}</p>
    </div>

    <button className="button">Add SSH</button>

    {error &&
      <div className="error-card p-3 text-red-400">
        {error}
      </div>
    }
  </form>
}