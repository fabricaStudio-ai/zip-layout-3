import { useEffect, useState } from 'react';
import { Contact } from '../types';

const STORAGE_KEY = 'serene_contacts';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const savedContacts = localStorage.getItem(STORAGE_KEY);
    if (!savedContacts) {
      return;
    }

    try {
      setContacts(JSON.parse(savedContacts) as Contact[]);
    } catch {
      setContacts([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }, [contacts]);

  const addContact = (contact: Contact) => {
    setContacts(prev => [contact, ...prev]);
  };

  const addContacts = (newContacts: Contact[]) => {
    setContacts(prev => [...newContacts, ...prev]);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.id === id ? { ...contact, ...updates } : contact
      )
    );
  };

  const toggleEmergencyContact = (id: string) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.id === id ? { ...contact, emergency: !contact.emergency } : contact
      )
    );
  };

  return {
    contacts,
    addContact,
    addContacts,
    toggleEmergencyContact,
    updateContact,
  };
}
