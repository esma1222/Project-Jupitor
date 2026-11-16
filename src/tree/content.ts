// Werttreiberbaum vom Umsatz zum EBITDA (value driver tree).
// Anonymised to codename Jupiter. All amounts are index points: group revenue 2025 AC = 100.

export type TagKind = 'secured' | 'running' | 'lever' | 'plan' | 'tbc' | 'risk' | 'bridge';

export interface Leaf { title: string; evidence: string; tag: TagKind; tagLabel: string; effect: string }
export interface Component { title: string; titleNote?: string; values: string[] | null; sub?: string; leaves: Leaf[] }
export interface Branch { title: string; titleNote?: string; values: string[]; lines: string[]; children: Component[] }

const de = {
  navTree: 'Werttreiberbaum',
  navPlanner: 'Szenarioplanung',
  brand: 'Werttreiberbaum',
  conf: 'Streng vertraulich',
  headline: 'EBITDA +3,8 Indexpunkte bis 2027: Lizenzen sind der Hebel, der Ankerkunde das größte Risiko',
  subtitle: 'Werttreiber vom Umsatzwachstum zum EBITDA der Gruppe',
  toPlanner: 'Zur Szenarioplanung',
  toTree: 'Zum Werttreiberbaum',
  bridgeTitle: 'Planbrücke der Gruppe, Index (Umsatz 2025 = 100), 25 AC..27 PL',
  cols: ['Position', '25 AC', '26 FC', '27 PL', 'Δ 25..27'],
  rows: [
    { k: 'Lizenzen', v: ['14,2', '16,4', '18,6', '+4,4'] },
    { k: 'Services', v: ['83,3', '83,6', '88,2', '+4,9'] },
    { k: 'Sonstige', v: ['2,5', '1,4', '0,9', '(1,6)'] },
    { k: 'Umsatz', v: ['100,0', '101,4', '107,7', '+7,7'], bold: true },
    { k: 'Kostenbasis', v: ['90,1', '89,1', '94,0', '+3,9'] },
    { k: 'EBITDA', v: ['9,9', '12,3', '13,7', '+3,8'], bold: true },
    { k: 'EBITDA-Marge', v: ['9,9%', '12,2%', '12,7%', '+2,8pp'] },
  ],
  messages: [
    ['Die inkrementelle Marge liegt bei 50%.', '+7,7 Indexpunkte Umsatz sollen +3,8 Indexpunkte EBITDA bringen. 2026 steigt das EBITDA um 2,4 Indexpunkte bei nur +1,4 Indexpunkten Umsatz, die Kostenseite trägt.'],
    ['Lizenzen sind der Motor.', 'Sie wachsen um 14% p. a., Services um 3%. Bei 80% Flow-through erklärt der Lizenzzuwachs rund 3,5 der 3,8 Indexpunkte EBITDA-Plus.'],
    ['1,0 Indexpunkt EBITDA entspricht 10,5-14,5 Indexpunkten EV.', 'Die Spanne reicht von 10,5x (Peer-Median) bis 14,5x (Transaktionsmedian).'],
  ],
  colHeads: ['Komponenten', 'Operative Treiber und Evidenz', 'EBITDA-Wirkung'],
  root: { title: 'EBITDA Gruppe', lines: ['unbereinigt, Index (Umsatz 2025 = 100)'], values: ['9,9', '12,3', '13,7'], after: ['Marge von 9,9% auf 12,7%', '+18% p. a. von 2025 bis 2027'] },
  branches: [
    {
      title: 'Umsatz Gruppe', values: ['100,0', '101,4', '107,7'],
      lines: ['+3,8% p. a. von 2025 bis 2027', 'Ankerkunde > 25% des Umsatzes'],
      children: [
        {
          title: 'Lizenzen & Wartung', values: ['14,2', '16,4', '18,6'], sub: '+14% p. a., Anteil von 14% auf 17%',
          leaves: [
            { title: 'Bestand halten (Retention)', evidence: 'Churn < 2% (2025); langjähriger Ankerkunde; Top-10 > 70% des Umsatzes der Kerngesellschaft', tag: 'secured', tagLabel: 'gesichert', effect: '1pp Churn = 0,9 Indexpunkte Umsatz und rund -0,5 Indexpunkte EBITDA' },
            { title: 'Neue Großkunden', evidence: 'Neukundengewinnung in Wachstumsmärkten', tag: 'running', tagLabel: 'läuft', effect: 'je 1 Indexpunkt Lizenz/Wartung ≈ +0,8 Indexpunkte EBITDA; Einführung zuerst als Services' },
            { title: 'Volumen × Preis', evidence: 'Preisgestaltung im Bestand [TBC]', tag: 'lever', tagLabel: 'Hebel', effect: '+2% Preis auf wiederkehrende Erlöse (≈ 46,6 Indexpunkte) = +0,9 Indexpunkte EBITDA' },
            { title: 'Suite-Cross-Sell im Bestand', evidence: 'Zusatzmodule der Suite; neue Produktgeneration mit regelmäßigen Releases', tag: 'plan', tagLabel: 'Plan', effect: 'Lizenzen +4,4 Indexpunkte bis 2027 ≈ +3,5 Indexpunkte EBITDA, fast das ganze Plus' },
            { title: 'SaaS-Angebot', evidence: 'Subscription-Modell', tag: 'tbc', tagLabel: '[TBC]', effect: 'Umsatzanteil offen; Hebel ≈ +0,8 Indexpunkte EBITDA je 1 Indexpunkt Umsatz' },
          ],
        },
        {
          title: 'Services', titleNote: '(Projekte, Beratung, Betrieb)', values: ['83,3', '83,6', '88,2'], sub: '+3% p. a., Anteil von 83% auf 82%',
          leaves: [
            { title: 'Rahmenverträge', evidence: 'Mehrjährige Rahmenverträge; Verlängerung beim Ankerkunden offen', tag: 'risk', tagLabel: 'Risiko', effect: 'Ankerkunde > 25% des Umsatzes; Vertragsverlängerung offen' },
            { title: 'Kapazität × Auslastung × Tagessatz', evidence: 'Auslastung und Tagessätze [TBC]', tag: 'lever', tagLabel: 'Hebel', effect: 'je 1 Indexpunkt Services ≈ +0,25 Indexpunkte EBITDA' },
            { title: 'Betriebsleistungen (Managed Services)', evidence: 'Betrieb eigener und fremder Anwendungen; Rückenwind aus Fachkräftemangel bei Kunden', tag: 'tbc', tagLabel: '[TBC]', effect: 'wiederkehrend; Marge Betrieb vs. Projekt offen' },
          ],
        },
        {
          title: 'Sonstige', titleNote: '(rechnerischer Rest)', values: ['2,5', '1,4', '0,9'],
          leaves: [
            { title: 'Portfoliobereinigung', evidence: 'Sonstige Erlöse laufen aus', tag: 'bridge', tagLabel: 'Brücke', effect: 'EBITDA-neutral' },
          ],
        },
      ],
    },
    {
      title: 'Kostenbasis', titleNote: '(Umsatz minus EBITDA)', values: ['90,1', '89,1', '94,0'],
      lines: ['2026: -1,0 Indexpunkte trotz Umsatzplus'],
      children: [
        {
          title: 'Personalaufwand', values: null, sub: '59% vom Umsatz (Kerngesellschaft 2025)',
          leaves: [{ title: 'Delivery-Effizienz', evidence: 'Konfiguration statt Customizing, geringerer Upgrade-Aufwand; KI in der Entwicklung', tag: 'lever', tagLabel: 'Hebel', effect: '1% Personalkosten = 0,5 Indexpunkte EBITDA' }],
        },
        {
          title: 'Material & sonstige OPEX', values: null, sub: '32% vom Umsatz (Kerngesellschaft 2025)',
          leaves: [{ title: 'Kostenprogramm 2025', evidence: 'EBITDA-Sprung 2025 aus Kostenreduzierung', tag: 'tbc', tagLabel: '[TBC]', effect: '1% Sachkosten = 0,3 Indexpunkte EBITDA; Einmalaufwand bereinigen' }],
        },
      ],
    },
  ] as Branch[],
  periods: ['25 AC', '26 FC', '27 PL'],
};

const en: typeof de = {
  navTree: 'Value driver tree',
  navPlanner: 'Scenario planning',
  brand: 'Value driver tree',
  conf: 'Strictly confidential',
  headline: 'EBITDA +3.8 index points by 2027: licenses are the lever, the anchor customer is the biggest risk',
  subtitle: 'Value drivers from revenue growth to group EBITDA',
  toPlanner: 'To scenario planning',
  toTree: 'To value driver tree',
  bridgeTitle: 'Plan bridge of the group, index (revenue 2025 = 100), 25 AC..27 PL',
  cols: ['Item', '25 AC', '26 FC', '27 PL', 'Δ 25..27'],
  rows: [
    { k: 'Licenses', v: ['14.2', '16.4', '18.6', '+4.4'] },
    { k: 'Services', v: ['83.3', '83.6', '88.2', '+4.9'] },
    { k: 'Other', v: ['2.5', '1.4', '0.9', '(1.6)'] },
    { k: 'Revenue', v: ['100.0', '101.4', '107.7', '+7.7'], bold: true },
    { k: 'Cost base', v: ['90.1', '89.1', '94.0', '+3.9'] },
    { k: 'EBITDA', v: ['9.9', '12.3', '13.7', '+3.8'], bold: true },
    { k: 'EBITDA margin', v: ['9.9%', '12.2%', '12.7%', '+2.8pp'] },
  ],
  messages: [
    ['The incremental margin is 50%.', '+7.7 index points of revenue are meant to deliver +3.8 index points of EBITDA. In 2026 EBITDA rises by 2.4 index points on only +1.4 index points of revenue; the cost side carries it.'],
    ['Licenses are the engine.', 'They grow by 14% p. a., services by 3%. At 80% flow-through, license growth explains about 3.5 of the 3.8 index points of EBITDA increase.'],
    ['1.0 index point of EBITDA equals 10.5-14.5 index points of EV.', 'The range runs from 10.5x (peer median) to 14.5x (transaction median).'],
  ],
  colHeads: ['Components', 'Operational drivers and evidence', 'EBITDA effect'],
  root: { title: 'EBITDA group', lines: ['unadjusted, index (revenue 2025 = 100)'], values: ['9.9', '12.3', '13.7'], after: ['Margin from 9.9% to 12.7%', '+18% p. a. from 2025 to 2027'] },
  branches: [
    {
      title: 'Revenue group', values: ['100.0', '101.4', '107.7'],
      lines: ['+3.8% p. a. from 2025 to 2027', 'Anchor customer > 25% of revenue'],
      children: [
        {
          title: 'Licenses & maintenance', values: ['14.2', '16.4', '18.6'], sub: '+14% p. a., share from 14% to 17%',
          leaves: [
            { title: 'Retain the base (retention)', evidence: 'Churn < 2% (2025); long-standing anchor customer; top 10 > 70% of core-entity revenue', tag: 'secured', tagLabel: 'secured', effect: '1pp churn = 0.9 index points of revenue and approx. -0.5 index points of EBITDA' },
            { title: 'New major customers', evidence: 'New customer acquisition in growth markets', tag: 'running', tagLabel: 'ongoing', effect: 'per 1 index point of license/maintenance ≈ +0.8 index points of EBITDA; roll-out starts as services' },
            { title: 'Volume × price', evidence: 'Pricing in the existing base [TBC]', tag: 'lever', tagLabel: 'Lever', effect: '+2% price on recurring revenue (≈ 46.6 index points) = +0.9 index points of EBITDA' },
            { title: 'Suite cross-sell in the base', evidence: 'Add-on modules of the suite; new product generation with regular releases', tag: 'plan', tagLabel: 'Plan', effect: 'Licenses +4.4 index points by 2027 ≈ +3.5 index points of EBITDA, almost the whole increase' },
            { title: 'SaaS offering', evidence: 'Subscription model', tag: 'tbc', tagLabel: '[TBC]', effect: 'Revenue share open; lever ≈ +0.8 index points of EBITDA per 1 index point of revenue' },
          ],
        },
        {
          title: 'Services', titleNote: '(projects, consulting, operations)', values: ['83.3', '83.6', '88.2'], sub: '+3% p. a., share from 83% to 82%',
          leaves: [
            { title: 'Framework agreements', evidence: 'Multi-year framework agreements; extension of anchor customer open', tag: 'risk', tagLabel: 'Risk', effect: 'Anchor customer > 25% of revenue; contract extension open' },
            { title: 'Capacity × utilization × day rate', evidence: 'Utilization and day rates [TBC]', tag: 'lever', tagLabel: 'Lever', effect: 'per 1 index point of services ≈ +0.25 index points of EBITDA' },
            { title: 'Operational services (managed services)', evidence: 'Operating own and third-party applications; tailwind from customers\' skills shortage', tag: 'tbc', tagLabel: '[TBC]', effect: 'recurring; margin operations vs. projects open' },
          ],
        },
        {
          title: 'Other', titleNote: '(arithmetic remainder)', values: ['2.5', '1.4', '0.9'],
          leaves: [
            { title: 'Portfolio clean-up', evidence: 'Other revenues expire', tag: 'bridge', tagLabel: 'Bridge', effect: 'EBITDA-neutral' },
          ],
        },
      ],
    },
    {
      title: 'Cost base', titleNote: '(revenue minus EBITDA)', values: ['90.1', '89.1', '94.0'],
      lines: ['2026: -1.0 index points despite higher revenue'],
      children: [
        {
          title: 'Personnel costs', values: null, sub: '59% of revenue (core entity 2025)',
          leaves: [{ title: 'Delivery efficiency', evidence: 'Configuration instead of customizing, lower upgrade effort; AI in development', tag: 'lever', tagLabel: 'Lever', effect: '1% personnel costs = 0.5 index points of EBITDA' }],
        },
        {
          title: 'Materials & other OPEX', values: null, sub: '32% of revenue (core entity 2025)',
          leaves: [{ title: 'Cost program 2025', evidence: 'EBITDA jump 2025 from cost reduction', tag: 'tbc', tagLabel: '[TBC]', effect: '1% other costs = 0.3 index points of EBITDA; adjust for one-off costs' }],
        },
      ],
    },
  ],
  periods: ['25 AC', '26 FC', '27 PL'],
};

export const TREE = { de, en };

// Template colours only. Traffic lights with meaning: green secured, yellow open, red risk; everything else blue.
export const TAG_STYLE: Record<TagKind, { bg: string; fg: string }> = {
  secured: { bg: '#00B167', fg: '#FFFFFF' },
  running: { bg: '#003E5F', fg: '#FFFFFF' },
  lever: { bg: '#003E5F', fg: '#FFFFFF' },
  plan: { bg: '#003E5F', fg: '#FFFFFF' },
  tbc: { bg: '#FFC000', fg: '#000000' },
  risk: { bg: '#F34832', fg: '#FFFFFF' },
  bridge: { bg: '#003E5F', fg: '#FFFFFF' },
};
