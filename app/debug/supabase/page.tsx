"use client";
import DebugSupabase from "./debug-supabase/page";

export const dynamic = 'force-dynamic';

const DebugPage = () => {
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="bg-neutral-800 p-4 rounded-lg">
        <h2 className="text-xl mb-2">Current Environment Variables:</h2>
        <pre className="bg-black p-4 rounded overflow-auto">
          {JSON.stringify(
            {
              NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
              NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
              PINATA_JWT: process.env.PINATA_JWT ? "Set" : "Missing",
              NEXT_PUBLIC_PINATA_GATEWAY_URL: process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || "Using default",
            },
            null,
            2
          )}
        </pre>
      </div>
      <DebugSupabase />
    </div>
  );
};

export default DebugPage;