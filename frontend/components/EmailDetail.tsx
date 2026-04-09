type Props = {
  email: any;
};

export default function EmailDetail({ email }: Props) {
  const insight = email.email_insight;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{email.subject}</h2>

      <p className="text-sm text-gray-600 mb-4">
        From: {email.sender}
      </p>

      {insight && (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <p>
            <strong>Category:</strong> {insight.category}
          </p>
          <p>
            <strong>Confidence:</strong>{" "}
            {(insight.confidence * 100).toFixed(0)}%
          </p>
          <p>
            <strong>Priority Score:</strong>{" "}
            <span className="font-bold">
              {insight.priority_score}
            </span>
          </p>
          <p>
            <strong>Reason:</strong> {insight.priority_reason}
          </p>
        </div>
      )}

      <div className="whitespace-pre-wrap text-gray-800">
        {email.body}
      </div>
    </div>
  );
}