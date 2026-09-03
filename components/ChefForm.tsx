type Props = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    name: string;
    linkedinUrl: string;
    position: string;
    email: string;
    intent: string | null;
    targetPostsPerMonth: number | null;
  };
  submitLabel: string;
};

export default function ChefForm({ action, defaultValues, submitLabel }: Props) {
  return (
    <form action={action} className="clay-card-raised p-6 flex flex-col gap-4 max-w-lg">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Name</span>
        <input name="name" required defaultValue={defaultValues?.name} className="clay-input" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">LinkedIn URL</span>
        <input
          name="linkedinUrl"
          type="url"
          required
          defaultValue={defaultValues?.linkedinUrl}
          className="clay-input"
          placeholder="https://linkedin.com/in/..."
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Position / Department</span>
        <input name="position" required defaultValue={defaultValues?.position} className="clay-input" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Email</span>
        <span className="text-xs" style={{ color: "var(--clay-ink-faint)" }}>
          Used later to ping when LinkedIn hygiene drops.
        </span>
        <input name="email" type="email" required defaultValue={defaultValues?.email} className="clay-input" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Intent (optional)</span>
        <textarea name="intent" defaultValue={defaultValues?.intent ?? ""} className="clay-input" rows={3} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Target posts / month (optional)</span>
        <span className="text-xs" style={{ color: "var(--clay-ink-faint)" }}>
          Leave blank to use the 4/month fallback — that's a default, not a benchmark. Set this once a real cadence is agreed for this person.
        </span>
        <input
          name="targetPostsPerMonth"
          type="number"
          min={1}
          defaultValue={defaultValues?.targetPostsPerMonth ?? ""}
          className="clay-input"
          placeholder="4 (default)"
        />
      </label>
      <button type="submit" className="clay-btn clay-btn-primary self-start mt-2">
        {submitLabel}
      </button>
    </form>
  );
}
