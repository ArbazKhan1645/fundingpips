'use client';

import { useEffect, useState } from 'react';
import { FileCheck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrandLogo } from '@/components/brand/logo';
import { authService } from '@/services/auth.service';
import { useRouter } from '@/i18n/navigation';

const idTypes = ['Passport', 'National ID', 'Driver License', 'Residence Permit'];
const addressTypes = ['Utility Bill', 'Bank Statement', 'Government Letter', 'Tax Document', 'Residence Certificate'];

export default function KycPage() {
  const router = useRouter();
  const [idDocumentType, setIdDocumentType] = useState('Passport');
  const [idDocumentNumber, setIdDocumentNumber] = useState('');
  const [proofOfAddressType, setProofOfAddressType] = useState('Bank Statement');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('unverified');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [profile, submission] = await Promise.all([authService.getProfile(), authService.getKycSubmission()]);
        setStatus(profile.kycStatus ?? submission?.status ?? 'unverified');
        if (submission?.id_document_type) setIdDocumentType(submission.id_document_type);
        if (submission?.id_document_number) setIdDocumentNumber(submission.id_document_number);
        if (submission?.proof_of_address_type) setProofOfAddressType(submission.proof_of_address_type);
      } catch {
        router.replace('/signin');
      }
    };
    load();
  }, [router]);

  const submit = async () => {
    if (!idFile || !addressFile) {
      setError('Upload both photo ID and proof of address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.submitKycDocuments({ idDocumentType, idDocumentNumber, proofOfAddressType, idFile, addressFile });
      router.push('/verification-status');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to submit KYC documents.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <BrandLogo className="h-10 w-10 mx-auto" textClassName="text-xl justify-center mt-3" />
          <h1 className="text-2xl font-black text-white mt-6">Identity verification</h1>
          <p className="text-sm text-slate-500 mt-1">Photo ID and proof of address are required before dashboard access.</p>
        </div>

        <div className="glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4 flex items-start gap-3">
            <FileCheck size={20} className="text-amber-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">Current status: {status}</p>
              <p className="text-xs text-slate-400 mt-1">Make sure your legal name and address match your signup profile.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Photo ID type" value={idDocumentType} onChange={setIdDocumentType} options={idTypes} />
            <Input label="Document number" value={idDocumentNumber} onChange={(event) => setIdDocumentNumber(event.target.value)} />
            <Select label="Proof of address type" value={proofOfAddressType} onChange={setProofOfAddressType} options={addressTypes} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FileInput label="Upload photo ID" onChange={setIdFile} file={idFile} />
            <FileInput label="Upload proof of address" onChange={setAddressFile} file={addressFile} />
          </div>

          {error && <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

          <Button type="button" className="w-full" onClick={submit} loading={loading}>
            <Upload size={16} />
            Submit for review
          </Button>
        </div>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label>
      <span className="block text-sm font-medium text-slate-300 mb-1.5">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/60">
        {options.map((option) => <option key={option} value={option} className="bg-[#0a0a0a]">{option}</option>)}
      </select>
    </label>
  );
}

function FileInput({ label, file, onChange }: { label: string; file: File | null; onChange: (file: File | null) => void }) {
  return (
    <label className="block rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5 cursor-pointer hover:border-amber-500/35 transition-all">
      <span className="text-sm font-semibold text-white">{label}</span>
      <span className="block text-xs text-slate-500 mt-1">{file ? file.name : 'PDF, PNG, JPG, WEBP up to 10MB'}</span>
      <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="sr-only" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
    </label>
  );
}
