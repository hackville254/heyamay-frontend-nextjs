import Link from "next/link";
// Home page: quick access to list and creation flows

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">HEYAMA Demo</h1>
        <p className="mt-2 text-neutral-600">Gestion d’objets avec upload d’images et mises à jour en temps réel.</p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link href="/objects" className="inline-flex h-10 items-center justify-center rounded-md bg-black px-5 text-white hover:bg-neutral-800">Voir la liste</Link>
        <Link href="/objects/new" className="inline-flex h-10 items-center justify-center rounded-md border border-neutral-300 px-5 hover:bg-neutral-100">Créer un objet</Link>
      </div>
    </div>
  );
}
