import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateChef } from "@/app/actions";
import ChefForm from "@/components/ChefForm";

export default async function EditChefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chef = await prisma.chef.findUnique({ where: { id } });
  if (!chef) notFound();

  const action = updateChef.bind(null, chef.id);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <h1 className="text-2xl font-display font-semibold">Edit {chef.name}</h1>
      <ChefForm action={action} submitLabel="Save changes" defaultValues={chef} />
    </div>
  );
}
