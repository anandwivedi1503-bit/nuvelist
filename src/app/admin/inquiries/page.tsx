import { prisma } from "@/lib/prisma";

export const metadata = { title: "Inquiries" };

export default async function AdminInquiries() {
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="serif text-4xl">Inquiries</h1>
      <div className="mt-6 space-y-3">
        {inquiries.map((i) => (
          <article key={i.id} className="card p-5">
            <p className="font-medium">
              {i.subject} · {i.status}
            </p>
            <p className="text-sm text-muted">
              {i.name} · {i.email} · {i.phone}
            </p>
            <p className="mt-2 text-sm leading-6">{i.message}</p>
          </article>
        ))}
        {inquiries.length === 0 && <p className="text-sm text-muted">No inquiries yet.</p>}
      </div>
    </div>
  );
}
