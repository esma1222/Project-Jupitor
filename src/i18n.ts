// UI copy, German and English, anonymised to codename Jupiter.
// All amounts are index points (group revenue 2025 AC = 100).
export interface InsightArgs { top: string; topSpan: string; m: string; topEV: string; sec: string; secSpan: string; half: string }

export const T = {
  de: {
    brand: 'Szenarioplanung', navDrivers: 'Treiber', navBridge: 'EBITDA-Brücke', navBasis: 'Datenbasis', conf: 'Streng vertraulich',
    heroTitle: 'Welche Treiber bewegen das EBITDA 2027 und damit den Unternehmenswert?',
    presets: ['Managementplan', 'Downside', 'Upside', 'Stresstest Ankerkunde'],
    groups: ['Umsatztreiber', 'Kostentreiber', 'Annahmen und Bewertung'],
    via: { volL: 'wirkt nur bei neuen Großkunden', volS: 'wirkt nur bei neuen Großkunden', ftL: 'wirkt auf Wachstum, Neukunden und Churn', ftS: 'wirkt auf Wachstum, Neukunden und Churn', ftAnc: 'wirkt nur beim Ankerkunden-Risiko', mult: 'wirkt nur auf den EV' } as Record<string, string>,
    reset: 'Auf Managementplan zurücksetzen', unit: 'Indexpunkte',
    land: 'Kunde', lands: 'Kunden', to: 'bis',
    drivers: {
      gL: ['Lizenz- und Wartungswachstum p. a. 25 bis 27', 'Plan 14,4% (14,2 auf 18,6 Indexpunkte)', 'das Lizenzwachstum'],
      nL: ['Neue Großkunden bis 2027', 'zusätzlich zum Plan', 'der Gewinn neuer Großkunden'],
      price: ['Preisanpassung wiederkehrende Erlöse', 'Basis rund 46,6 Indexpunkte wiederkehrend', 'die Preisanpassung'],
      churn: ['Zusätzlicher Churn ggü. Plan', '1pp entspricht rund 0,9 Indexpunkten Umsatz; 2025: unter 2%', 'der Churn'],
      gS: ['Serviceswachstum p. a. 25 bis 27', 'Plan 2,9% (83,3 auf 88,2 Indexpunkte)', 'das Serviceswachstum'],
      anc: ['Ankerkunden-Risiko: Umsatzverlust (Run-Rate)', 'Ankerkunde > 25% des Umsatzes; Vertragsverlängerung offen', 'das Ankerkunden-Risiko'],
      pers: ['Personalkosten ggü. Plan', 'Basis 61,4 Indexpunkte (Gruppe 2025)', 'die Personalkostenentwicklung'],
      sach: ['Material und sonstige OPEX ggü. Plan', 'Basis 35,1 Indexpunkte (Gruppe 2025)', 'die Sachkostenentwicklung'],
      volL: ['Lizenz/Wartung je neuem Großkunden, Indexpunkte p. a.', 'Annahme [TBC]'],
      volS: ['Einführungs-Services je neuem Großkunden, Indexpunkte', 'Annahme'],
      ftL: ['Flow-through Lizenz/Wartung', 'Anteil Mehrumsatz, der ins EBITDA geht'],
      ftS: ['Flow-through Services', 'Projektgeschäft, personalintensiv'],
      ftAnc: ['Flow-through Umsatz Ankerkunde', 'Mischung Lizenz und Services'],
      mult: ['EV/EBITDA-Multiple', '14,5x Transaktionsmedian']
    },
    vsPlan: 'ggü. Plan',
    kRev: 'Umsatz 2027, Index', kRevSub: 'Wachstum 25 bis 27: ', pa: '% p. a.',
    kE: 'EBITDA 2027, Index', kESub: 'Basis für die Bewertung',
    kM: 'EBITDA-Marge 2027', kMSub: '2025: 9,9%',
    kEV: (m: string) => 'EV bei ' + m + 'x, Index', kEVSub: 'auf EBITDA 2027, vor Net Debt',
    bars: ['Plan 27 PL', 'Lizenzen', 'Services', 'Neue Kunden', 'Preis', 'Churn', 'Personal', 'Sach\u00adkosten', 'Anker\u00adkunde', 'Szenario'],
    bridgeTitle: 'EBITDA-Brücke Plan 27 PL zum Szenario', bridgeSub: 'In Indexpunkten (Umsatz 2025 = 100). Plan grau, Szenario blau, Zuwachs grün, Rückgang rot',
    tornTitle: 'Tornado: EBITDA 27 bei Ausschlag eines Treibers, in Indexpunkten',
    reading: 'Lesart',
    insight: (a: InsightArgs) => 'Größter Einzelhebel auf das EBITDA 2027 ist ' + a.top + ' (Spanne ' + a.topSpan + ' Indexpunkte, bei ' + a.m + 'x rund ' + a.topEV + ' Indexpunkte EV). An zweiter Stelle steht ' + a.sec + ' (' + a.secSpan + ' Indexpunkte). Jeder Indexpunkt EBITDA entspricht bei diesem Multiple ' + a.half + ' Indexpunkten Unternehmenswert. Services bringen viel Umsatz, aber wenig EBITDA; Lizenzen, Preis und Bestandssicherung tragen den Wert.'
  },
  en: {
    brand: 'Scenario planning', navDrivers: 'Drivers', navBridge: 'EBITDA bridge', navBasis: 'Data basis', conf: 'Strictly confidential',
    heroTitle: 'Which drivers move EBITDA 2027 and with it the enterprise value?',
    presets: ['Management plan', 'Downside', 'Upside', 'Stress test anchor customer'],
    groups: ['Revenue drivers', 'Cost drivers', 'Assumptions and valuation'],
    via: { volL: 'only affects new major customers', volS: 'only affects new major customers', ftL: 'affects growth, new customers and churn', ftS: 'affects growth, new customers and churn', ftAnc: 'only affects anchor customer risk', mult: 'only affects EV' } as Record<string, string>,
    reset: 'Reset to management plan', unit: 'index points',
    land: 'customer', lands: 'customers', to: 'to',
    drivers: {
      gL: ['License and maintenance growth p. a. 25 to 27', 'Plan 14.4% (14.2 to 18.6 index points)', 'license growth'],
      nL: ['New major customers by 2027', 'in addition to the plan', 'winning new major customers'],
      price: ['Price adjustment on recurring revenue', 'Base approx. 46.6 index points recurring', 'the price adjustment'],
      churn: ['Additional churn vs. plan', '1pp equals approx. 0.9 index points of revenue; 2025: below 2%', 'churn'],
      gS: ['Services growth p. a. 25 to 27', 'Plan 2.9% (83.3 to 88.2 index points)', 'services growth'],
      anc: ['Anchor customer risk: loss of revenue (run-rate)', 'Anchor customer > 25% of revenue; contract extension pending', 'the anchor customer risk'],
      pers: ['Personnel costs vs. plan', 'Base 61.4 index points (group 2025)', 'personnel cost development'],
      sach: ['Materials and other OPEX vs. plan', 'Base 35.1 index points (group 2025)', 'material cost development'],
      volL: ['License/maintenance per new major customer, index points p. a.', 'Assumption [TBC]'],
      volS: ['Implementation services per new major customer, index points', 'Assumption'],
      ftL: ['Flow-through license/maintenance', 'Share of additional revenue reaching EBITDA'],
      ftS: ['Flow-through services', 'Project business, personnel-intensive'],
      ftAnc: ['Flow-through revenue anchor customer', 'Mix of license and services'],
      mult: ['EV/EBITDA multiple', '14.5x transaction median']
    },
    vsPlan: 'vs. plan',
    kRev: 'Revenue 2027, index', kRevSub: 'Growth 25 to 27: ', pa: '% p. a.',
    kE: 'EBITDA 2027, index', kESub: 'Basis for the valuation',
    kM: 'EBITDA margin 2027', kMSub: '2025: 9.9%',
    kEV: (m: string) => 'EV at ' + m + 'x, index', kEVSub: 'on EBITDA 2027, before net debt',
    bars: ['Plan 27 PL', 'Licen\u00adses', 'Servi\u00adces', 'New custo\u00admers', 'Price', 'Churn', 'Person\u00adnel', 'Mate\u00adrials', 'Anchor custo\u00admer', 'Scena\u00adrio'],
    bridgeTitle: 'EBITDA bridge from plan 27 PL to scenario', bridgeSub: 'In index points (revenue 2025 = 100). Plan gray, scenario blue, increase green, decrease red',
    tornTitle: 'Tornado: EBITDA 27 when a single driver swings, in index points',
    reading: 'Reading',
    insight: (a: InsightArgs) => 'The largest single lever on EBITDA 2027 is ' + a.top + ' (range ' + a.topSpan + ' index points, at ' + a.m + 'x approx. ' + a.topEV + ' index points EV). Second is ' + a.sec + ' (' + a.secSpan + ' index points). Every index point of EBITDA equals ' + a.half + ' index points of enterprise value at this multiple. Services bring a lot of revenue but little EBITDA; licenses, pricing and customer retention carry the value.'
  }
};

export type Lang = keyof typeof T;
export type Copy = (typeof T)['de'];
export type DriverCopy = Copy['drivers'];
