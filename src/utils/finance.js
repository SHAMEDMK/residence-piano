export const MONTANT_COTISATION = 200
export const DEVISE = 'DH'
export const ANNEE_DEBUT = 2026
export const MOIS_DEBUT = 5
export const SYNDIC_PASSWORD = 'residencepiano2026'
export const CATEGORIES_DEPENSES = [
  'Ménage',
  'Ascenseur',
  'Réparations',
  'Entretien',
  'Divers',
]
export const TYPES_INTERVENTIONS = [
  'Entretien ascenseur',
  'Ménage',
  'Réparation',
  'Autre',
]

const SYNDIC_PASSWORD_STORAGE_KEY = 'residence-piano-syndic-password'

const amountFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

export function getSyndicPassword() {
  if (typeof window === 'undefined') {
    return SYNDIC_PASSWORD
  }

  return window.localStorage.getItem(SYNDIC_PASSWORD_STORAGE_KEY) || SYNDIC_PASSWORD
}

export function setSyndicPassword(nouveauMotDePasse) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SYNDIC_PASSWORD_STORAGE_KEY, nouveauMotDePasse)
}

export function formatMontant(amount) {
  return `${amountFormatter.format(Number(amount))} ${DEVISE}`
}

export function getCurrentCotisationYear(referenceDate = new Date()) {
  return referenceDate.getFullYear()
}

export function getCotisationPeriodMonths() {
  return Array.from({ length: 12 }, (_, index) => {
    const monthIndex = MOIS_DEBUT - 1 + index
    const mois = (monthIndex % 12) + 1
    const annee = ANNEE_DEBUT + Math.floor(monthIndex / 12)
    const date = new Date(annee, mois - 1, 1)
    const monthLabel = new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
    }).format(date)

    return {
      key: `${annee}-${mois}`,
      mois,
      annee,
      label: `${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)} ${annee}`,
    }
  })
}

export function getCotisationPeriodYears() {
  return [...new Set(getCotisationPeriodMonths().map((month) => month.annee))]
}

export function getCurrentCotisationMonth(referenceDate = new Date()) {
  const currentMonth = referenceDate.getMonth() + 1
  const currentYear = referenceDate.getFullYear()

  return (
    getCotisationPeriodMonths().find(
      (periodMonth) =>
        periodMonth.mois === currentMonth && periodMonth.annee === currentYear,
    ) ?? null
  )
}

export function getCotisationDocId(residentId, annee, mois) {
  return `${residentId}_${annee}_${mois}`
}

export function isFutureCotisationMonth(mois, annee, referenceDate = new Date()) {
  const currentYear = referenceDate.getFullYear()
  const currentMonth = referenceDate.getMonth() + 1

  return annee > currentYear || (annee === currentYear && mois > currentMonth)
}

export function findCotisation(cotisations, residentId, mois, annee) {
  return cotisations.find(
    (cotisation) =>
      String(cotisation.residentId) === String(residentId) &&
      cotisation.mois === mois &&
      cotisation.annee === annee,
  )
}

export function getCotisationStatus(cotisations, residentId, mois, annee) {
  if (isFutureCotisationMonth(mois, annee)) {
    return 'futur'
  }

  return findCotisation(cotisations, residentId, mois, annee)?.statut ?? 'impaye'
}

export function countPaidCotisations(
  cotisations,
  periodMonths = getCotisationPeriodMonths(),
) {
  return cotisations.filter(
    (cotisation) =>
      cotisation.statut === 'paye' &&
      periodMonths.some(
        (periodMonth) =>
          periodMonth.mois === cotisation.mois &&
          periodMonth.annee === cotisation.annee,
      ),
  ).length
}

export function countResidentsWithUnpaidCotisations(
  residents,
  cotisations,
  periodMonths = getCotisationPeriodMonths(),
) {
  return residents.filter((resident) =>
    periodMonths.some(
      (periodMonth) =>
        getCotisationStatus(
          cotisations,
          resident.id,
          periodMonth.mois,
          periodMonth.annee,
        ) === 'impaye',
    ),
  ).length
}

export function calculateTotalDepenses(depenses) {
  return depenses.reduce(
    (total, depense) => total + Number(depense.montant),
    0,
  )
}

export function calculateTotalCotisationsExceptionnellesPayees(
  cotisationsExceptionnelles,
) {
  return cotisationsExceptionnelles.reduce((total, cotisationExceptionnelle) => {
    const paidCount = Object.values(cotisationExceptionnelle.statuts ?? {}).filter(
      (statut) => statut === 'paye',
    ).length

    return total + paidCount * Number(cotisationExceptionnelle.montant)
  }, 0)
}

export function calculateTotalCotisationsExceptionnellesAttendues(
  cotisationsExceptionnelles,
  residentCount,
) {
  return cotisationsExceptionnelles.reduce(
    (total, cotisationExceptionnelle) =>
      total + residentCount * Number(cotisationExceptionnelle.montant),
    0,
  )
}

export function calculateSolde(cotisations, depenses, cotisationsExceptionnelles = []) {
  return (
    countPaidCotisations(cotisations) * MONTANT_COTISATION +
    calculateTotalCotisationsExceptionnellesPayees(cotisationsExceptionnelles) -
    calculateTotalDepenses(depenses)
  )
}
