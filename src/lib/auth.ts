import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  agency_name?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
};

export const auth = {
  async signUp(email: string, password: string, name: string): Promise<void> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name, // Store name in auth metadata
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned after signup');

    // The database trigger will automatically create the user profile
    // No need to manually create it here
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getCurrentUserProfile(): Promise<UserProfile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    // Try to get existing profile
    const { data: profile, error } = await supabase
      .from('users')
      .select()
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw error;
    }

    // If no profile exists, the trigger should have created it
    // Let's wait a moment and try again
    if (!profile) {
      // Wait a bit for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: retryProfile, error: retryError } = await supabase
        .from('users')
        .select()
        .eq('id', user.id)
        .single();

      if (retryError) throw retryError;
      return retryProfile as UserProfile;
    }

    return profile as UserProfile;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update profile');

    return data as UserProfile;
  },

  async ensureProfileExists(): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('users')
      .select()
      .eq('id', user.id)
      .single();

    if (!profile) {
      // The trigger should handle this, but if it doesn't, we'll wait
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  },
}; 