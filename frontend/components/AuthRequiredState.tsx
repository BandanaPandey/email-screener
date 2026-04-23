"use client";

import Link from "next/link";
import ConnectButton from "@/components/ConnectButton";

type Props = {
  title: string;
  message: string;
};

export default function AuthRequiredState({ title, message }: Props) {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mt-3 text-gray-600">{message}</p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <ConnectButton />
        <Link href="/" className="text-sm text-gray-600 underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
