const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

function MurAnnonces({ annonces }) {
  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
          Mur d'annonces
        </p>
        <h2 className="mt-2 text-2xl font-bold text-indigo-950">
          Messages du syndic
        </h2>
      </div>

      <div className="divide-y divide-slate-100">
        {annonces.map((annonce) => (
          <article className="p-6" key={annonce.id}>
            <time
              className="text-sm font-medium text-slate-500"
              dateTime={annonce.date.toISOString()}
            >
              {dateFormatter.format(annonce.date)}
            </time>
            <h3 className="mt-2 text-xl font-bold text-slate-950">
              {annonce.titre}
            </h3>
            <p className="mt-3 leading-7 text-slate-600">{annonce.contenu}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default MurAnnonces
