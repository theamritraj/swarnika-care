'use client';

import { useState, useTransition } from 'react';
import { ExternalLink, Loader2, AlertCircle, Download } from 'lucide-react';

interface DocumentAccessButtonProps {
  documentId: number;
  documentName: string;
}

/**
 * Secure document access flow:
 * 1. Request signed access token from server (POST /me/documents/{id}/access)
 * 2. Server validates ownership from JWT, issues HMAC-signed token (15 min TTL)
 * 3. Client opens /api/v1/documents/redeem?token=... → server validates token → 302 to file
 * 
 * File URL never reaches the client's JavaScript environment.
 */
export default function DocumentAccessButton({ documentId, documentName }: DocumentAccessButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleAccess = () => {
    setError('');
    startTransition(async () => {
      try {
        // Step 1: Request signed access token
        const res = await fetch(`/api/proxy/api/v1/patients/me/documents/${documentId}/access`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!res.ok) {
          const d = await res.json();
          setError(d?.message || 'Failed to get document access. Please try again.');
          return;
        }

        const data = await res.json();
        const token = data?.data?.accessToken;

        if (!token) {
          setError('Could not get document access token.');
          return;
        }

        // Step 2: Open redemption URL — server validates token and redirects to file
        // File URL never reaches client JS
        window.open(`/api/proxy/api/v1/documents/redeem?token=${encodeURIComponent(token)}`, '_blank');
      } catch {
        setError('Network error. Please try again.');
      }
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleAccess}
        disabled={isPending}
        className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#007b92] border border-[#007b92]/30 bg-[#007b92]/5 hover:bg-[#007b92]/10 rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Opening...</>
        ) : (
          <><ExternalLink className="w-3.5 h-3.5" /> View / Download</>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1.5">
          <AlertCircle className="w-3 h-3 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
