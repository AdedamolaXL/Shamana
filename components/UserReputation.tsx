"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";

interface ReputationCredential {
  credentialSubject: {
    reputationScore: number;
    reason: string;
  };
  issuanceDate: string;
}

export const UserReputation = () => {
  const { user } = useUser();
  const [reputation, setReputation] = useState<ReputationCredential[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReputation = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/reputation/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setReputation(data);
        }
      } catch (error) {
        console.error('Failed to fetch reputation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReputation();
  }, [user?.id]);

  const totalScore = reputation.reduce(
    (sum, cred) => sum + cred.credentialSubject.reputationScore,
    0
  );

  if (loading) return <div>Loading reputation...</div>;

  return (
    <div className="bg-neutral-800 p-4 rounded-lg">
      <h3 className="text-white font-semibold mb-2">Reputation</h3>
      <div className="text-2xl font-bold text-green-500 mb-4">
        Total Score: {totalScore}
      </div>
      <div className="space-y-2">
        {reputation.map((cred, index) => (
          <div key={index} className="text-sm text-neutral-400">
            <div>+{cred.credentialSubject.reputationScore} - {cred.credentialSubject.reason}</div>
            <div className="text-xs">
              {new Date(cred.issuanceDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};