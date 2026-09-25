// Generado desde el proyecto de Supabase (yqtxllyhmmwgvvirlput). No editar a mano:
// regenerar con `npx supabase gen types typescript --project-id yqtxllyhmmwgvvirlput`.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: '14.5';
    };
    public: {
        Tables: {
            match_participants: {
                Row: {
                    id: string;
                    joined_at: string;
                    match_id: string;
                    status: Database['public']['Enums']['participant_status'];
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    id?: string;
                    joined_at?: string;
                    match_id: string;
                    status?: Database['public']['Enums']['participant_status'];
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    id?: string;
                    joined_at?: string;
                    match_id?: string;
                    status?: Database['public']['Enums']['participant_status'];
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
            join_match: {
                Args: { p_match_id: string };
                Returns: Database['public']['Enums']['participant_status'];
            };
            leave_match: { Args: { p_match_id: string }; Returns: undefined };
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
