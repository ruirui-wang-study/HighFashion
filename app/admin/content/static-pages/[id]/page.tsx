import { notFound } from "next/navigation";
import { AdminStaticPageEditor } from "@/components/admin/admin-static-page-editor";
import { getAdminStaticPage } from "@/lib/admin-api";

export default async function AdminStaticPageDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getAdminStaticPage(id).catch(() => null);

  if (!page) {
    notFound();
  }

  return <AdminStaticPageEditor page={page} />;
}
