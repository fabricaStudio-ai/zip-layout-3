import { useState, type FormEvent } from 'react';
import { Contact } from '../../types';

type ContactScreenProps = {
  contacts: Contact[];
  onSaveContact: (contact: Contact) => void;
  onImportContacts: (contacts: Contact[]) => void;
  onToggleEmergency: (id: string) => void;
  onBack: () => void;
};

async function resolveContactPhoto(icon: any): Promise<string | undefined> {
  if (!icon) return undefined;
  const firstIcon = Array.isArray(icon) ? icon[0] : icon;
  if (!firstIcon) return undefined;

  if (typeof firstIcon === 'string') {
    return firstIcon;
  }

  if (firstIcon instanceof Blob) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(firstIcon);
    });
  }

  return undefined;
}

export default function ContactScreen({ contacts, onSaveContact, onImportContacts, onToggleEmergency, onBack }: ContactScreenProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [importError, setImportError] = useState('');

  const filteredContacts = contacts.filter(contact => {
    const normalizedSearch = search.trim().toLowerCase();
    const numberSearch = search.replace(/\D/g, '');

    return (
      contact.name.toLowerCase().includes(normalizedSearch) ||
      contact.phone.includes(numberSearch)
    );
  });

  const handleImportContacts = async () => {
    const nav = navigator as any;

    if (!nav.contacts?.select) {
      setImportError('Sincronização de contatos não é suportada neste navegador.');
      return;
    }

    try {
      const selectedContacts = await nav.contacts.select(['name', 'tel', 'icon'], { multiple: true });
      const imported = await Promise.all(selectedContacts
        .filter((contact: any) => contact.tel?.length)
        .map(async (contact: any, index: number) => {
          const photo = await resolveContactPhoto(contact.icon);

          return {
            id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${index}`,
            name: contact.name?.[0] || 'Contato sem nome',
            phone: contact.tel?.[0].replace(/\D/g, '') || '',
            relation: 'Contato',
            emergency: false,
            photo,
          };
        }));

      const validContacts = imported.filter((contact: Contact) => contact.phone);

      if (validContacts.length === 0) {
        setImportError('Nenhum contato válido foi selecionado.');
        return;
      }

      onImportContacts(validContacts);
      setImportError('');
    } catch {
      setImportError('Falha ao sincronizar contatos. Verifique as permissões do navegador.');
    }
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
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
      emergency: false,
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg mb-1">Contatos salvos</h3>
              <p className="text-slate-500 text-sm">Sincronize contatos do celular e marque os contatos de emergência.</p>
            </div>
            <button
              type="button"
              onClick={handleImportContacts}
              className="rounded-3xl bg-violet-700 text-white px-4 py-3 text-sm font-semibold"
            >
              Importar contatos
            </button>
          </div>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
            placeholder="Buscar por nome ou telefone"
          />

          {importError && <p className="text-sm text-red-600">{importError}</p>}

          {contacts.length === 0 ? (
            <p className="text-slate-500 text-sm">Ainda não há contatos cadastrados.</p>
          ) : filteredContacts.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum contato encontrado para sua busca.</p>
          ) : (
            <div className="space-y-3">
              {filteredContacts
                .slice()
                .sort((a, b) => (b.emergency ? 1 : 0) - (a.emergency ? 1 : 0))
                .map(contact => (
                  <div key={contact.id} className="rounded-3xl border border-slate-100 p-4 bg-slate-50">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {contact.name} {contact.relation ? `(${contact.relation})` : ''}
                        </p>
                        <p className="text-sm text-slate-600">{contact.phone}</p>
                        {contact.emergency && (
                          <span className="inline-flex items-center mt-2 rounded-full bg-violet-100 text-violet-700 text-[11px] font-semibold uppercase tracking-[0.18em] px-3 py-1">
                            Emergência
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleEmergency(contact.id)}
                        className={`rounded-2xl px-3 py-2 text-xs font-semibold ${contact.emergency ? 'bg-violet-700 text-white' : 'bg-slate-200 text-slate-700'}`}
                      >
                        {contact.emergency ? 'Remover destaque' : 'Destacar'}
                      </button>
                    </div>
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
