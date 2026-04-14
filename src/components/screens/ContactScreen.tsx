import { useState } from 'react';
import { Contact } from '../../types';

type ContactScreenProps = {
  contacts: Contact[];
  onSaveContact: (contact: Contact) => void;
  onBack: () => void;
};

export default function ContactScreen({ contacts, onSaveContact, onBack }: ContactScreenProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const filteredContacts = contacts.filter(contact => {
    const normalizedSearch = search.trim().toLowerCase();
    const numberSearch = search.replace(/\D/g, '');

    return (
      contact.name.toLowerCase().includes(normalizedSearch) ||
      contact.phone.includes(numberSearch)
    );
  });

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setError('Preencha nome e telefone para salvar o contato.');
      return;
    }

    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`;

    onSaveContact({
      id,
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      relation: relation.trim() || 'Contato',
    });

    setName('');
    setPhone('');
    setRelation('');
    setError('');
  };

  return (
    <div className="px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Contatos de Confiança</h2>
          <p className="text-slate-500 text-sm mt-1">Cadastre pessoas que receberão sua localização em caso de emergência.</p>
        </div>
        <button onClick={onBack} className="text-violet-700 text-sm font-semibold">Voltar</button>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-lg mb-4">Contatos salvos</h3>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
              placeholder="Buscar por nome ou telefone"
            />
          </div>

          {contacts.length === 0 ? (
            <p className="text-slate-500 text-sm">Ainda não há contatos cadastrados.</p>
          ) : filteredContacts.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum contato encontrado para sua busca.</p>
          ) : (
            <div className="space-y-3">
              {filteredContacts.map(contact => (
                <div key={contact.id} className="rounded-3xl border border-slate-100 p-4 bg-slate-50">
                  <p className="font-semibold text-slate-900">{contact.name} {contact.relation ? `(${contact.relation})` : ''}</p>
                  <p className="text-sm text-slate-600">{contact.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nome</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
            placeholder="Nome do contato"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Telefone</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
            placeholder="(11) 9 9999-9999"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Relação</label>
          <input
            value={relation}
            onChange={e => setRelation(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
            placeholder="Mãe, Amiga, Parceira"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full bg-violet-700 text-white rounded-3xl py-4 text-sm font-bold uppercase tracking-widest shadow-md shadow-violet-700/20"
        >
          Salvar contato
        </button>
      </form>
    </div>
  );
}
