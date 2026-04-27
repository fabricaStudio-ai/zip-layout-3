import { useState, type FormEvent } from 'react';
import { Contact } from '../../types';

type ContactScreenProps = {
  contacts: Contact[];
  onSaveContact: (contact: Contact) => void;
  onImportContacts: (contacts: Contact[]) => void;
  onToggleEmergency: (id: string) => void;
  onUpdateContact: (id: string, updates: Partial<Contact>) => void;
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

export default function ContactScreen({ contacts, onSaveContact, onImportContacts, onToggleEmergency, onUpdateContact, onBack }: ContactScreenProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [importError, setImportError] = useState('');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('A imagem deve ter no máximo 5MB.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem válido.');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setName(contact.name);
    setPhone(contact.phone);
    setRelation(contact.relation || '');
    setPhotoPreview(contact.photo || '');
    setPhotoFile(null);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingContact(null);
    setName('');
    setPhone('');
    setRelation('');
    setPhotoFile(null);
    setPhotoPreview('');
    setError('');
  };

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

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setError('Preencha nome e telefone para salvar o contato.');
      return;
    }

    let photoUrl = photoPreview;

    if (photoFile) {
      // Convert file to base64
      photoUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(photoFile);
      });
    }

    if (editingContact) {
      // Update existing contact
      onUpdateContact(editingContact.id, {
        name: name.trim(),
        phone: phone.replace(/\D/g, ''),
        relation: relation.trim() || 'Contato',
        photo: photoUrl,
      });
      handleCancelEdit();
    } else {
      // Create new contact
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`;

      onSaveContact({
        id,
        name: name.trim(),
        phone: phone.replace(/\D/g, ''),
        relation: relation.trim() || 'Contato',
        emergency: false,
        photo: photoUrl,
      });

      setName('');
      setPhone('');
      setRelation('');
      setPhotoFile(null);
      setPhotoPreview('');
    }

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
                      <div className="flex items-start gap-3">
                        {contact.photo && (
                          <img
                            src={contact.photo}
                            alt={contact.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white"
                          />
                        )}
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
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditContact(contact)}
                          className="rounded-2xl px-3 py-2 text-xs font-semibold bg-blue-600 text-white"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleEmergency(contact.id)}
                          className={`rounded-2xl px-3 py-2 text-xs font-semibold ${contact.emergency ? 'bg-violet-700 text-white' : 'bg-slate-200 text-slate-700'}`}
                        >
                          {contact.emergency ? 'Remover destaque' : 'Destacar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <h3 className="font-bold text-lg mb-4">
            {editingContact ? 'Editar Contato' : 'Adicionar Contato'}
          </h3>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Foto de Perfil</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 text-xs">Foto</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
              <p className="text-xs text-slate-500 mt-1">Máximo 5MB, formatos: JPG, PNG, GIF</p>
            </div>
          </div>
        </div>

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

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-violet-700 text-white rounded-3xl py-4 text-sm font-bold uppercase tracking-widest shadow-md shadow-violet-700/20"
          >
            {editingContact ? 'Atualizar contato' : 'Salvar contato'}
          </button>
          {editingContact && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex-1 bg-slate-200 text-slate-700 rounded-3xl py-4 text-sm font-bold uppercase tracking-widest"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
