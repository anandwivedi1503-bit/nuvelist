import { Studio } from "@/components/Studio";

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Studio manuscriptId={id} />;
}
