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
      <div className="max-w-3xl text-center">
        <h1 className="mb-6 text-5xl font-bold">AutoHost</h1>
        <p className="mb-4 text-2xl font-semibold text-gray-900">
          Your vacation rental business running itself.
        </p>
        <p className="mb-8 text-lg text-gray-600">
          Replace $600+/month in fragmented tools and $10k+ in revenue management courses with one
          intelligent platform. Get your 3 hours back every day.
        </p>
        <div className="mb-8 grid grid-cols-1 gap-4 text-left md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900">Revenue Intelligence</h3>
            <p className="text-sm text-gray-600">
              STR vs MTR optimization, gap filling, event-based pricing - expertise built in
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900">Guest Intelligence</h3>
            <p className="text-sm text-gray-600">
              Automated vetting, risk scoring, personalized responses - 24/7 guest services
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900">Data Consolidation</h3>
            <p className="text-sm text-gray-600">
              PMS, OTAs, market data in one place - finally see what&apos;s actually happening
            </p>
          </div>
        </div>
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
