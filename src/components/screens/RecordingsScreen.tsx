import { useState } from 'react';
import {
  Mic,
  Trash2,
  Play,
  Pause,
  MapPin,
  Calendar,
  Clock,
  Volume2,
  Download,
  Trash,
} from 'lucide-react';
import { StoredRecording } from '../../types';

type RecordingsScreenProps = {
  recordings: StoredRecording[];
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onBack: () => void;
};

export default function RecordingsScreen({
  recordings,
  onDelete,
  onDeleteAll,
  onBack,
}: RecordingsScreenProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchDate, setSearchDate] = useState('');

  const filteredRecordings = searchDate
    ? recordings.filter((rec) => rec.date === searchDate)
    : recordings;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const getTotalSize = () => {
    // Estimate size based on data URLs (rough calculation)
    const totalChars = recordings.reduce((total, rec) => {
      return total + rec.dataUrl.length;
    }, 0);
    return (totalChars / 1024 / 1024).toFixed(2);
  };

  const downloadRecording = (recording: StoredRecording) => {
    const link = document.createElement('a');
    link.href = recording.dataUrl;
    link.download = `gravacao_${recording.date}_${recording.time}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAll = () => {
    if (
      window.confirm(
        'Tem certeza que deseja deletar TODAS as gravações? Esta ação não pode ser desfeita.'
      )
    ) {
      onDeleteAll();
    }
  };

  return (
    <div className="px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Minhas Gravações</h2>
          <p className="text-slate-500 text-sm mt-1">
            {recordings.length} gravação{recordings.length !== 1 ? 's' : ''} salva
            {recordings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onBack}
          className="bg-violet-700 text-white rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-widest shadow-md shadow-violet-700/20"
        >
          Voltar
        </button>
      </div>

      {recordings.length > 0 && (
        <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700">
              <span className="font-semibold">Espaço usado:</span> ~
              {getTotalSize()} MB
            </div>
            {recordings.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100 transition-colors flex items-center gap-1"
              >
                <Trash className="w-3 h-3" />
                Limpar tudo
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-600 block mb-2">
              Filtrar por data:
            </label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-violet-500"
            />
            {searchDate && (
              <button
                onClick={() => setSearchDate('')}
                className="text-xs text-slate-500 mt-2 hover:text-slate-700"
              >
                Limpar filtro
              </button>
            )}
          </div>
        </div>
      )}

      {filteredRecordings.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center">
          <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mic className="w-6 h-6 text-violet-700" />
          </div>
          <p className="text-slate-500">
            {recordings.length === 0
              ? 'Nenhuma gravação salva ainda. Comece a gravar!'
              : 'Nenhuma gravação nesta data.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecordings.map((recording) => (
            <div
              key={recording.id}
              className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-700 shrink-0">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-900 truncate">
                        {`Gravação ${recording.time}`}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3" />
                        {recording.date}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="font-mono">{formatDuration(recording.duration)}</span>
                    </div>

                    {recording.location && (
                      <div className="flex items-start gap-2 text-xs text-slate-600">
                        <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="break-words">{recording.location}</span>
                      </div>
                    )}

                    {recording.latitude && recording.longitude && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="font-mono">
                          {recording.latitude.toFixed(5)}, {recording.longitude.toFixed(5)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() =>
                      setPlayingId(playingId === recording.id ? null : recording.id)
                    }
                    className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center text-violet-700 hover:bg-violet-200 transition-colors"
                    title={playingId === recording.id ? 'Pausar' : 'Reproduzir'}
                  >
                    {playingId === recording.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => downloadRecording(recording)}
                    className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
                    title="Fazer download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(recording.id)}
                    className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {playingId === recording.id && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <audio
                    key={`audio_${recording.id}`}
                    src={recording.dataUrl}
                    controls
                    autoPlay
                    className="w-full h-8"
                    onEnded={() => setPlayingId(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
