import { createChef } from "@/app/actions";
import ChefForm from "@/components/ChefForm";

export default function NewChefPage() {
  return (
    <div className="flex flex-col gap-6 pt-4">
      <h1 className="text-2xl font-display font-semibold">Add chef</h1>
      <ChefForm action={createChef} submitLabel="Add chef" />
    </div>
  );
}
