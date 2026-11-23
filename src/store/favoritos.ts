import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IdMoneda } from '../services/precios';

type EstadoFavoritos = {
  favoritos: IdMoneda[];
  alternarFavorito: (id: IdMoneda) => void;
};

export const useFavoritos = create<EstadoFavoritos>()(
  persist(
    (set) => ({
      favoritos: [],
      alternarFavorito: (id) => set((estado) => ({
        favoritos: estado.favoritos.includes(id)
          ? estado.favoritos.filter((favorito) => favorito !== id)
          : [...estado.favoritos, id],
      })),
    }),
    { name: 'pulso-abierto-favoritos' },
  ),
);
