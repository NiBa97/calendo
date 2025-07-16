import { useState, useEffect } from 'react';
import { getPb } from '../../pocketbaseUtils';
import { Tag } from '../../types';

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const pb = getPb();
      const records = await pb.collection('tag').getFullList();
      
      const tagList: Tag[] = records.map(record => ({
        id: record.id,
        name: record.name || '',
        color: record.color || '#gray',
        user: record.user || []
      }));
      
      setTags(tagList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  return {
    tags,
    loading,
    error,
    refetch: loadTags,
  };
};