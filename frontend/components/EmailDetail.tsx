type Props = {
  email: any;
};

export default function EmailDetail({ email }: Props) {
  const insight = email.email_insight;

  return (
    <div>
      {/* SUBJECT */}
      <h2 className="text-2xl font-bold mb-2">{email.subject}</h2>

      {/* META */}
      <p className="text-sm text-gray-600 mb-4">
        From: {email.sender}
      </p>

      {/* 🔥 TL;DR */}
      {insight?.summary && (
        <div className="mb-4 p-4 border rounded bg-blue-50">
          <h3 className="font-semibold mb-1">TL;DR</h3>
          <p>{insight.summary}</p>
        </div>
      )}

      {/* 🔥 KEY POINTS */}
      {insight?.key_points && (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-1">Key Points</h3>
          <ul className="list-disc ml-5">
            {insight.key_points.split("\n").map((point: string, i: number) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 🔥 INSIGHT PANEL */}
      {insight && (
        <div className="mb-4 p-4 border rounded bg-gray-100">
          <p>
            <strong>Category:</strong> {insight.category}
          </p>
          <p>
            <strong>Confidence:</strong>{" "}
            {(insight.confidence * 100).toFixed(0)}%
          </p>
          <p>
            <strong>Priority:</strong> {insight.priority_score}
          </p>
          <p>
            <strong>Reason:</strong> {insight.priority_reason}
          </p>
        </div>
      )}

      {/* BODY */}
      <div className="whitespace-pre-wrap text-gray-800">
        {email.body}
      </div>
    </div>
  );
}