import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function calcAge(birthYear: number): number {
  return new Date().getFullYear() - birthYear
}

export function isServiceOpen(): boolean {
  const stockholm = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Stockholm' }))
  const h = stockholm.getHours()
  return h >= 22 || h < 6
}

export function secondsUntilOpen(): number {
  const stockholm = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Stockholm' }))
  const h = stockholm.getHours(), m = stockholm.getMinutes(), s = stockholm.getSeconds()
  if (h >= 6 && h < 22) {
    return (22 - h - 1) * 3600 + (59 - m) * 60 + (60 - s)
  }
  return 0
}
