import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SessionData } from '../types';

export function useSessions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createSession = async (sessionData: Omit<SessionData, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          protocol_id: sessionData.protocolId,
          pre_calm: sessionData.preCalmValue,
          pre_clarity: sessionData.preClarityValue,
          pre_energy: sessionData.preEnergyValue,
          completed: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  };

  const updateSession = async (
    sessionId: string, 
    updates: {
      postCalmValue?: number;
      postClarityValue?: number;
      postEnergyValue?: number;
      completed?: boolean;
      completedAt?: Date;
    }
  ) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      const updateData: any = {};
      
      if (updates.postCalmValue !== undefined) updateData.post_calm = updates.postCalmValue;
      if (updates.postClarityValue !== undefined) updateData.post_clarity = updates.postClarityValue;
      if (updates.postEnergyValue !== undefined) updateData.post_energy = updates.postEnergyValue;
      if (updates.completed !== undefined) {
        updateData.completed = updates.completed;
        if (updates.completed && updates.completedAt) {
          updateData.completed_at = updates.completedAt.toISOString();
        }
      }

      const { data, error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  };

  const getUserSessions = async (limit?: number) => {
    if (!user) throw new Error('User not authenticated');

    const query = supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (limit) {
      query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  };

  return {
    createSession,
    updateSession,
    getUserSessions,
    loading
  };
}