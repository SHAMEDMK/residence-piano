export const MONTANT_COTISATION = 50

export function getCurrentCotisationYear(referenceDate = new Date()) {
  return referenceDate.getFullYear()
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

export function countPaidCotisations(cotisations) {
  return cotisations.filter((cotisation) => cotisation.statut === 'paye').length
}

export function countResidentsWithUnpaidCotisations(residents, cotisations, annee) {
  const currentMonth = new Date().getMonth() + 1

  return residents.filter((resident) =>
    Array.from({ length: currentMonth }, (_, index) => index + 1).some(
      (mois) =>
        getCotisationStatus(cotisations, resident.id, mois, annee) === 'impaye',
    ),
  ).length
}

export function calculateTotalDepenses(depenses) {
  return depenses.reduce(
    (total, depense) => total + Number(depense.montant),
    0,
  )
}

export function calculateSolde(cotisations, depenses) {
  return (
    countPaidCotisations(cotisations) * MONTANT_COTISATION -
    calculateTotalDepenses(depenses)
  )
}
