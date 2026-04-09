type Props = {
  email: any;
  onClick: () => void;
};

export default function EmailListItem({ email, onClick }: Props) {
  const score = email.email_insight?.priority_score || 0;
  const categoryColor = getCategoryColor(email.email_insight?.category);

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b cursor-pointer hover:bg-gray-100
        ${score >= 80 ? "bg-red-50 border-l-4 border-red-500" : ""}
      `}
    >
      <div className="flex justify-between items-center">
        <p className="font-medium">{email.sender}</p>

        <div className="flex gap-2 items-center">
          {email.email_insight && (
            <span className={`text-xs px-2 py-1 rounded ${categoryColor}`}>
              {email.email_insight.category}
            </span>
          )}

          {/* 🔥 Priority Badge */}
          <span
            className={`text-xs px-2 py-1 rounded ${
              score >= 80
                ? "bg-red-500 text-white"
                : score >= 50
                ? "bg-yellow-400"
                : "bg-gray-300"
            }`}
          >
            {score}
          </span>
        </div>
      </div>

      <p className="text-sm font-semibold truncate">{email.subject}</p>

      <p className="text-xs text-gray-500 truncate">
        {email.body}
      </p>
    </div>
  );
}

function getCategoryColor(category?: string) {
  switch (category) {
    case "important":
      return "bg-red-100 text-red-600";
    case "action_required":
      return "bg-yellow-100 text-yellow-700";
    case "promotion":
      return "bg-blue-100 text-blue-600";
    case "social":
      return "bg-purple-100 text-purple-600";
    case "spam":
      return "bg-gray-200 text-gray-600";
    default:
      return "bg-gray-100 text-gray-500";
  }
}