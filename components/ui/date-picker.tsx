"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  showTime?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  className,
  showTime = true,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const [hours, setHours] = React.useState<string>(
    value && showTime
      ? String(new Date(value).getHours()).padStart(2, "0")
      : "00"
  )
  const [minutes, setMinutes] = React.useState<string>(
    value && showTime
      ? String(new Date(value).getMinutes()).padStart(2, "0")
      : "00"
  )

  React.useEffect(() => {
    if (value) {
      const dateValue = new Date(value)
      setDate(dateValue)
      if (showTime) {
        setHours(String(dateValue.getHours()).padStart(2, "0"))
        setMinutes(String(dateValue.getMinutes()).padStart(2, "0"))
      }
    } else {
      setDate(undefined)
      setHours("00")
      setMinutes("00")
    }
  }, [value, showTime])

  const updateDateTime = React.useCallback(
    (newDate: Date | undefined, newHours: string, newMinutes: string) => {
      if (!newDate) {
        onChange?.("")
        return
      }

      const dateTime = new Date(newDate)
      dateTime.setHours(Number(newHours), Number(newMinutes), 0, 0)
      const isoString = dateTime.toISOString().slice(0, 16)
      onChange?.(isoString)
    },
    [onChange]
  )

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined)
      onChange?.("")
      return
    }

    setDate(selectedDate)
    if (showTime) {
      updateDateTime(selectedDate, hours, minutes)
    } else {
      const isoString = selectedDate.toISOString().slice(0, 16)
      onChange?.(isoString)
    }
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "") // Chỉ cho phép số
    
    // Cho phép gõ tự do, chỉ validate khi có giá trị
    if (value === "") {
      setHours("")
      return
    }
    
    const num = parseInt(value, 10)
    // Nếu số quá lớn, giới hạn ở 2 chữ số đầu
    if (value.length > 2) {
      value = value.slice(0, 2)
    }
    
    // Validate range nhưng giữ nguyên format khi đang gõ
    if (num > 23) {
      value = "23"
    } else if (num < 0) {
      value = "0"
    }
    
    setHours(value)
    
    // Chỉ update khi có đủ 2 chữ số hoặc đã blur
    if (value.length === 2 && date) {
      const formattedValue = value.padStart(2, "0")
      updateDateTime(date, formattedValue, minutes)
    }
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "") // Chỉ cho phép số
    
    // Cho phép gõ tự do, chỉ validate khi có giá trị
    if (value === "") {
      setMinutes("")
      return
    }
    
    const num = parseInt(value, 10)
    // Nếu số quá lớn, giới hạn ở 2 chữ số đầu
    if (value.length > 2) {
      value = value.slice(0, 2)
    }
    
    // Validate range nhưng giữ nguyên format khi đang gõ
    if (num > 59) {
      value = "59"
    } else if (num < 0) {
      value = "0"
    }
    
    setMinutes(value)
    
    // Chỉ update khi có đủ 2 chữ số hoặc đã blur
    if (value.length === 2 && date) {
      const formattedValue = value.padStart(2, "0")
      updateDateTime(date, hours, formattedValue)
    }
  }

  const handleTimeBlur = (type: "hours" | "minutes") => {
    if (type === "hours") {
      const formatted = hours === "" ? "00" : hours.padStart(2, "0")
      setHours(formatted)
      if (date) {
        updateDateTime(date, formatted, minutes)
      }
    } else {
      const formatted = minutes === "" ? "00" : minutes.padStart(2, "0")
      setMinutes(formatted)
      if (date) {
        updateDateTime(date, hours, formatted)
      }
    }
  }

  const displayValue = React.useMemo(() => {
    if (!date) return ""
    if (showTime) {
      const dateTime = new Date(date)
      dateTime.setHours(Number(hours), Number(minutes), 0, 0)
      return format(dateTime, "dd/MM/yyyy HH:mm")
    }
    return format(date, "dd/MM/yyyy")
  }, [date, hours, minutes, showTime])

  return (
    <div className={cn("flex flex-col sm:flex-row gap-2 w-full", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:flex-1 justify-start text-left font-normal min-w-0",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{date ? displayValue : placeholder}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {showTime && (
        <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-shrink-0">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-1 flex-1 sm:flex-initial">
            <Input
              type="text"
              inputMode="numeric"
              value={hours}
              onChange={handleHoursChange}
              onBlur={() => handleTimeBlur("hours")}
              className="w-[60px] h-9 text-center px-2"
              placeholder="00"
              maxLength={2}
            />
            <span className="text-muted-foreground font-medium">:</span>
            <Input
              type="text"
              inputMode="numeric"
              value={minutes}
              onChange={handleMinutesChange}
              onBlur={() => handleTimeBlur("minutes")}
              className="w-[60px] h-9 text-center px-2"
              placeholder="00"
              maxLength={2}
            />
          </div>
        </div>
      )}
    </div>
  )
}

