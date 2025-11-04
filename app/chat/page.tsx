"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page for session selection
    router.replace('/');
  }, [router]);

  return null;
}
