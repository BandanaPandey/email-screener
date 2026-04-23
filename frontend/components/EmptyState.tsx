"use client";

type Props = {
  title: string;
  message: string;
};

export default function EmptyState({ title, message }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{message}</p>
    </div>
  );
}
