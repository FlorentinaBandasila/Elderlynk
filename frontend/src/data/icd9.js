/**
 * Coduri ICD-9-CM cu diagnosticul asociat în limba română.
 *
 * Listă curată cu cele mai relevante diagnostice pentru îngrijirea pacienților
 * vârstnici (cardiovascular, metabolic, respirator, neurologic, musculo-scheletal
 * etc.). Folosită în formularul de consultație ca dropdown cu căutare.
 *
 * Fiecare intrare: { code: <cod ICD-9>, label: <diagnostic în română> }
 */
export const ICD9_CODES = [
  // --- Boli infecțioase ---
  { code: '079.99', label: 'Infecție virală, nespecificată' },
  { code: '599.0', label: 'Infecție de tract urinar, localizare nespecificată' },
  { code: '486', label: 'Pneumonie cu agent patogen neprecizat' },

  // --- Neoplazii ---
  { code: '199.1', label: 'Neoplasm malign, fără precizarea localizării' },
  { code: '239.9', label: 'Neoplasm cu evoluție neprecizată, localizare nespecificată' },

  // --- Boli endocrine, nutriție și metabolism ---
  { code: '250.00', label: 'Diabet zaharat tip 2, fără complicații' },
  { code: '250.02', label: 'Diabet zaharat tip 2, dezechilibrat' },
  { code: '250.40', label: 'Diabet zaharat tip 2 cu complicații renale' },
  { code: '250.60', label: 'Diabet zaharat tip 2 cu complicații neurologice' },
  { code: '244.9', label: 'Hipotiroidism, nespecificat' },
  { code: '242.90', label: 'Hipertiroidism (tireotoxicoză), nespecificat' },
  { code: '272.0', label: 'Hipercolesterolemie pură' },
  { code: '272.4', label: 'Hiperlipidemie, nespecificată' },
  { code: '276.51', label: 'Deshidratare' },
  { code: '276.8', label: 'Hipopotasemie' },
  { code: '278.00', label: 'Obezitate, nespecificată' },
  { code: '263.9', label: 'Malnutriție proteino-calorică, nespecificată' },

  // --- Boli ale sângelui ---
  { code: '285.9', label: 'Anemie, nespecificată' },
  { code: '280.9', label: 'Anemie feriprivă, nespecificată' },

  // --- Tulburări mentale și de comportament ---
  { code: '290.0', label: 'Demență senilă, necomplicată' },
  { code: '294.20', label: 'Demență, fără tulburări de comportament' },
  { code: '331.0', label: 'Boala Alzheimer' },
  { code: '296.20', label: 'Tulburare depresivă majoră, episod unic' },
  { code: '311', label: 'Tulburare depresivă, neclasificată în altă parte' },
  { code: '300.00', label: 'Tulburare anxioasă, nespecificată' },
  { code: '780.93', label: 'Tulburări de memorie' },

  // --- Sistem nervos și organe de simț ---
  { code: '332.0', label: 'Boala Parkinson' },
  { code: '345.90', label: 'Epilepsie, nespecificată' },
  { code: '356.9', label: 'Neuropatie periferică, nespecificată' },
  { code: '784.0', label: 'Cefalee' },
  { code: '780.4', label: 'Amețeală și vertij' },
  { code: '386.00', label: 'Vertij (sindrom Ménière), nespecificat' },
  { code: '366.9', label: 'Cataractă, nespecificată' },
  { code: '365.9', label: 'Glaucom, nespecificat' },
  { code: '389.9', label: 'Hipoacuzie (pierdere de auz), nespecificată' },

  // --- Aparat circulator ---
  { code: '401.9', label: 'Hipertensiune arterială esențială, nespecificată' },
  { code: '402.90', label: 'Boală cardiacă hipertensivă, fără insuficiență cardiacă' },
  { code: '414.00', label: 'Boală cardiacă ischemică (ateroscleroză coronariană)' },
  { code: '413.9', label: 'Angină pectorală, nespecificată' },
  { code: '410.90', label: 'Infarct miocardic acut, nespecificat' },
  { code: '427.31', label: 'Fibrilație atrială' },
  { code: '427.9', label: 'Aritmie cardiacă, nespecificată' },
  { code: '428.0', label: 'Insuficiență cardiacă congestivă, nespecificată' },
  { code: '434.91', label: 'Accident vascular cerebral (ocluzie arterială cerebrală)' },
  { code: '436', label: 'Boală cerebrovasculară acută, prost definită' },
  { code: '440.9', label: 'Ateroscleroză generalizată, nespecificată' },
  { code: '443.9', label: 'Boală vasculară periferică, nespecificată' },
  { code: '453.40', label: 'Tromboză venoasă profundă a membrelor inferioare' },
  { code: '459.81', label: 'Insuficiență venoasă (periferică), nespecificată' },

  // --- Aparat respirator ---
  { code: '496', label: 'Bronhopneumopatie obstructivă cronică (BPOC)' },
  { code: '491.20', label: 'Bronșită cronică obstructivă, fără exacerbare' },
  { code: '493.90', label: 'Astm bronșic, nespecificat' },
  { code: '786.05', label: 'Dispnee (dificultate de respirație)' },
  { code: '786.2', label: 'Tuse' },
  { code: '465.9', label: 'Infecție acută de căi respiratorii superioare' },

  // --- Aparat digestiv ---
  { code: '530.81', label: 'Boală de reflux gastroesofagian (BRGE)' },
  { code: '535.50', label: 'Gastrită, fără hemoragie' },
  { code: '564.00', label: 'Constipație, nespecificată' },
  { code: '787.91', label: 'Diaree' },
  { code: '789.00', label: 'Durere abdominală, localizare nespecificată' },

  // --- Aparat genito-urinar ---
  { code: '585.9', label: 'Boală cronică de rinichi, nespecificată' },
  { code: '600.00', label: 'Hipertrofie benignă de prostată, fără obstrucție' },
  { code: '788.30', label: 'Incontinență urinară, nespecificată' },
  { code: '788.20', label: 'Retenție urinară, nespecificată' },

  // --- Piele și țesut subcutanat ---
  { code: '707.00', label: 'Escară de decubit (ulcer de presiune), localizare nespecificată' },
  { code: '682.9', label: 'Celulită, localizare nespecificată' },

  // --- Sistem musculo-scheletal și țesut conjunctiv ---
  { code: '715.90', label: 'Osteoartrită (artroză), nespecificată' },
  { code: '714.0', label: 'Poliartrită reumatoidă' },
  { code: '733.00', label: 'Osteoporoză, nespecificată' },
  { code: '724.2', label: 'Lombalgie (durere lombară)' },
  { code: '719.46', label: 'Durere articulară la genunchi' },
  { code: '729.5', label: 'Durere la nivelul membrelor' },

  // --- Simptome, semne și stări prost definite ---
  { code: '780.60', label: 'Febră, nespecificată' },
  { code: '780.79', label: 'Astenie (oboseală și fatigabilitate)' },
  { code: '783.21', label: 'Pierdere în greutate' },
  { code: '780.2', label: 'Sincopă și colaps' },
  { code: '780.52', label: 'Insomnie, nespecificată' },
  { code: '781.2', label: 'Tulburări de mers și de mobilitate' },
  { code: '719.7', label: 'Dificultate la mers' },

  // --- Leziuni traumatice ---
  { code: 'E888.9', label: 'Cădere accidentală, nespecificată' },
  { code: '959.9', label: 'Traumatism, localizare nespecificată' },
  { code: '820.8', label: 'Fractură de col femural (șold), închisă' },
  { code: '807.00', label: 'Fractură de coastă, închisă' },
]

/**
 * Caută diagnosticul asociat unui cod ICD-9.
 * @param {string} code
 * @returns {string} eticheta (diagnosticul) sau șir gol dacă nu există
 */
export function getDiagnosticByCode(code) {
  const entry = ICD9_CODES.find(c => c.code === code)
  return entry ? entry.label : ''
}
