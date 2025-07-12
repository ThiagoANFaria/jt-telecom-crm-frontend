import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import ContactHistory from './ContactHistory';

interface ContactHistoryModalProps {
  contactId: string;
  contactType: 'lead' | 'client';
  contactName: string;
  triggerClassName?: string;
}

const ContactHistoryModal: React.FC<ContactHistoryModalProps> = ({ 
  contactId, 
  contactType, 
  contactName,
  triggerClassName = ""
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setOpen(true)}
        className={`text-purple-600 hover:text-purple-700 ${triggerClassName}`}
      >
        <History className="w-4 h-4" />
      </Button>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Contatos</DialogTitle>
        </DialogHeader>
        
        <ContactHistory 
          contactId={contactId}
          contactType={contactType}
          contactName={contactName}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ContactHistoryModal;

