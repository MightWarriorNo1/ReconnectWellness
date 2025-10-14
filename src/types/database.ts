export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          protocol_id: string;
          pre_calm: number;
          pre_clarity: number;
          pre_energy: number;
          post_calm: number | null;
          post_clarity: number | null;
          post_energy: number | null;
          completed: boolean;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          protocol_id: string;
          pre_calm: number;
          pre_clarity: number;
          pre_energy: number;
          post_calm?: number | null;
          post_clarity?: number | null;
          post_energy?: number | null;
          completed?: boolean;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          post_calm?: number | null;
          post_clarity?: number | null;
          post_energy?: number | null;
          completed?: boolean;
          completed_at?: string | null;
        };
      };
    };
  };
}