export interface PowerNetRequirement {
  net: string
  voltage: number
  maxCurrentA: number
  nominalTraceWidthMm: number
  purpose: string
}

export interface PowerTraceSampleMetadata {
  title: string
  application: string
  tags: string[]
  powerNets: PowerNetRequirement[]
}
