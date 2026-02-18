type Params = Promise<{ id: string }>;

export default async function EventDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-gray-400">
        Event detail page for <span className="font-medium text-gray-600">{id}</span> — coming soon.
      </p>
    </div>
  );
}
