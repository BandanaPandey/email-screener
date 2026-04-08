type Props = {
  email: any;
};

export default function EmailDetail({ email }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{email.subject}</h2>

      <p className="text-sm text-gray-600 mb-4">
        From: {email.sender}
      </p>

      {email.email_insight && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <p>
            <strong>Category:</strong>{" "}
            {email.email_insight.category}
          </p>
          <p>
            <strong>Confidence:</strong>{" "}
            {(email.email_insight.confidence * 100).toFixed(0)}%
          </p>
        </div>
      )}

      <div className="whitespace-pre-wrap text-gray-800">
        {email.body}
      </div>
    </div>
  );
}