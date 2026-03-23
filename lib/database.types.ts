export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          dni: string
          full_name: string
          role: 'admin' | 'student'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          dni: string
          full_name: string
          role?: 'admin' | 'student'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          dni?: string
          full_name?: string
          role?: 'admin' | 'student'
          is_active?: boolean
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string | null
          is_published: boolean
          is_active: boolean
          instructor_name: string | null
          instructor_bio: string | null
          instructor_avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url?: string | null
          is_published?: boolean
          is_active?: boolean
          instructor_name?: string | null
          instructor_bio?: string | null
          instructor_avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          is_published?: boolean
          is_active?: boolean
          instructor_name?: string | null
          instructor_bio?: string | null
          instructor_avatar_url?: string | null
          created_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          course_id: string
          title: string
          order_index: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          order_index: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          youtube_id: string | null
          content_md: string | null
          order_index: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          youtube_id?: string | null
          content_md?: string | null
          order_index: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          youtube_id?: string | null
          content_md?: string | null
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          enrolled_at: string
          expires_at: string | null
          status: 'active' | 'paused' | 'suspended'
          drip_interval_days: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          enrolled_at?: string
          expires_at?: string | null
          status?: 'active' | 'paused' | 'suspended'
          drip_interval_days?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          enrolled_at?: string
          expires_at?: string | null
          status?: 'active' | 'paused' | 'suspended'
          drip_interval_days?: number
          created_at?: string
        }
      }
      lesson_overrides: {
        Row: {
          id: string
          enrollment_id: string
          lesson_id: string
          manual_unlock_date: string
          created_at: string
        }
        Insert: {
          id?: string
          enrollment_id: string
          lesson_id: string
          manual_unlock_date: string
          created_at?: string
        }
        Update: {
          id?: string
          enrollment_id?: string
          lesson_id?: string
          manual_unlock_date?: string
          created_at?: string
        }
      }
      progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          is_completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ─── Convenience types ───────────────────────────────────────────────────────
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Module = Database['public']['Tables']['modules']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type Enrollment = Database['public']['Tables']['enrollments']['Row']
export type LessonOverride = Database['public']['Tables']['lesson_overrides']['Row']
export type Progress = Database['public']['Tables']['progress']['Row']
