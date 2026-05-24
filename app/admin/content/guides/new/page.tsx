import { AdminGuideEditor } from "@/components/admin/admin-guide-editor";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminNewGuideRoute() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content"
        title="New Guide"
        body="Create a new guide entry, draft it, preview it, and publish when the content is ready."
      />
      <AdminGuideEditor />
    </div>
  );
}
