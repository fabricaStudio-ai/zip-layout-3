import { useState, useCallback, useEffect } from 'react';
import { StoredRecording } from '../types';

const DB_NAME = 'SereneRecordings';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export function useStoredRecordings() {
  const [recordings, setRecordings] = useState<StoredRecording[]>([]);
  const [loading, setLoading] = useState(true);

  // Load recordings from IndexedDB
  useEffect(() => {
    const loadRecordings = async () => {
      try {
        const database = await initDB();
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => {
          console.error('Erro ao carregar gravações:', request.error);
          setRecordings([]);
          setLoading(false);
        };

        request.onsuccess = () => {
          const data = request.result as StoredRecording[];
          // Sort by timestamp descending (newest first)
          setRecordings(data.sort((a, b) => b.timestamp - a.timestamp));
          setLoading(false);
        };
      } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
        setRecordings([]);
        setLoading(false);
      }
    };

    loadRecordings();
  }, []);

  const saveRecording = useCallback(
    async (
      blob: Blob,
      duration: number,
      latitude?: number,
      longitude?: number,
      location?: string
    ) => {
      try {
        return new Promise<void>(async (resolve, reject) => {
          const reader = new FileReader();
          const date = new Date();
          const id = `rec_${date.getTime()}`;

          reader.onload = async () => {
            try {
              const dataUrl = reader.result as string;

              const newRecording: StoredRecording = {
                id,
                timestamp: date.getTime(),
                date: date.toLocaleDateString('pt-br'),
                time: date.toLocaleTimeString('pt-br', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }),
                duration,
                latitude,
                longitude,
                location,
                dataUrl,
              };

              const database = await initDB();
              const transaction = database.transaction([STORE_NAME], 'readwrite');
              const store = transaction.objectStore(STORE_NAME);
              const addRequest = store.add(newRecording);

              addRequest.onerror = () => {
                console.error('Erro ao salvar gravação:', addRequest.error);
                reject(addRequest.error);
              };

              addRequest.onsuccess = () => {
                // Reload all recordings
                const getAllRequest = store.getAll();
                
                getAllRequest.onsuccess = () => {
                  const allRecordings = getAllRequest.result as StoredRecording[];
                  const sorted = allRecordings.sort((a, b) => b.timestamp - a.timestamp);
                  setRecordings(sorted);
                  resolve();
                };

                getAllRequest.onerror = () => {
                  console.error('Erro ao recarregar gravações:', getAllRequest.error);
                  reject(getAllRequest.error);
                };
              };
            } catch (error) {
              reject(error);
            }
          };

          reader.onerror = () => {
            reject(new Error('Erro ao ler arquivo de áudio'));
          };

          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Erro ao salvar gravação:', error);
        throw error;
      }
    },
    []
  );

  const deleteRecording = useCallback((id: string) => {
    const deleteFromDB = async () => {
      try {
        const database = await initDB();
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const deleteRequest = store.delete(id);

        deleteRequest.onerror = () => {
          console.error('Erro ao deletar gravação:', deleteRequest.error);
        };

        deleteRequest.onsuccess = () => {
          // Reload all recordings
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const allRecordings = getAllRequest.result as StoredRecording[];
            const sorted = allRecordings.sort((a, b) => b.timestamp - a.timestamp);
            setRecordings(sorted);
          };

          getAllRequest.onerror = () => {
            console.error('Erro ao recarregar gravações:', getAllRequest.error);
          };
        };
      } catch (error) {
        console.error('Erro ao deletar gravação:', error);
      }
    };

    deleteFromDB();
  }, []);

  const deleteAllRecordings = useCallback(() => {
    const clearDB = async () => {
      try {
        const database = await initDB();
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const clearRequest = store.clear();

        clearRequest.onerror = () => {
          console.error('Erro ao limpar gravações:', clearRequest.error);
        };

        clearRequest.onsuccess = () => {
          setRecordings([]);
        };
      } catch (error) {
        console.error('Erro ao limpar gravações:', error);
      }
    };

    clearDB();
  }, []);

  const getTotalDuration = useCallback(() => {
    return recordings.reduce((total, rec) => total + rec.duration, 0);
  }, [recordings]);

  return {
    recordings,
    loading,
    saveRecording,
    deleteRecording,
    deleteAllRecordings,
    getTotalDuration,
  };
}
