export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="container-nvl max-w-3xl py-14">
      <h1 className="serif text-5xl">Privacy</h1>
      <p className="mt-6 leading-8">
        We store the minimum needed to fulfil orders: name, email, mobile, delivery address and
        payment references. Passwords are hashed. Sessions are httpOnly cookies. Razorpay handles
        card and UPI data — Nuvelist never sees full card numbers. You may request account deletion
        by writing to us.
      </p>
    </div>
  );
}
