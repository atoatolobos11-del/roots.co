import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const outputDirectory = dirname(fileURLToPath(import.meta.url))
const diagramDirectory = join(outputDirectory, 'diagrams')
await mkdir(diagramDirectory, { recursive: true })

const palette = {
  ink: '#202827',
  green: '#536d5d',
  pale: '#f1f3ef',
  line: '#aab6ae',
  muted: '#64706a',
  white: '#ffffff',
  rust: '#a45b49',
  yellow: '#e7d8a9',
}

const escapeXml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const label = (x, y, value, size = 21, color = palette.ink, weight = 400) =>
  `<text x="${x}" y="${y}" fill="${color}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}">${escapeXml(value)}</text>`
const multiLabel = (x, y, values, size = 17, color = palette.muted, lineHeight = 25) =>
  `<text x="${x}" y="${y}" fill="${color}" font-family="Arial, sans-serif" font-size="${size}">${values.map((value, index) => `<tspan x="${x}" dy="${index ? lineHeight : 0}">${escapeXml(value)}</tspan>`).join('')}</text>`
const box = (x, y, width, height, title, lines = [], options = {}) => {
  const fill = options.fill || palette.white
  const stroke = options.stroke || palette.line
  const titleColor = options.titleColor || palette.ink
  const titleSize = options.titleSize || 20
  const lineSize = options.lineSize || 16
  const startY = y + (options.titleOffset || 37)
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="2"/>${label(x + 18, startY, title, titleSize, titleColor, 700)}${lines.length ? multiLabel(x + 18, startY + 28, lines, lineSize, options.lineColor || palette.muted, options.lineHeight || 24) : ''}`
}
const arrow = (x1, y1, x2, y2, text = '', options = {}) => {
  const stroke = options.stroke || palette.green
  const dash = options.dash ? ' stroke-dasharray="7 6"' : ''
  const marker = options.noHead ? '' : ' marker-end="url(#arrow)"'
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2 - 9
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="3"${dash}${marker}/>${text ? label(midX + 8, midY, text, 14, options.textColor || palette.muted, 600) : ''}`
}
const startSvg = (width, height) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="${palette.green}"/></marker><marker id="rustArrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="${palette.rust}"/></marker></defs><rect width="100%" height="100%" fill="#ffffff"/>`
const saveDiagram = async (name, svg) => {
  const file = join(diagramDirectory, `${name}.png`)
  await sharp(Buffer.from(svg)).png().toFile(file)
  return `diagrams/${name}.png`
}

const architectureSvg = startSvg(1400, 740) +
  label(48, 48, 'PROPOSED SYSTEM ARCHITECTURE', 25, palette.ink, 700) +
  box(45, 118, 235, 220, 'User roles', ['Owner / manager', 'Inventory personnel', 'Sales personnel'], { fill: palette.pale }) +
  box(335, 118, 265, 220, 'Web client', ['Responsive browser UI', 'React storefront / POS', 'Role-based screens']) +
  box(655, 118, 265, 220, 'Web hosting', ['Static frontend bundle', 'HTTPS delivery', 'Vercel or Nginx']) +
  box(975, 118, 375, 220, 'Application API', ['Authentication and authorization', 'Product and inventory services', 'Sales transaction service', 'Validation and stock rules'], { fill: '#edf2ee' }) +
  box(975, 443, 375, 220, 'Relational database', ['Users and roles', 'Products and variants', 'Inventory and stock movements', 'Sales and sale items'], { fill: palette.pale }) +
  box(485, 443, 390, 220, 'Analytics and reporting', ['Sales summaries and trends', 'Fast / slow movers', 'Low-stock and replenishment cues', 'Exportable reports']) +
  arrow(280, 228, 335, 228, 'HTTPS') + arrow(600, 228, 655, 228) + arrow(920, 228, 975, 228, 'API') +
  arrow(1162, 338, 1162, 443, 'read / write') + arrow(975, 553, 875, 553, 'query') +
  arrow(875, 490, 975, 300, 'summaries', { dash: true }) +
  '</svg>'

const manualSvg = startSvg(1120, 1080) +
  label(48, 48, 'MANUAL IN-STORE TRANSACTION (BASELINE FLOW)', 25, palette.ink, 700) +
  box(365, 82, 390, 78, 'Start: customer selects item') +
  box(365, 194, 390, 90, 'Sales staff checks stock', ['Physical shelf / paper or spreadsheet record']) +
  `<polygon points="560,320 700,390 560,460 420,390" fill="#fff8e6" stroke="${palette.line}" stroke-width="2"/>` +
  label(500, 385, 'Item available?', 19, palette.ink, 700) +
  box(365, 510, 390, 84, 'Calculate total and confirm items') +
  box(365, 632, 390, 84, 'Receive payment using store method') +
  box(365, 754, 390, 84, 'Write transaction in manual sales record') +
  box(365, 876, 390, 84, 'Manually deduct stock; issue receipt') +
  box(45, 346, 285, 118, 'Unavailable', ['Offer substitute or', 'inform customer; stop'], { stroke: palette.rust }) +
  box(805, 754, 275, 118, 'End of day', ['Staff totals records and', 'prepares a summary']) +
  arrow(560, 160, 560, 194) + arrow(560, 284, 560, 319) + arrow(560, 461, 560, 510, 'Yes') +
  arrow(420, 390, 330, 390, 'No', { stroke: palette.rust }) + arrow(560, 594, 560, 632) +
  arrow(560, 716, 560, 754) + arrow(560, 838, 560, 876) + arrow(755, 796, 805, 796, 'daily tally') +
  '</svg>'

const proposedSvg = startSvg(1380, 1070) +
  label(48, 48, 'PROPOSED SYSTEM TRANSACTION PROCESS', 25, palette.ink, 700) +
  box(45, 100, 300, 94, '1. Staff signs in', ['System applies user role']) +
  box(405, 100, 340, 94, '2. Start sale', ['Select product, size / color, quantity']) +
  box(805, 100, 330, 94, '3. Validate stock', ['Check requested variant and quantity']) +
  `<polygon points="970,260 1100,330 970,400 840,330" fill="#fff8e6" stroke="${palette.line}" stroke-width="2"/>` +
  label(915, 325, 'Enough stock?', 19, palette.ink, 700) +
  box(1070, 475, 270, 110, 'Insufficient stock', ['Change quantity / variant', 'or cancel the sale'], { stroke: palette.rust }) +
  box(605, 475, 330, 110, '4. Calculate total', ['Display sale summary to staff']) +
  box(605, 655, 330, 110, '5. Confirm payment', ['Payment handled per store policy;', 'record confirmation']) +
  box(605, 835, 330, 110, '6. Save sale and items', ['Persist transaction with timestamp']) +
  box(100, 835, 390, 110, '7. Update stock atomically', ['Write stock movement and new balance']) +
  box(100, 655, 390, 110, '8. Refresh analytics', ['Sales reports and product movement']) +
  box(100, 475, 390, 110, '9. Check threshold', ['Create low-stock alert if needed']) +
  box(100, 285, 390, 95, 'Manager reviews reports', ['Use insights for replenishment decisions'], { fill: palette.pale }) +
  arrow(345, 147, 405, 147) + arrow(745, 147, 805, 147) + arrow(970, 194, 970, 259) +
  arrow(1100, 330, 1205, 475, 'No', { stroke: palette.rust }) + arrow(970, 401, 770, 475, 'Yes') +
  arrow(770, 585, 770, 655) + arrow(770, 765, 770, 835) + arrow(605, 890, 490, 890) +
  arrow(295, 835, 295, 765) + arrow(295, 655, 295, 585) + arrow(295, 475, 295, 380) +
  '</svg>'

const actor = (x, y, name) => `<circle cx="${x}" cy="${y}" r="18" fill="none" stroke="${palette.ink}" stroke-width="3"/><line x1="${x}" y1="${y + 18}" x2="${x}" y2="${y + 78}" stroke="${palette.ink}" stroke-width="3"/><line x1="${x - 30}" y1="${y + 42}" x2="${x + 30}" y2="${y + 42}" stroke="${palette.ink}" stroke-width="3"/><line x1="${x}" y1="${y + 78}" x2="${x - 25}" y2="${y + 112}" stroke="${palette.ink}" stroke-width="3"/><line x1="${x}" y1="${y + 78}" x2="${x + 25}" y2="${y + 112}" stroke="${palette.ink}" stroke-width="3"/>${label(x - 70, y + 142, name, 16, palette.ink, 600)}`
const ellipse = (cx, cy, rx, ry, text) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#ffffff" stroke="${palette.green}" stroke-width="2"/>${label(cx - text.length * 4.5, cy + 6, text, 15, palette.ink, 500)}`
const useCaseSvg = startSvg(1340, 850) +
  label(45, 45, 'USE CASE DIAGRAM', 25, palette.ink, 700) +
  `<rect x="285" y="85" width="850" height="690" rx="8" fill="#fbfcfa" stroke="${palette.ink}" stroke-width="3"/>` +
  label(315, 120, 'Roots.co Inventory and Sales Platform', 21, palette.ink, 700) +
  actor(115, 190, 'Owner / Manager') + actor(115, 420, 'Inventory Staff') + actor(115, 640, 'Sales Staff') +
  ellipse(520, 195, 160, 34, 'Manage users and roles') + ellipse(850, 195, 150, 34, 'View reports') +
  ellipse(520, 315, 160, 34, 'Manage products') + ellipse(850, 315, 160, 34, 'Review sales analytics') +
  ellipse(520, 435, 170, 34, 'Receive / adjust stock') + ellipse(850, 435, 165, 34, 'Monitor stock alerts') +
  ellipse(520, 555, 160, 34, 'Record sales transaction') + ellipse(850, 555, 175, 34, 'Update stock on sale') +
  ellipse(520, 675, 160, 34, 'View inventory') + ellipse(850, 675, 165, 34, 'Generate reports') +
  arrow(145, 210, 365, 195, '', { noHead: true, stroke: palette.line }) +
  arrow(145, 210, 700, 195, '', { noHead: true, stroke: palette.line }) +
  arrow(145, 210, 365, 315, '', { noHead: true, stroke: palette.line }) +
  arrow(145, 210, 700, 315, '', { noHead: true, stroke: palette.line }) +
  arrow(145, 440, 350, 435, '', { noHead: true, stroke: palette.line }) +
  arrow(145, 440, 685, 435, '', { noHead: true, stroke: palette.line }) +
  arrow(145, 440, 350, 675, '', { noHead: true, stroke: palette.line }) +
  arrow(145, 660, 350, 555, '', { noHead: true, stroke: palette.line }) +
  arrow(145, 660, 685, 555, '', { noHead: true, stroke: palette.line }) +
  arrow(145, 660, 685, 675, '', { noHead: true, stroke: palette.line }) +
  '</svg>'

const umlClass = (x, y, width, title, fields) => {
  const height = 52 + fields.length * 26
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="4" fill="#ffffff" stroke="${palette.ink}" stroke-width="2"/><rect x="${x}" y="${y}" width="${width}" height="42" fill="${palette.pale}" stroke="${palette.ink}" stroke-width="2"/>${label(x + 12, y + 28, title, 18, palette.ink, 700)}${fields.map((field, index) => label(x + 12, y + 70 + index * 26, field, 15, palette.muted, 400)).join('')}`
}
const classSvg = startSvg(1420, 920) +
  label(45, 45, 'PROPOSED DOMAIN CLASS DIAGRAM', 25, palette.ink, 700) +
  umlClass(55, 125, 250, 'User', ['userId: UUID', 'name: string', 'email: string', 'roleId: UUID']) +
  umlClass(390, 125, 270, 'Product', ['productId: UUID', 'SKU: string', 'name: string', 'category: string', 'unitPrice: decimal']) +
  umlClass(755, 125, 285, 'ProductVariant', ['variantId: UUID', 'productId: UUID', 'size: string', 'color: string', 'variantSKU: string']) +
  umlClass(1110, 125, 270, 'InventoryRecord', ['variantId: UUID', 'quantityOnHand: int', 'reorderLevel: int', 'updatedAt: datetime']) +
  umlClass(390, 485, 270, 'Sale', ['saleId: UUID', 'createdBy: UUID', 'soldAt: datetime', 'status: enum', 'total: decimal']) +
  umlClass(755, 485, 285, 'SaleItem', ['saleItemId: UUID', 'saleId: UUID', 'variantId: UUID', 'quantity: int', 'unitPrice: decimal']) +
  umlClass(1110, 485, 270, 'StockMovement', ['movementId: UUID', 'variantId: UUID', 'userId: UUID', 'delta: int', 'reason: string']) +
  umlClass(55, 485, 250, 'Role', ['roleId: UUID', 'name: string', 'permissions: text']) +
  arrow(305, 190, 390, 190, '1 to many') + arrow(660, 190, 755, 190, '1 to many') +
  arrow(1040, 190, 1110, 190, '1 to 1') + arrow(660, 545, 755, 545, '1 to many') +
  arrow(1040, 545, 1110, 545, '1 to many') + arrow(180, 485, 180, 330, '1 to many', { dash: true }) +
  arrow(510, 275, 510, 485, 'product variants referenced by sale items', { dash: true }) +
  '</svg>'

const packageSvg = startSvg(1280, 780) +
  label(45, 45, 'PROPOSED PACKAGE DIAGRAM', 25, palette.ink, 700) +
  box(55, 125, 270, 190, 'presentation', ['React pages and components', 'forms, tables, dashboards']) +
  box(405, 125, 270, 190, 'application', ['Authentication service', 'inventory service', 'sales transaction service']) +
  box(755, 125, 220, 190, 'domain', ['Product / variant', 'Sale / sale item', 'stock rules']) +
  box(1050, 125, 190, 190, 'security', ['Roles / permissions', 'session policy']) +
  box(405, 465, 270, 190, 'persistence', ['Repository interfaces', 'database adapter']) +
  box(755, 465, 220, 190, 'analytics', ['Sales summaries', 'product movement', 'replenishment cues']) +
  box(1050, 465, 190, 190, 'reporting', ['Report queries', 'CSV / PDF output']) +
  arrow(325, 210, 405, 210, 'uses') + arrow(675, 210, 755, 210, 'uses') +
  arrow(540, 315, 540, 465, 'persists') + arrow(865, 315, 865, 465, 'aggregates') +
  arrow(975, 555, 1050, 555, 'feeds') + arrow(1050, 255, 975, 255, 'authorizes', { dash: true }) +
  arrow(675, 520, 755, 270, 'reads', { dash: true }) +
  '</svg>'

const deploymentSvg = startSvg(1360, 760) +
  label(45, 45, 'PROPOSED DEPLOYMENT DIAGRAM', 25, palette.ink, 700) +
  box(45, 155, 260, 210, 'Store staff device', ['Laptop / desktop / tablet', 'Web browser', 'HTTPS connection']) +
  box(390, 115, 295, 290, 'Web hosting node', ['Vercel static hosting', 'or Nginx container', 'React production bundle', 'TLS certificate'], { fill: palette.pale }) +
  box(770, 115, 280, 290, 'Application node', ['Node.js LTS API service', 'Authentication and business rules', 'Private network access', 'Environment-managed secrets'], { fill: '#edf2ee' }) +
  box(1125, 115, 205, 290, 'Data node', ['Managed PostgreSQL', 'Encrypted storage', 'Automated backups']) +
  box(770, 500, 280, 175, 'Operations', ['Monitoring and logs', 'Restore testing', 'Access review']) +
  arrow(305, 260, 390, 260, 'HTTPS') + arrow(685, 260, 770, 260, 'HTTPS / JSON API') +
  arrow(1050, 260, 1125, 260, 'TLS / SQL') + arrow(910, 405, 910, 500, 'monitor') +
  '</svg>'

const diagrams = {
  architecture: architectureSvg,
  'manual-flow': manualSvg,
  'proposed-flow': proposedSvg,
  'use-case': useCaseSvg,
  'class-diagram': classSvg,
  'package-diagram': packageSvg,
  deployment: deploymentSvg,
}
const diagramFiles = Object.fromEntries(
  await Promise.all(Object.entries(diagrams).map(async ([name, svg]) => [name, await saveDiagram(name, svg)])),
)

const figure = (number, title, file, alt) => `<figure><img src="${file}" alt="${alt}"><figcaption>Figure ${number}. ${title}</figcaption></figure>`
const section = (title, body, level = 1) => `<h${level}>${title}</h${level}>${body}`
const paragraph = (text) => `<p>${text}</p>`
const bulletList = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`
const table = (headers, rows) => `<table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Roots.co Proposed System Design</title>
<style>
@page { size: A4; margin: 0.72in 0.72in 0.7in; }
body { font-family: Aptos, Calibri, Arial, sans-serif; color: #202827; font-size: 10.5pt; line-height: 1.42; }
h1 { font-size: 19pt; color: #314d40; margin: 22pt 0 8pt; border-bottom: 1px solid #cbd4cd; padding-bottom: 5pt; }
h2 { font-size: 14pt; color: #314d40; margin: 16pt 0 6pt; }
h3 { font-size: 11pt; color: #202827; margin: 10pt 0 4pt; }
p { margin: 0 0 8pt; }
ul, ol { margin: 2pt 0 10pt 20pt; padding-left: 12pt; }
li { margin: 0 0 3pt; }
table { border-collapse: collapse; width: 100%; margin: 8pt 0 13pt; font-size: 9pt; page-break-inside: avoid; }
th { background: #e8eee9; color: #202827; text-align: left; font-weight: bold; }
th, td { border: 1px solid #b9c4bc; padding: 6pt 7pt; vertical-align: top; }
figure { margin: 12pt 0 18pt; text-align: center; page-break-inside: avoid; }
figure img { width: 100%; height: auto; }
figcaption { font-size: 9pt; color: #52615a; margin-top: 5pt; }
.cover { min-height: 8.3in; display: flex; flex-direction: column; justify-content: center; text-align: center; page-break-after: always; }
.cover h1 { font-size: 24pt; border: 0; color: #243d32; line-height: 1.2; }
.cover .subtitle { font-size: 16pt; font-weight: bold; margin: 18pt auto; max-width: 6in; }
.cover .meta { color: #52615a; margin-top: 16pt; }
.note { background: #f1f3ef; border-left: 4px solid #536d5d; padding: 9pt 12pt; margin: 10pt 0 14pt; }
.small { font-size: 9pt; color: #52615a; }
.page-break { page-break-before: always; }
</style></head><body>
<div class="cover"><p style="text-transform:uppercase;letter-spacing:2px;color:#536d5d">ROOTS.CO CLOTHING ENTERPRISES</p><h1>Proposed System Design and Technical Requirements</h1><p class="subtitle">Web Based Automated Inventory Optimization and Sales Analytics Platform</p><p>Supporting system documentation based on the supplied Chapters 1 and 2 and a review of the current Roots.co web application.</p><p class="meta">Prepared for the Bachelor of Science in Information Technology project study<br>Computer Communication Development Institute Legazpi</p><p class="meta">Design draft | 2026</p></div>
${section('1. Purpose and Design Basis', paragraph('This document describes the proposed architecture, workflows, UML models, and technical requirements for the Web Based Automated Inventory Optimization and Sales Analytics Platform for Roots.co Clothing Enterprises. It follows the project scope stated in the supplied Chapters 1 and 2: product and inventory management, sales transaction recording, automatic stock updates, stock monitoring, low-stock identification, sales analysis, reports, and inventory decision support.') + `<div class="note"><strong>Implementation boundary.</strong> The reviewed Roots.co application is a React/Vite storefront prototype. It includes a demo admin inventory interface and browser-local inventory state, but it does not currently provide a shared server database, durable sales transaction records, payment processing, or historical sales analytics. Diagrams and requirements in this document describe the proposed target system unless explicitly marked as existing prototype behavior.</div>` + paragraph('The manual transaction workflow below is a generalized baseline inferred from the proposal’s discussion of paper records, ledgers, and spreadsheets. Roots.co staff should validate the exact current sequence, payment handling, and end-of-day reconciliation before this workflow is adopted as a factual description of their operations.'))}
${section('2. System Architecture', paragraph('The proposed system uses a browser-based client, a secure application API, a relational data store, and an analytics/reporting layer. Sales and inventory operations are performed through role-appropriate screens. A completed sale is persisted with its line items and corresponding stock movements so inventory and reports remain traceable. The payment method is handled according to the enterprise’s approved procedure; payment-gateway integration is not assumed by this design.') + figure(1, 'Proposed logical system architecture.', diagramFiles.architecture, 'Architecture showing users, React browser client, web hosting, API, database and analytics'))}
${section('2.1 Architecture Components', table(['Component','Responsibility'],[
['Browser client','Responsive interface for the owner/manager, sales personnel, and inventory personnel. Presents product, inventory, transaction, alert, and report screens.'],
['Web hosting','Delivers the built frontend over HTTPS. The current project already supports static hosting through Vercel or Nginx.'],
['Application API','Proposed server-side layer for authentication, authorization, product and inventory operations, transaction validation, stock updates, and report queries.'],
['Relational database','Proposed persistent source of truth for users, roles, product variants, stock balances, sales, sale items, and stock movements.'],
['Analytics/reporting','Calculates period summaries, product movement, low-stock status, and basic restock cues from recorded transactions and current inventory.'],
['External payment handling','Payment is completed through the enterprise’s existing approved method and its confirmation is recorded. No payment provider is selected in the supplied proposal.'],
]))}
${section('3. Manual Transaction Process Flow', paragraph('In the baseline flow, a customer selects an item and sales staff check the available quantity against the physical stock and the business’s paper or spreadsheet record. If stock is available, staff total the items, accept payment using the current store method, write the transaction into a manual sales record, adjust the stock record, and issue a receipt. Records may then be tallied at the end of the day. The exact record format and payment steps require confirmation from Roots.co personnel.') + figure(2, 'Generalized manual in-store transaction flow; validate against actual business practice.', diagramFiles['manual-flow'], 'Manual transaction flow with stock availability decision and end-of-day tally'))}
${section('4. Proposed System Process', paragraph('The proposed sales process authenticates staff, validates each selected product variant and quantity against available stock, calculates the transaction total, and records the sale after staff confirm payment according to store policy. Saving the sale, sale items, stock movements, and updated stock balance should be performed as one database transaction to avoid partial updates. Updated records then feed dashboards and reports; a threshold check can raise a low-stock alert. Inventory replenishment remains a management decision, not an automatic purchase.') + figure(3, 'Proposed transaction, inventory update, and analytics process.', diagramFiles['proposed-flow'], 'Proposed transaction flow including authentication, stock validation, sale persistence, stock update and reports'))}
${section('5. Use Case Diagram', paragraph('The diagram presents the main actors and system functions identified in the project scope. The Owner/Manager reviews analytics and reports and maintains users and products. Inventory Staff maintain stock and monitor alerts. Sales Staff record transactions, which result in stock updates. Customer-facing browsing and online payment are not represented as a POS requirement in this use case model.') + figure(4, 'Proposed platform use cases by staff role.', diagramFiles['use-case'], 'UML use case diagram for owner manager, inventory staff and sales staff'))}
${section('5.1 Primary Use Cases', table(['Actor','Primary use cases'],[
['Owner / Manager','Manage users and roles; manage products; review sales analytics; view inventory and sales reports; use replenishment cues to make stock decisions.'],
['Inventory Staff','View inventory; receive and adjust stock; monitor low-stock and out-of-stock alerts; review stock movement records.'],
['Sales Staff','View product availability; record a sale and its items; confirm payment using the enterprise’s approved process; issue or record a receipt reference.'],
]))}
${section('6. Class Diagram', paragraph('The proposed domain model separates products from product variants because apparel stock may differ by size and color. Inventory is held at the variant level. A sale contains one or more sale items; each sale item references a variant and quantity. Stock movements record both sale-related deductions and manual stock adjustments. User roles govern access to operations. This is a conceptual target model, not a diagram of the present React component implementation.') + figure(5, 'Core proposed domain classes and relationships.', diagramFiles['class-diagram'], 'UML class diagram with users, roles, products, variants, inventory, sales, sale items and stock movements'))}
${section('7. Package Diagram', paragraph('The package model separates presentation, application services, domain rules, persistence, security, analytics, and reporting responsibilities. The presentation layer calls application services rather than writing to the database directly. Analytics and reports consume persisted domain data. Authentication and authorization are applied at the application boundary and enforced server-side in the proposed implementation.') + figure(6, 'Proposed software package dependencies.', diagramFiles['package-diagram'], 'Package diagram for presentation, application, domain, persistence, analytics, reporting and security'))}
${section('8. Deployment Diagram', paragraph('The deployment model separates static web delivery from business logic and persistent data. It is compatible with the existing Vercel or Nginx static frontend deployment while adding a proposed API service and managed relational database. These backend nodes are requirements for the target system and are not currently present in the deployed prototype. Production secrets must be stored in deployment environment configuration, not browser code.') + figure(7, 'Proposed target deployment topology.', diagramFiles.deployment, 'Deployment diagram showing browser, static host, API service, PostgreSQL database and operations'))}
${section('9. Hardware Requirements', paragraph('The following are proposed minimum starting requirements for a small enterprise deployment. Server sizing is an initial estimate and should be confirmed through load testing and the expected number of concurrent users, transactions, and retained reports.') + table(['Environment','Minimum requirement','Recommended / notes'],[
['Staff workstation','Dual-core processor; 4 GB RAM; 1366 × 768 display; current supported browser.','Modern quad-core processor; 8 GB RAM; 1920 × 1080 display for inventory and analytics tables.'],
['Mobile / tablet access','Android 10 or later, or iOS 16 or later; 3 GB RAM; current browser.','Use for inventory lookups and lightweight adjustments; a larger display is preferred for reports and bulk editing.'],
['Network','Stable broadband connection, approximately 5 Mbps available for the application.','Wired or reliable Wi-Fi for fixed checkout/inventory stations; provide a documented offline contingency because the system is web-based.'],
['Application server','Cloud-hosted service with 2 vCPU and 4 GB RAM as an initial small-deployment baseline.','Scale based on load tests; TLS endpoint, monitoring, and automated deployment required.'],
['Database server','Managed relational database with 2 vCPU, 4 GB RAM, and at least 20 GB SSD allocated initially.','Automated encrypted backups, point-in-time recovery where available, and periodic restore testing. Storage must grow with sales history and images.'],
['Optional peripherals','Receipt printer and barcode scanner if used by the enterprise’s transaction workflow.','Confirm printer/scanner models and browser compatibility before procurement.'],
]))}
${section('10. Software Requirements', paragraph('These requirements distinguish the current prototype stack from the proposed production platform. Backend and database products are recommendations for implementation, not technologies already present in the supplied application.') + table(['Area','Proposed requirement'],[
['Client','Supported current versions of Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari on Windows 10/11, macOS, or Android/iOS. JavaScript and cookies/local storage enabled for the current prototype; secure HTTPS required for production.'],
['Frontend','Existing project: React 19, JavaScript ES modules, Vite 8, Tailwind CSS 3, lucide-react; Node.js 22 LTS for build tooling; Vercel static deployment or Docker/Nginx deployment.'],
['Application backend','Required for the proposed shared and persistent system: server-side API (Node.js 22 LTS is compatible with the current project, but framework selection remains an implementation decision), input validation, authentication, authorization, and transaction-safe stock updates.'],
['Database','Required for proposed multi-user persistence: PostgreSQL 15+ or another selected relational DBMS; relational constraints, indexes, migration management, encrypted backups, and least-privilege database access.'],
['Analytics and reports','Server-side queries or scheduled jobs over persisted sale and stock-movement records. Basic summaries and fast/slow product identification are in scope; any forecast method and evaluation criteria must be selected and documented separately.'],
['Security / operations','HTTPS/TLS, server-side role checks, secure password/session handling, secrets outside source control, audit logging for sensitive stock changes, monitoring, backup and recovery procedures.'],
['Developer / build environment','Git, npm, Node.js 22 LTS, Vite build tooling, and a supported operating system. Docker is optional for the Nginx deployment path.'],
]))}
${section('11. Existing Prototype and Proposed Target', table(['Capability','Current Roots.co prototype','Proposed target'],[
['Storefront and product catalog','Implemented as a React/Vite browser app; the current catalog is limited to the configured products.','Manage product records and apparel variants centrally.'],
['Inventory controls','Admin UI supports add/edit/delete, stock adjustments, low-stock checks, and aggregate stock statistics; state is stored in browser local storage.','Shared database-backed stock records, audit trail, role enforcement on the server, and concurrent-safe updates.'],
['Sales transaction records','The checkout is a demonstration flow; no durable transaction ledger or payment processing is implemented.','Persist sales and sale items; keep a transaction history and connect each sale to stock movements.'],
['Sales analytics','The current inventory view shows stock metrics, not historical sales analytics.','Generate period-based sales summaries, trends, best/slow movers, and reports from transaction history.'],
['Authentication','Client-side demonstration sign-in/session behavior.','Production authentication, server-validated permissions, and secure session lifecycle.'],
]))}
${section('12. Assumptions and Items to Validate', bulletList([
'Confirm whether the primary transaction is an in-store staff-operated POS sale, an online customer order, or both. This draft models a staff-operated in-store transaction.',
'Confirm the actual manual records currently used, who records sales, when stock is deducted, how returns/voids are handled, and how daily totals are reconciled.',
'Confirm product variant dimensions (size, color, SKU), tax and discount rules, accepted payment methods, receipt requirements, and the stock replenishment threshold policy.',
'Select the backend framework, database hosting provider, backup retention, and deployment ownership before implementation.',
'Define measurable analytics: reporting periods, definition of fast/slow movement, treatment of returns and cancellations, and whether forecasting is required. The supplied scope supports basic decision-support analytics; it does not specify a validated forecasting algorithm.',
'Keep the design within the proposal delimitations: no payroll, accounting, HR, automatic purchasing, customer profiling, or advanced AI unless scope is formally revised.'
]))}
${section('Source Basis', paragraph('Primary study basis: the user-supplied project proposal, “The Development of a Web Based Automated Inventory Optimization and Sales Analytics Platform for Roots.co Clothing Enterprises,” Chapters 1 and 2. Implementation comparison: review of the Roots.co React/Vite source code, including inventory, cart, checkout, authentication, deployment, and configuration modules. This document is a system-design draft; confirm operational assumptions with the enterprise and the project adviser before final academic submission.'))}
</body></html>`

const htmlFile = join(outputDirectory, 'Roots.co-System-Design.html')
await writeFile(htmlFile, html, 'utf8')
console.log(`HTML and diagrams generated under ${outputDirectory}`)
console.log(`Open ${htmlFile} in Microsoft Word and save as .docx to create the final document.`)
