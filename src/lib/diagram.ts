// Conventions for Mermaid diagrams in content/*.json.
//
// - Start with `flowchart TD` (top-down reads best on a phone); use LR only for short chains.
// - AWS services are drawn with their official icon via the `@svc` macro:
//     fn@svc(lambda)                 -> Lambda icon, label = short service name
//     fn@svc(lambda, "Resize image") -> Lambda icon with a custom label (use <br/> to wrap)
//   The id must be a service id from content/services.json. Prefer @svc for every AWS service node.
// - Non-service nodes (users, on-prem, generic boxes) use one of the classes below, e.g. `db[(Aurora)]:::db`. The renderer injects the
//   classDefs, so content must NOT define its own classDef/style/init directives.
// - Keep labels short: service name plus at most ~3 words, `<br/>` for a second line.
// - Use subgraphs for boundaries (Region, AZ, VPC, account, on-prem) and edge labels for what flows.
// - 4–14 nodes. A diagram should show one idea clearly, not every component.

export const nodeClasses = {
  user: 'people, clients, devices',
  edge: 'DNS/CDN/WAF/API front door: Route 53, CloudFront, Global Accelerator, API Gateway, ELB',
  compute: 'EC2, Lambda, Fargate/ECS/EKS tasks, Batch',
  storage: 'S3, EBS, EFS, FSx, Glacier, Backup vaults',
  db: 'RDS, Aurora, DynamoDB, ElastiCache, Redshift and other databases',
  net: 'VPC plumbing: TGW, Direct Connect, VPN, NAT, PrivateLink, Lattice',
  sec: 'IAM, KMS, Cognito, GuardDuty, Security Hub, Organizations/SCPs',
  int: 'SQS, SNS, EventBridge, Step Functions, Kinesis, MSK, IoT Core',
  analytics: 'Glue, Athena, EMR, OpenSearch, Quick Sight, Lake Formation',
  ai: 'Bedrock, AgentCore, SageMaker AI, Rekognition, Textract…',
  mgmt: 'CloudWatch, CloudTrail, Config, CloudFormation, Systems Manager',
  ext: 'on-premises, third-party, other clouds',
  note: 'decision points or annotations',
} as const

export type NodeClass = keyof typeof nodeClasses

type Palette = Record<NodeClass, { fill: string; stroke: string; color: string }>

const light: Palette = {
  user: { fill: '#f1f5f9', stroke: '#64748b', color: '#0f172a' },
  edge: { fill: '#ede9fe', stroke: '#7c3aed', color: '#2e1065' },
  compute: { fill: '#ffedd5', stroke: '#ea580c', color: '#431407' },
  storage: { fill: '#dcfce7', stroke: '#16a34a', color: '#052e16' },
  db: { fill: '#dbeafe', stroke: '#2563eb', color: '#172554' },
  net: { fill: '#e0e7ff', stroke: '#4f46e5', color: '#1e1b4b' },
  sec: { fill: '#fee2e2', stroke: '#dc2626', color: '#450a0a' },
  int: { fill: '#fce7f3', stroke: '#db2777', color: '#500724' },
  analytics: { fill: '#cffafe', stroke: '#0891b2', color: '#083344' },
  ai: { fill: '#ccfbf1', stroke: '#0d9488', color: '#042f2e' },
  mgmt: { fill: '#fef9c3', stroke: '#ca8a04', color: '#422006' },
  ext: { fill: '#e7e5e4', stroke: '#78716c', color: '#1c1917' },
  note: { fill: '#fffbeb', stroke: '#f59e0b', color: '#451a03' },
}

const dark: Palette = {
  user: { fill: '#1e293b', stroke: '#94a3b8', color: '#f1f5f9' },
  edge: { fill: '#2e1065', stroke: '#a78bfa', color: '#ede9fe' },
  compute: { fill: '#431407', stroke: '#fb923c', color: '#ffedd5' },
  storage: { fill: '#052e16', stroke: '#4ade80', color: '#dcfce7' },
  db: { fill: '#172554', stroke: '#60a5fa', color: '#dbeafe' },
  net: { fill: '#1e1b4b', stroke: '#818cf8', color: '#e0e7ff' },
  sec: { fill: '#450a0a', stroke: '#f87171', color: '#fee2e2' },
  int: { fill: '#500724', stroke: '#f472b6', color: '#fce7f3' },
  analytics: { fill: '#083344', stroke: '#22d3ee', color: '#cffafe' },
  ai: { fill: '#042f2e', stroke: '#2dd4bf', color: '#ccfbf1' },
  mgmt: { fill: '#422006', stroke: '#facc15', color: '#fef9c3' },
  ext: { fill: '#292524', stroke: '#a8a29e', color: '#f5f5f4' },
  note: { fill: '#451a03', stroke: '#fbbf24', color: '#fffbeb' },
}

export function withClassDefs(src: string, isDark: boolean): string {
  const p = isDark ? dark : light
  const defs = Object.entries(p)
    .map(([k, v]) => `  classDef ${k} fill:${v.fill},stroke:${v.stroke},color:${v.color},stroke-width:1.5px`)
    .join('\n')
  return `${src.trimEnd()}\n${defs}\n`
}

// Content may only use these classes; checked by scripts/validate-content.ts.
export function unknownClasses(src: string): string[] {
  const used = [...src.matchAll(/:::([a-zA-Z]+)/g)].map((m) => m[1])
  return [...new Set(used.filter((c) => !(c in nodeClasses)))]
}

const SVC = /(\w+)@svc\(\s*([a-z0-9-]+)\s*(?:,\s*"([^"]*)")?\s*\)/g

export function svcRefs(src: string): string[] {
  return [...src.matchAll(SVC)].map((m) => m[2])
}

// Expand @svc macros into Mermaid image-shape nodes.
export function expandSvc(src: string, shortName: (id: string) => string, iconBase = '/icons/'): string {
  return src.replace(SVC, (_, node: string, id: string, label?: string) => {
    const text = (label ?? shortName(id)).replace(/"/g, "'")
    return `${node}@{ img: "${iconBase}${id}.svg", label: "${text}", pos: "b", w: 44, h: 44, constraint: "on" }`
  })
}

export const shortServiceName = (name: string) => name.replace(/^(Amazon|AWS) /, '').replace(/\s*\(.*\)$/, '')
