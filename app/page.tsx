'use client';

import type { ReactElement } from 'react';
import { useState } from 'react';

import { LoginDialog } from '@/components/auth/LoginDialog';
import { SignupDialog } from '@/components/auth/SignupDialog';
import type { LoginCredentials, SignupData } from '@/types/auth';

const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
  // TODO: Implement actual login logic
  console.warn('Login:', credentials);
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

const handleSignup = async (data: SignupData): Promise<void> => {
  // TODO: Implement actual signup logic
  console.warn('Signup:', data);
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export default function Home(): ReactElement {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold">AutoHost</h1>
        <p className="mb-8 text-lg text-gray-600">Your vacation rental business running itself.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setLoginOpen(true)}
            className="rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Login
          </button>
          <button
            onClick={() => setSignupOpen(true)}
            className="rounded-md border border-gray-300 px-6 py-3 text-sm font-medium hover:bg-gray-50"
          >
            Sign Up
          </button>
        </div>
      </div>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} onSubmit={handleLogin} />
      <SignupDialog open={signupOpen} onOpenChange={setSignupOpen} onSubmit={handleSignup} />
    </div>
  );
}
