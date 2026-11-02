import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { renewElection } from '../../services/adminService';
import { messageFromError } from '../../services/api';

export default function ElectionRenewalModal({ election, onClose, onSuccess }) {
  const [title, setTitle] = useState('MSc Computer Science Class Representatives Election - New Cycle');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isOpen = election?.status === 'OPEN';

  const submit = async (event) => {
    event.preventDefault();
    if (!confirmed) return toast.error('Please confirm the new election cycle.');
    setSubmitting(true);
    try {
      await renewElection({ title: title.trim(), confirmation: isOpen ? 'CANCEL_AND_START_NEW_ELECTION' : 'START_NEW_ELECTION' });
      toast.success('New election cycle started.');
      await onSuccess();
      onClose();
    } catch (error) { toast.error(messageFromError(error, 'Unable to start a new election.')); }
    finally { setSubmitting(false); }
  };

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="renew-title"><button className="modal-close icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button><div className="modal-icon"><AlertTriangle size={21} /></div><div className="eyebrow">NEW ELECTION CYCLE</div><h2 id="renew-title">Start a new election?</h2><p className="modal-description">The existing cycle and its results will remain in history. All eligible members will participate again in a fresh cycle.</p>{isOpen && <div className="notice-box"><strong>The current election is still open.</strong><span>Continuing will archive it with its existing participation and start the new cycle.</span></div>}<form onSubmit={submit} className="modal-form"><label className="field-label" htmlFor="election-title">Election title</label><input id="election-title" className="text-input" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} required /><label className="check-row"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>I understand that a new cycle will begin and previous records will be preserved.</span></label><div className="modal-actions"><button className="button button-secondary" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={submitting || !title.trim()}>{submitting ? 'Starting…' : 'Confirm new election'}</button></div></form></section></div>;
}
