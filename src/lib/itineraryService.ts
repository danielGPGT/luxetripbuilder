import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { gemini } from './gemini';
import type { TripPreferences, GeneratedItinerary } from './gemini';

export interface SavedItinerary extends GeneratedItinerary {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published';
}

export class ItineraryService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async saveItinerary(itinerary: GeneratedItinerary, userId: string): Promise<SavedItinerary> {
    try {
      const { data, error } = await this.supabase
        .from('itineraries')
        .insert([
          {
            user_id: userId,
            ...itinerary,
            status: 'draft',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      toast.success('Itinerary saved successfully');
      return data;
    } catch (error) {
      toast.error('Failed to save itinerary');
      throw error;
    }
  }

  async updateItinerary(id: string, updates: Partial<GeneratedItinerary>): Promise<SavedItinerary> {
    try {
      const { data, error } = await this.supabase
        .from('itineraries')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Itinerary updated successfully');
      return data;
    } catch (error) {
      toast.error('Failed to update itinerary');
      throw error;
    }
  }

  async deleteItinerary(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('itineraries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Itinerary deleted successfully');
    } catch (error) {
      toast.error('Failed to delete itinerary');
      throw error;
    }
  }

  async getUserItineraries(userId: string): Promise<SavedItinerary[]> {
    try {
      const { data, error } = await this.supabase
        .from('itineraries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      toast.error('Failed to fetch itineraries');
      throw error;
    }
  }

  async getItinerary(id: string): Promise<SavedItinerary> {
    try {
      const { data, error } = await this.supabase
        .from('itineraries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      toast.error('Failed to fetch itinerary');
      throw error;
    }
  }
}

export const itineraryService = {
  async generate(preferences: TripPreferences, userId: string): Promise<SavedItinerary> {
    try {
      // Generate itinerary using Gemini
      const generated = await gemini.generateItinerary(preferences);

      // Get current timestamp in ISO format
      const now = new Date().toISOString();

      // Save to Supabase
      const { data, error } = await this.supabase
        .from('itineraries')
        .insert({
          title: `${preferences.clientName}'s ${preferences.destination} Trip`,
          client_name: preferences.clientName,
          destination: preferences.destination,
          generated_by: userId,
          preferences,
          days: generated.days,
          date_created: now,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      if (!data) throw new Error('Failed to save itinerary');

      return data as SavedItinerary;
    } catch (error) {
      console.error('Error in generate:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<SavedItinerary> {
    const { data, error } = await this.supabase
      .from('itineraries')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Itinerary not found');

    return data as SavedItinerary;
  },

  async list(userId: string): Promise<SavedItinerary[]> {
    const { data, error } = await this.supabase
      .from('itineraries')
      .select()
      .eq('generated_by', userId)
      .order('date_created', { ascending: false });

    if (error) throw error;
    return (data || []) as SavedItinerary[];
  },

  async update(id: string, updates: Partial<SavedItinerary>): Promise<SavedItinerary> {
    // Always update the updated_at timestamp
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('itineraries')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update itinerary');

    return data as SavedItinerary;
  },

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('itineraries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
}; 