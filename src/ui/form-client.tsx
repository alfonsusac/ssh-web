"use client"

import { cn } from "cn"
import { useActionState, type ComponentProps, type ReactNode } from "react"
import { useFormStatus } from "react-dom"


type FormReturn = {
  error?: string,
}


export function Form(props: {
  action: (state: FormReturn, form: FormData) => Promise<FormReturn>
  children?: ReactNode
}) {
  const [ state, dispatch, isPending ] = useActionState<FormReturn, FormData>(
    props.action,
    {}
  )
  return <form action={form => dispatch(form)} className="fcol gap-2">
    {props.children}
    {
      state.error &&
      <div className="error-card p-3 text-red-400">
        Error: {state.error}
      </div>
    }
  </form>
}


export function Submit(props: ComponentProps<"button">) {

  const {
    pending
  } = useFormStatus()

  return <>
    <button {...props}
      disabled={pending}
    >
    </button>
  </>
}








