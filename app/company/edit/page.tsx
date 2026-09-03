import { prisma } from "@/lib/prisma";
import { updateCompany } from "@/app/actions";

export default async function EditCompanyPage() {
  const company = await prisma.company.findUnique({ where: { id: "company" } });

  return (
    <div className="flex flex-col gap-6 pt-4">
      <h1 className="text-2xl font-display font-semibold">Company LinkedIn</h1>
      <form action={updateCompany} className="clay-card-raised p-6 flex flex-col gap-4 max-w-lg">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold">LinkedIn URL</span>
          <input
            name="linkedinUrl"
            type="url"
            defaultValue={company?.linkedinUrl ?? ""}
            className="clay-input"
            placeholder="https://linkedin.com/company/..."
          />
        </label>
        <button type="submit" className="clay-btn clay-btn-primary self-start mt-2">
          Save
        </button>
      </form>
    </div>
  );
}
