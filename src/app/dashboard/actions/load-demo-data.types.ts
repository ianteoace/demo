import type { SeedDemoDataResult } from "@/lib/demo/seed-demo-data"

export type LoadDemoDataActionResult = {
  success: boolean
  message: string
  summary?: SeedDemoDataResult
}

