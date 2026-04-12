"use client";

type Props = {
  emails: any[];
  onSelect: (email: any) => void;
};

export default function EmailList({ emails, onSelect }: Props) {
  const getPriorityLabel = (score: number) => {
    if (score > 0.75)
      return { label: "🔥 High", color: "bg-red-500 text-white" };
    if (score > 0.4)
      return { label: "⚡ Medium", color: "bg-yellow-400" };
    return { label: "🧊 Low", color: "bg-gray-300" };
  };

  const isActionRequired = (email: any) => {
    if (email.tasks?.length > 0) return true;

    const summary =
      email.email_insight?.summary?.toLowerCase() || "";

    return (
      summary.includes("reply") ||
      summary.includes("submit") ||
      summary.includes("complete") ||
      summary.includes("schedule")
    );
  };

  return (
    <div className="space-y-3">
      {emails.map((email) => {
        const insight = email.email_insight;
        const priority = getPriorityLabel(
          insight?.priority_score || 0
        );

        return (
          <div
            key={email.id}
            onClick={() => onSelect(email)}
            className={`p-4 rounded-xl cursor-pointer transition border
              hover:shadow-md
              ${
                isActionRequired(email)
                  ? "border-red-400 bg-red-50"
                  : "bg-white"
              }
            `}
          >
            {/* TOP ROW */}
            <div className="flex justify-between items-center mb-1">
              <span
                className={`text-xs px-2 py-1 rounded ${priority.color}`}
              >
                {priority.label}
              </span>

              <span className="text-xs text-gray-500">
                {new Date(
                  email.received_at
                ).toLocaleDateString()}
              </span>
            </div>

            {/* SUBJECT */}
            <h3 className="font-semibold text-lg">
              {email.subject}
            </h3>

            {/* SUMMARY */}
            {insight?.summary && (
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {insight.summary}
              </p>
            )}

            {/* META */}
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{email.sender}</span>

              {insight?.category && (
                <span className="capitalize bg-gray-200 px-2 py-0.5 rounded">
                  {insight.category}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}