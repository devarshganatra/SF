"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = ({ children }: { children: React.ReactNode }) => {
  return <form>{children}</form>
}

const FormFieldContext = React.createContext<{ name: string }>({ name: "" })

const FormField = ({
  name,
  defaultValue,
  render,
}: {
  name: string
  defaultValue: any
  render: (field: {
    value: any
    onChange: (value: any) => void
    onBlur: () => void
  }) => React.ReactNode
}) => {
  const [value, setValue] = useState(defaultValue)

  const handleChange = (newValue: any) => {
    setValue(newValue)
  }

  return (
    <FormFieldContext.Provider value={{ name }}>
      {render({
        value,
        onChange: handleChange,
        onBlur: () => {},
      })}
    </FormFieldContext.Provider>
  )
}

export { Form, FormField }
