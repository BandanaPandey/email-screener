"use client";

type Props = {
  message: string;
  tone?: "error" | "success";
};

export default function InlineMessage({
  message,
  tone = "success",
}: Props) {
  const classes =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-green-200 bg-green-50 text-green-700";

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${classes}`}>
      {message}
    </div>
  );
}
