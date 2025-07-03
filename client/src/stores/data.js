// FILE: client/src/stores/data.js
import { defineStore } from 'pinia';
import api from '@/services/api';

export const useDataStore = defineStore('data', {
  state: () => ({
    farmlands:[],
    currentFarmland: null,
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchFarmlands() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get('/farmlands');
        this.farmlands = response.data;
      } catch (error) {
        this.error = 'Failed to fetch farmlands.';
        console.error(this.error, error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchFarmlandById(id) {
        this.isLoading = true;
        this.error = null;
        try {
            const response = await api.get(`/farmlands/${id}`);
            this.currentFarmland = response.data;
        } catch (error) {
            this.error = `Failed to fetch farmland ${id}.`;
            console.error(this.error, error);
        } finally {
            this.isLoading = false;
        }
    },
  }
});