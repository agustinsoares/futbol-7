// Generado desde las migraciones (supabase gen types typescript). No editar a mano:
// regenerar con `npx supabase gen types typescript --local --schema public`.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    public: {
        Tables: {
            match_messages: {
                Row: {
                    body: string;
                    created_at: string;
                    id: string;
                    match_id: string;
                    user_id: string;
                };
                Insert: {
                    body: string;
                    created_at?: string;
                    id?: string;
                    match_id: string;
                    user_id: string;
                };
                Update: {
                    body?: string;
                    created_at?: string;
                    id?: string;
                    match_id?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'match_messages_match_id_fkey';
                        columns: ['match_id'];
                        isOneToOne: false;
                        referencedRelation: 'match_listings';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'match_messages_match_id_fkey';
                        columns: ['match_id'];
                        isOneToOne: false;
                        referencedRelation: 'matches';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'match_messages_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'profiles';
                        referencedColumns: ['id'];
                    },
                ];
            };
            match_participants: {
                Row: {
                    attended: boolean | null;
                    id: string;
                    joined_at: string;
                    match_id: string;
                    reminder_sent_at: string | null;
                    status: Database['public']['Enums']['participant_status'];
                    team: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    attended?: boolean | null;
                    id?: string;
                    joined_at?: string;
                    match_id: string;
                    reminder_sent_at?: string | null;
                    status?: Database['public']['Enums']['participant_status'];
                    team?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    attended?: boolean | null;
                    id?: string;
                    joined_at?: string;
                    match_id?: string;
                    reminder_sent_at?: string | null;
                    status?: Database['public']['Enums']['participant_status'];
                    team?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'match_participants_match_id_fkey';
                        columns: ['match_id'];
                        isOneToOne: false;
                        referencedRelation: 'match_listings';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'match_participants_match_id_fkey';
                        columns: ['match_id'];
                        isOneToOne: false;
                        referencedRelation: 'matches';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'match_participants_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'profiles';
                        referencedColumns: ['id'];
                    },
                ];
            };
            matches: {
                Row: {
                    created_at: string;
                    description: string | null;
                    duration_minutes: number;
                    format: Database['public']['Enums']['match_format'];
                    gender: Database['public']['Enums']['match_gender'];
                    host_id: string;
                    id: string;
                    max_players: number;
                    price_per_player: number | null;
                    score_a: number | null;
                    score_b: number | null;
                    series_id: string | null;
                    skill_level: Database['public']['Enums']['skill_level'];
                    starts_at: string;
                    status: Database['public']['Enums']['match_status'];
                    title: string;
                    updated_at: string;
                    venue_id: string;
                    visibility: Database['public']['Enums']['match_visibility'];
                };
                Insert: {
                    created_at?: string;
                    description?: string | null;
                    duration_minutes?: number;
                    format: Database['public']['Enums']['match_format'];
                    gender?: Database['public']['Enums']['match_gender'];
                    host_id: string;
                    id?: string;
                    max_players: number;
                    price_per_player?: number | null;
                    score_a?: number | null;
                    score_b?: number | null;
                    series_id?: string | null;
                    skill_level?: Database['public']['Enums']['skill_level'];
                    starts_at: string;
                    status?: Database['public']['Enums']['match_status'];
                    title: string;
                    updated_at?: string;
                    venue_id: string;
                    visibility?: Database['public']['Enums']['match_visibility'];
                };
                Update: {
                    created_at?: string;
                    description?: string | null;
                    duration_minutes?: number;
                    format?: Database['public']['Enums']['match_format'];
                    gender?: Database['public']['Enums']['match_gender'];
                    host_id?: string;
                    id?: string;
                    max_players?: number;
                    price_per_player?: number | null;
                    score_a?: number | null;
                    score_b?: number | null;
                    series_id?: string | null;
                    skill_level?: Database['public']['Enums']['skill_level'];
                    starts_at?: string;
                    status?: Database['public']['Enums']['match_status'];
                    title?: string;
                    updated_at?: string;
                    venue_id?: string;
                    visibility?: Database['public']['Enums']['match_visibility'];
                };
                Relationships: [
                    {
                        foreignKeyName: 'matches_host_id_fkey';
                        columns: ['host_id'];
                        isOneToOne: false;
                        referencedRelation: 'profiles';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'matches_venue_id_fkey';
                        columns: ['venue_id'];
                        isOneToOne: false;
                        referencedRelation: 'match_listings';
                        referencedColumns: ['venue_id'];
                    },
                    {
                        foreignKeyName: 'matches_venue_id_fkey';
                        columns: ['venue_id'];
                        isOneToOne: false;
                        referencedRelation: 'venues';
                        referencedColumns: ['id'];
                    },
                ];
            };
            player_ratings: {
                Row: {
                    created_at: string;
                    id: string;
                    match_id: string;
                    rated_id: string;
                    rater_id: string;
                    score: number;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    match_id: string;
                    rated_id: string;
                    rater_id: string;
                    score: number;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    match_id?: string;
                    rated_id?: string;
                    rater_id?: string;
                    score?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: 'player_ratings_match_id_fkey';
                        columns: ['match_id'];
                        isOneToOne: false;
                        referencedRelation: 'match_listings';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'player_ratings_match_id_fkey';
                        columns: ['match_id'];
                        isOneToOne: false;
                        referencedRelation: 'matches';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'player_ratings_rated_id_fkey';
                        columns: ['rated_id'];
                        isOneToOne: false;
                        referencedRelation: 'profiles';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'player_ratings_rater_id_fkey';
                        columns: ['rater_id'];
                        isOneToOne: false;
                        referencedRelation: 'profiles';
                        referencedColumns: ['id'];
                    },
                ];
            };
            profiles: {
                Row: {
                    avatar_url: string | null;
                    created_at: string;
                    full_name: string;
                    id: string;
                    locale: Database['public']['Enums']['app_locale'];
                    preferred_position: Database['public']['Enums']['player_position'] | null;
                    role: Database['public']['Enums']['user_role'];
                    skill_level: Database['public']['Enums']['skill_level'] | null;
                    updated_at: string;
                };
                Insert: {
                    avatar_url?: string | null;
                    created_at?: string;
                    full_name?: string;
                    id: string;
                    locale?: Database['public']['Enums']['app_locale'];
                    preferred_position?: Database['public']['Enums']['player_position'] | null;
                    role?: Database['public']['Enums']['user_role'];
                    skill_level?: Database['public']['Enums']['skill_level'] | null;
                    updated_at?: string;
                };
                Update: {
                    avatar_url?: string | null;
                    created_at?: string;
                    full_name?: string;
                    id?: string;
                    locale?: Database['public']['Enums']['app_locale'];
                    preferred_position?: Database['public']['Enums']['player_position'] | null;
                    role?: Database['public']['Enums']['user_role'];
                    skill_level?: Database['public']['Enums']['skill_level'] | null;
                    updated_at?: string;
                };
                Relationships: [];
            };
            venues: {
                Row: {
                    address: string;
                    area: string;
                    city: string;
                    created_at: string;
                    created_by: string | null;
                    has_changing_rooms: boolean;
                    has_lights: boolean;
                    id: string;
                    lat: number;
                    lng: number;
                    name: string;
                    notes: string | null;
                    surface: Database['public']['Enums']['venue_surface'];
                };
                Insert: {
                    address: string;
                    area: string;
                    city?: string;
                    created_at?: string;
                    created_by?: string | null;
                    has_changing_rooms?: boolean;
                    has_lights?: boolean;
                    id?: string;
                    lat: number;
                    lng: number;
                    name: string;
                    notes?: string | null;
                    surface?: Database['public']['Enums']['venue_surface'];
                };
                Update: {
                    address?: string;
                    area?: string;
                    city?: string;
                    created_at?: string;
                    created_by?: string | null;
                    has_changing_rooms?: boolean;
                    has_lights?: boolean;
                    id?: string;
                    lat?: number;
                    lng?: number;
                    name?: string;
                    notes?: string | null;
                    surface?: Database['public']['Enums']['venue_surface'];
                };
                Relationships: [
                    {
                        foreignKeyName: 'venues_created_by_fkey';
                        columns: ['created_by'];
                        isOneToOne: false;
                        referencedRelation: 'profiles';
                        referencedColumns: ['id'];
                    },
                ];
            };
        };
        Views: {
            match_listings: {
                Row: {
                    confirmed_count: number | null;
                    duration_minutes: number | null;
                    format: Database['public']['Enums']['match_format'] | null;
                    gender: Database['public']['Enums']['match_gender'] | null;
                    host_id: string | null;
                    id: string | null;
                    max_players: number | null;
                    price_per_player: number | null;
                    score_a: number | null;
                    score_b: number | null;
                    series_id: string | null;
                    skill_level: Database['public']['Enums']['skill_level'] | null;
                    starts_at: string | null;
                    status: Database['public']['Enums']['match_status'] | null;
                    title: string | null;
                    venue_area: string | null;
                    venue_id: string | null;
                    venue_lat: number | null;
                    venue_lng: number | null;
                    venue_name: string | null;
                    venue_surface: Database['public']['Enums']['venue_surface'] | null;
                    visibility: Database['public']['Enums']['match_visibility'] | null;
                    waitlist_count: number | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'matches_host_id_fkey';
                        columns: ['host_id'];
                        isOneToOne: false;
                        referencedRelation: 'profiles';
                        referencedColumns: ['id'];
                    },
                ];
            };
        };
        Functions: {
            complete_past_matches: { Args: Record<PropertyKey, never>; Returns: number };
            due_reminders: {
                Args: Record<PropertyKey, never>;
                Returns: {
                    duration_minutes: number;
                    email: string;
                    full_name: string;
                    locale: Database['public']['Enums']['app_locale'];
                    match_id: string;
                    participant_id: string;
                    starts_at: string;
                    title: string;
                    venue_address: string;
                    venue_name: string;
                }[];
            };
            join_match: {
                Args: { p_match_id: string };
                Returns: Database['public']['Enums']['participant_status'];
            };
            leave_match: { Args: { p_match_id: string }; Returns: undefined };
            mark_reminders_sent: { Args: { p_participant_ids: string[] }; Returns: undefined };
            player_stats: {
                Args: { p_user_id: string };
                Returns: {
                    attendance_rate: number;
                    avg_rating: number;
                    matches_hosted: number;
                    matches_played: number;
                    no_shows: number;
                    ratings_count: number;
                }[];
            };
            rate_player: {
                Args: { p_match_id: string; p_rated_id: string; p_score: number };
                Returns: undefined;
            };
            record_result: {
                Args: { p_attended: string[]; p_match_id: string; p_score_a: number; p_score_b: number };
                Returns: undefined;
            };
            save_teams: {
                Args: { p_match_id: string; p_team_a: string[]; p_team_b: string[] };
                Returns: undefined;
            };
        };
        Enums: {
            app_locale: 'en' | 'nb';
            match_format: '5v5' | '7v7' | '9v9' | '11v11';
            match_gender: 'mixed' | 'men' | 'women';
            match_status: 'open' | 'full' | 'cancelled' | 'completed';
            match_visibility: 'public' | 'private';
            participant_status: 'confirmed' | 'waitlisted' | 'cancelled';
            player_position: 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'any';
            skill_level: 'beginner' | 'intermediate' | 'advanced';
            user_role: 'user' | 'admin';
            venue_surface: 'artificial_turf' | 'grass' | 'indoor';
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        keyof (DefaultSchema['Tables'] & DefaultSchema['Views']) | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
      ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
    TableName extends (DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
    EnumName extends (DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
        : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
      ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
        : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
      ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    public: {
        Enums: {
            app_locale: ['en', 'nb'],
            match_format: ['5v5', '7v7', '9v9', '11v11'],
            match_gender: ['mixed', 'men', 'women'],
            match_status: ['open', 'full', 'cancelled', 'completed'],
            match_visibility: ['public', 'private'],
            participant_status: ['confirmed', 'waitlisted', 'cancelled'],
            player_position: ['goalkeeper', 'defender', 'midfielder', 'forward', 'any'],
            skill_level: ['beginner', 'intermediate', 'advanced'],
            user_role: ['user', 'admin'],
            venue_surface: ['artificial_turf', 'grass', 'indoor'],
        },
    },
} as const;

export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row'];
