// Tipos de la base de datos (formato de `supabase gen types typescript`).
// Escritos a mano a partir de supabase/migrations; regenerar cuando el proyecto esté conectado.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type UserRole = 'user' | 'admin';
type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
type PlayerPosition = 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'any';
type AppLocale = 'en' | 'nb';
type VenueSurface = 'artificial_turf' | 'grass' | 'indoor';
type MatchFormat = '5v5' | '7v7' | '9v9' | '11v11';
type MatchGender = 'mixed' | 'men' | 'women';
type MatchStatus = 'open' | 'full' | 'cancelled' | 'completed';
type MatchVisibility = 'public' | 'private';
type ParticipantStatus = 'confirmed' | 'waitlisted' | 'cancelled';

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    full_name: string;
                    avatar_url: string | null;
                    role: UserRole;
                    skill_level: SkillLevel | null;
                    preferred_position: PlayerPosition | null;
                    locale: AppLocale;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    full_name?: string;
                    avatar_url?: string | null;
                    role?: UserRole;
                    skill_level?: SkillLevel | null;
                    preferred_position?: PlayerPosition | null;
                    locale?: AppLocale;
                };
                Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
                Relationships: [];
            };
            venues: {
                Row: {
                    id: string;
                    name: string;
                    address: string;
                    area: string;
                    city: string;
                    lat: number;
                    lng: number;
                    surface: VenueSurface;
                    has_changing_rooms: boolean;
                    has_lights: boolean;
                    notes: string | null;
                    created_by: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    address: string;
                    area: string;
                    city?: string;
                    lat: number;
                    lng: number;
                    surface?: VenueSurface;
                    has_changing_rooms?: boolean;
                    has_lights?: boolean;
                    notes?: string | null;
                    created_by?: string | null;
                };
                Update: Partial<Database['public']['Tables']['venues']['Insert']>;
                Relationships: [];
            };
            matches: {
                Row: {
                    id: string;
                    venue_id: string;
                    host_id: string;
                    title: string;
                    description: string | null;
                    format: MatchFormat;
                    skill_level: SkillLevel;
                    gender: MatchGender;
                    visibility: MatchVisibility;
                    starts_at: string;
                    duration_minutes: number;
                    max_players: number;
                    price_per_player: number | null;
                    status: MatchStatus;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    venue_id: string;
                    host_id: string;
                    title: string;
                    description?: string | null;
                    format: MatchFormat;
                    skill_level?: SkillLevel;
                    gender?: MatchGender;
                    visibility?: MatchVisibility;
                    starts_at: string;
                    duration_minutes?: number;
                    max_players: number;
                    price_per_player?: number | null;
                    status?: MatchStatus;
                };
                Update: Partial<Database['public']['Tables']['matches']['Insert']>;
                Relationships: [];
            };
            match_participants: {
                Row: {
                    id: string;
                    match_id: string;
                    user_id: string;
                    status: ParticipantStatus;
                    joined_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    match_id: string;
                    user_id: string;
                    status?: ParticipantStatus;
                };
                Update: Partial<Database['public']['Tables']['match_participants']['Insert']>;
                Relationships: [];
            };
        };
        Views: {
            match_listings: {
                Row: {
                    id: string;
                    title: string;
                    format: MatchFormat;
                    skill_level: SkillLevel;
                    gender: MatchGender;
                    visibility: MatchVisibility;
                    starts_at: string;
                    duration_minutes: number;
                    max_players: number;
                    price_per_player: number | null;
                    status: MatchStatus;
                    host_id: string;
                    venue_id: string;
                    venue_name: string;
                    venue_area: string;
                    venue_surface: VenueSurface;
                    venue_lat: number;
                    venue_lng: number;
                    confirmed_count: number;
                    waitlist_count: number;
                };
                Relationships: [];
            };
        };
        Functions: {
            join_match: { Args: { p_match_id: string }; Returns: ParticipantStatus };
            leave_match: { Args: { p_match_id: string }; Returns: undefined };
            is_admin: { Args: Record<string, never>; Returns: boolean };
            can_view_match: { Args: { p_match_id: string }; Returns: boolean };
        };
        Enums: {
            user_role: UserRole;
            skill_level: SkillLevel;
            player_position: PlayerPosition;
            app_locale: AppLocale;
            venue_surface: VenueSurface;
            match_format: MatchFormat;
            match_gender: MatchGender;
            match_status: MatchStatus;
            match_visibility: MatchVisibility;
            participant_status: ParticipantStatus;
        };
        CompositeTypes: Record<string, never>;
    };
};
