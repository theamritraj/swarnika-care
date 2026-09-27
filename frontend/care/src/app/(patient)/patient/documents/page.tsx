import { serverFetch } from '@/lib/server/api-client';
import { getSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { FileText, Calendar, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import DocumentAccessButton from './DocumentAccessButton';

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDocumentStatusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING_VERIFICATION: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    VERIFIED: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  };
  return map[status] || 'bg-accent text-muted-foreground';
}

function getDocumentTypeLabel(type: string) {
  const map: Record<string, string> = {
    NATIONAL_ID_PROOF: 'ID Proof',
    INSURANCE_CARD: 'Insurance Card',
    REFERRAL_LETTER: 'Referral Letter',
    DISCHARGE_SUMMARY: 'Discharge Summary',
    CONSENT_FORM: 'Consent Form',
    OTHER: 'Document',
  };
  return map[type] || type;
}

function getDocumentIcon(type: string) {
  return <FileText className="w-5 h-5 text-[#007b92]" />;
}

export default async function DocumentsPage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('PATIENT') && !session.roles.includes('SUPER_ADMIN'))) {
    redirect('/login');
  }

  // Secure endpoint: identity from JWT, fileUrl never returned
  let documents: any[] = [];
  const res = await serverFetch('/api/v1/patients/me/documents', { next: { revalidate: 0 } });
  if (res.ok && Array.isArray(res.data?.data)) {
    documents = res.data.data.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const verified = documents.filter(d => d.status === 'VERIFIED');
  const pending = documents.filter(d => d.status === 'PENDING_VERIFICATION');
  const rejected = documents.filter(d => d.status === 'REJECTED');

  return (
    <div className="space-y-6 pb-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#007b92]" />
          My Documents
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your uploaded and verified hospital documents. {documents.length} document{documents.length !== 1 ? 's' : ''} found.
        </p>
      </div>

      {/* Security note */}
      <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-3">
        <p className="text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          Documents are accessed via secure time-limited links. File links expire after 15 minutes for your security.
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">No documents found</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Documents uploaded by the hospital reception will appear here after verification.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {verified.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Verified ({verified.length})
              </h2>
              <div className="space-y-3">
                {verified.map(doc => (
                  <div key={doc.id} className="rounded-xl border border-border bg-card p-4 hover:border-[#007b92]/20 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#007b92]/10 flex items-center justify-center shrink-0">
                        {getDocumentIcon(doc.documentType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{doc.documentName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {getDocumentTypeLabel(doc.documentType)} · #{doc.documentNumber}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${getDocumentStatusBadge(doc.status)}`}>
                            {doc.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Received: {formatDate(doc.receivedDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Added: {formatDate(doc.createdAt)}
                          </span>
                        </div>
                        {/* Secure access button — client component that gets signed token */}
                        <div className="mt-3">
                          <DocumentAccessButton documentId={doc.id} documentName={doc.documentName} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Pending Verification ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map(doc => (
                  <div key={doc.id} className="rounded-xl border border-border bg-card p-4 opacity-80">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{doc.documentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {getDocumentTypeLabel(doc.documentType)} · #{doc.documentNumber}
                        </p>
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${getDocumentStatusBadge(doc.status)}`}>
                          Pending Verification
                        </span>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Document access is available once verified by hospital staff.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rejected.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Rejected ({rejected.length})
              </h2>
              <div className="space-y-3">
                {rejected.map(doc => (
                  <div key={doc.id} className="rounded-xl border border-border bg-card p-4 opacity-60">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{doc.documentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {getDocumentTypeLabel(doc.documentType)} · #{doc.documentNumber}
                        </p>
                        <p className="text-xs text-red-500 mt-1.5">Document was rejected. Please contact the hospital reception.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
