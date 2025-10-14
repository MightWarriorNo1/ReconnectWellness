import { supabase } from './supabase';

export class AudioStorageService {
  private static readonly BUCKET_NAME = 'audio-protocols';

  /**
   * Get the public URL for an audio file
   */
  static getAudioUrl(fileName: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  }

  /**
   * Upload an audio file to Supabase Storage
   */
  static async uploadAudio(file: File, fileName: string): Promise<{ url: string | null; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return { url: null, error };
      }

      const url = this.getAudioUrl(fileName);
      return { url, error: null };
    } catch (error) {
      return { url: null, error };
    }
  }

  /**
   * List all audio files in the bucket
   */
  static async listAudioFiles(): Promise<{ files: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', {
          limit: 100,
          offset: 0
        });

      return { files: data, error };
    } catch (error) {
      return { files: null, error };
    }
  }

  /**
   * Delete an audio file
   */
  static async deleteAudio(fileName: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName]);

      return { error };
    } catch (error) {
      return { error };
    }
  }
}