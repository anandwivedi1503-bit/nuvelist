export const metadata = { title: "Our House" };

export default function AboutPage() {
  return (
    <div className="container-nvl max-w-3xl py-14">
      <p className="text-xs uppercase tracking-[0.22em] text-teal">Our house</p>
      <h1 className="serif mt-3 text-5xl">Clinical skin actives, made for India.</h1>
      <p className="mt-6 leading-8">
        Nuvelist is a clinical skincare house. We formulate for humidity, hard water, city pollution
        and real Indian routines — without perfume, without theatre, without stripping the barrier
        you need.
      </p>
      <p className="mt-4 leading-8">
        Every formula is dermatologically tested, pH balanced and fragrance free. We speak in
        actives you can name: ceramides, peptides, panthenol, hyaluronic acid, amino acids,
        beta-glucan.
      </p>
      <p className="mt-4 leading-8">
        Commerce is built the Indian way: INR pricing with GST included, UPI through Razorpay, Cash
        on Delivery, and shipping to every state and Union Territory.
      </p>
    </div>
  );
}
