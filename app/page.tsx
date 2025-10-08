import { redirect } from 'next/navigation';

export default function Home() {
  // For now, redirect to chat
  // TODO: Check if user exists, show onboarding or last session
  redirect('/chat');
}