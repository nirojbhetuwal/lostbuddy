import { useState, useEffect } from 'react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

export const useItems = (initialFilters = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState(initialFilters);
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    locations: []
  });

  const fetchItems = async (page = 1, customFilters = null) => {
    try {
      setLoading(true);
      const currentFilters = customFilters || filters;
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...currentFilters
      });

      const response = await api.get(`/items?${params}`);
      setItems(response.data.data.items);
      setPagination(response.data.data.pagination);
      
      // Update available filters on first load
      if (page === 1 && !customFilters) {
        setAvailableFilters(response.data.data.filters || {
          categories: [],
          locations: []
        });
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1 });
  };

  const searchItems = async (searchTerm) => {
    await updateFilters({ search: searchTerm || undefined });
  };

  const fetchItem = async (itemId) => {
    try {
      const response = await api.get(`/items/${itemId}`);
      return response.data.data.item;
    } catch (error) {
      console.error('Error fetching item:', error);
      toast.error('Failed to load item details');
      throw error;
    }
  };

  const createItem = async (itemData) => {
    try {
      const response = await api.post('/items', itemData);
      toast.success('Item reported successfully!');
      return response.data.data.item;
    } catch (error) {
      console.error('Error creating item:', error);
      const message = error.response?.data?.message || 'Failed to report item';
      toast.error(message);
      throw error;
    }
  };

  const updateItem = async (itemId, itemData) => {
    try {
      const response = await api.put(`/items/${itemId}`, itemData);
      toast.success('Item updated successfully!');
      return response.data.data.item;
    } catch (error) {
      console.error('Error updating item:', error);
      const message = error.response?.data?.message || 'Failed to update item';
      toast.error(message);
      throw error;
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await api.delete(`/items/${itemId}`);
      toast.success('Item deleted successfully!');
      // Remove from local state
      setItems(prev => prev.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
      const message = error.response?.data?.message || 'Failed to delete item';
      toast.error(message);
      throw error;
    }
  };

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/items/my-items');
      setItems(response.data.data.items);
      return response.data.data.items;
    } catch (error) {
      console.error('Error fetching my items:', error);
      toast.error('Failed to load your items');
      setItems([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Load items when filters change
  useEffect(() => {
    fetchItems(filters.page || 1);
  }, [filters]);

  return {
    items,
    loading,
    pagination,
    filters,
    availableFilters,
    fetchItems,
    updateFilters,
    clearFilters,
    searchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    fetchMyItems
  };
};

export default useItems;