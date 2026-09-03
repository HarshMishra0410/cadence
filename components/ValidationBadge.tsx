import type { AuthorValidation } from "@prisma/client";

const LABEL: Record<AuthorValidation, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  DISPUTED: "Disputed",
};

const CLASS: Record<AuthorValidation, string> = {
  PENDING: "badge-pending",
  CONFIRMED: "badge-confirmed",
  DISPUTED: "badge-disputed",
};

export default function ValidationBadge({ value }: { value: AuthorValidation }) {
  return <span className={`clay-chip ${CLASS[value]}`}>{LABEL[value]}</span>;
}
