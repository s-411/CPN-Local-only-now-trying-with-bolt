'use client';

import { useShare } from '@/lib/share/ShareContext';
import SharePreviewModal from './SharePreviewModal';

export default function ShareModalWrapper() {
  const { state, actions } = useShare();
  
  return (
    <SharePreviewModal
      isOpen={state.showPreviewModal}
      onClose={() => actions.togglePreviewModal(false)}
    />
  );
}