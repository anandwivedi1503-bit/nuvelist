export const metadata = { title: "Clinical" };

export default function ClinicalPage() {
  return (
    <div className="container-nvl py-14">
      <p className="text-xs uppercase tracking-[0.22em] text-teal">The clinical standard</p>
      <h1 className="serif mt-3 max-w-3xl text-5xl">Actives chosen to cleanse, repair and protect.</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          ["Ceramide complex", "Replenishes lipids that hold the barrier together — especially after cleansing."],
          ["Peptides", "Signal healthier-looking lip texture and support elasticity over continued use."],
          ["Panthenol", "A calming humectant that soothes tightness and supports recovery."],
          ["Amino acids", "Mild cleansing that respects the acid mantle instead of stripping it."],
          ["Hyaluronic acid", "Binds water for a plump, comfortable finish on delicate lip skin."],
          ["Beta-glucan", "Helps quiet visible redness and the feeling of irritation."],
        ].map(([t, d]) => (
          <article key={t} className="card p-6">
            <h2 className="text-lg">{t}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{d}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
