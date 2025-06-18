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

async function createUserProfile(user: User, name: string): Promise<void> {
  // First check if profile already exists
  const { data: existingProfile } = await supabase
    .from('users')
    .select()
    .eq('id', user.id)
    .single();

  if (existingProfile) {
    console.log('Profile already exists');
    return;
  }

  const { error } = await supabase
    .from('users')
    .insert({
      id: user.id,
      email: user.email,
      name: name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

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

    // Create user profile in our users table
    await createUserProfile(data.user, name);
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Ensure profile exists after sign in
    if (data.user) {
      const metadata = data.user.user_metadata;
      await createUserProfile(data.user, metadata?.name || email.split('@')[0]);
    }

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

    // If no profile exists, create one
    if (!profile) {
      const metadata = user.user_metadata;
      await createUserProfile(user, metadata?.name || user.email?.split('@')[0] || 'User');
      // Fetch the newly created profile
      const { data: newProfile, error: newError } = await supabase
        .from('users')
        .select()
        .eq('id', user.id)
        .single();

      if (newError) throw newError;
      return newProfile as UserProfile;
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
      const metadata = user.user_metadata;
      await createUserProfile(user, metadata?.name || user.email?.split('@')[0] || 'User');
    }
  },
}; 