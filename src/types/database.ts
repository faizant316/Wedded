export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      app_config: {
        Row: {
          key: string;
          updated_at: string;
          value: NonNullable<Json>;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value: NonNullable<Json>;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: NonNullable<Json>;
        };
        Relationships: [];
      };
      area_codes: {
        Row: {
          center_city_slug: string;
          code: string;
          created_at: string;
          label: NonNullable<Json>;
          radius_miles: number;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          center_city_slug: string;
          code: string;
          created_at?: string;
          label: NonNullable<Json>;
          radius_miles?: number;
          sort_order: number;
          updated_at?: string;
        };
        Update: {
          center_city_slug?: string;
          code?: string;
          created_at?: string;
          label?: NonNullable<Json>;
          radius_miles?: number;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'area_codes_center_city_slug_fkey';
            columns: ['center_city_slug'];
            isOneToOne: false;
            referencedRelation: 'cities';
            referencedColumns: ['slug'];
          },
        ];
      };
      categories: {
        Row: {
          aliases: string[];
          created_at: string;
          group_slug: string;
          is_religious: boolean;
          name: NonNullable<Json>;
          serves_alcohol: boolean;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          aliases?: string[];
          created_at?: string;
          group_slug: string;
          is_religious?: boolean;
          name: NonNullable<Json>;
          serves_alcohol?: boolean;
          slug: string;
          sort_order: number;
          updated_at?: string;
        };
        Update: {
          aliases?: string[];
          created_at?: string;
          group_slug?: string;
          is_religious?: boolean;
          name?: NonNullable<Json>;
          serves_alcohol?: boolean;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_group_slug_fkey';
            columns: ['group_slug'];
            isOneToOne: false;
            referencedRelation: 'category_groups';
            referencedColumns: ['slug'];
          },
        ];
      };
      category_groups: {
        Row: {
          created_at: string;
          name: NonNullable<Json>;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          name: NonNullable<Json>;
          slug: string;
          sort_order: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          name?: NonNullable<Json>;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      cities: {
        Row: {
          aliases: string[];
          area_code: string;
          census_geoid: string | null;
          created_at: string;
          latitude: number;
          location: unknown;
          longitude: number;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          aliases?: string[];
          area_code: string;
          census_geoid?: string | null;
          created_at?: string;
          latitude: number;
          location?: never;
          longitude: number;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          aliases?: string[];
          area_code?: string;
          census_geoid?: string | null;
          created_at?: string;
          latitude?: number;
          location?: never;
          longitude?: number;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      culture_events: {
        Row: {
          created_at: string;
          culture_slug: string;
          event_slug: string;
          is_core: boolean;
          local_name: Json | null;
          phase: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          culture_slug: string;
          event_slug: string;
          is_core?: boolean;
          local_name?: Json | null;
          phase: string;
          sort_order: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          culture_slug?: string;
          event_slug?: string;
          is_core?: boolean;
          local_name?: Json | null;
          phase?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'culture_events_culture_slug_fkey';
            columns: ['culture_slug'];
            isOneToOne: false;
            referencedRelation: 'cultures';
            referencedColumns: ['slug'];
          },
          {
            foreignKeyName: 'culture_events_event_slug_fkey';
            columns: ['event_slug'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['slug'];
          },
        ];
      };
      cultures: {
        Row: {
          created_at: string;
          is_default: boolean;
          name: NonNullable<Json>;
          script: string;
          shows_auspicious_dates: boolean;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          is_default?: boolean;
          name: NonNullable<Json>;
          script: string;
          shows_auspicious_dates?: boolean;
          slug: string;
          sort_order: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          is_default?: boolean;
          name?: NonNullable<Json>;
          script?: string;
          shows_auspicious_dates?: boolean;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      event_categories: {
        Row: {
          category_slug: string;
          created_at: string;
          event_slug: string;
          importance: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          category_slug: string;
          created_at?: string;
          event_slug: string;
          importance: string;
          sort_order: number;
          updated_at?: string;
        };
        Update: {
          category_slug?: string;
          created_at?: string;
          event_slug?: string;
          importance?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_categories_category_slug_fkey';
            columns: ['category_slug'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['slug'];
          },
          {
            foreignKeyName: 'event_categories_event_slug_fkey';
            columns: ['event_slug'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['slug'];
          },
        ];
      };
      events: {
        Row: {
          aliases: string[];
          created_at: string;
          host_side: string;
          name: NonNullable<Json>;
          slug: string;
          summary: Json | null;
          timing: Json | null;
          typical_guests_max: number | null;
          typical_guests_min: number | null;
          updated_at: string;
        };
        Insert: {
          aliases?: string[];
          created_at?: string;
          host_side: string;
          name: NonNullable<Json>;
          slug: string;
          summary?: Json | null;
          timing?: Json | null;
          typical_guests_max?: number | null;
          typical_guests_min?: number | null;
          updated_at?: string;
        };
        Update: {
          aliases?: string[];
          created_at?: string;
          host_side?: string;
          name?: NonNullable<Json>;
          slug?: string;
          summary?: Json | null;
          timing?: Json | null;
          typical_guests_max?: number | null;
          typical_guests_min?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          channel: string;
          created_at: string;
          details: NonNullable<Json>;
          event_date: string | null;
          event_slugs: string[];
          failure: string | null;
          guest_band: string;
          id: string;
          language: string;
          location: string;
          message: string;
          preferred_contact: string;
          provider_message_id: string | null;
          reply_answer: string | null;
          reply_answered_at: string | null;
          sender_email: string | null;
          sender_name: string | null;
          sender_phone: string | null;
          sent_at: string | null;
          start_time: string | null;
          status: string;
          user_id: string | null;
          vendor_id: string;
        };
        Insert: {
          channel: string;
          created_at?: string;
          details?: NonNullable<Json>;
          event_date?: string | null;
          event_slugs?: string[];
          failure?: string | null;
          guest_band: string;
          id?: string;
          language?: string;
          location: string;
          message: string;
          preferred_contact: string;
          provider_message_id?: string | null;
          reply_answer?: string | null;
          reply_answered_at?: string | null;
          sender_email?: string | null;
          sender_name?: string | null;
          sender_phone?: string | null;
          sent_at?: string | null;
          start_time?: string | null;
          status?: string;
          user_id?: string | null;
          vendor_id: string;
        };
        Update: {
          channel?: string;
          created_at?: string;
          details?: NonNullable<Json>;
          event_date?: string | null;
          event_slugs?: string[];
          failure?: string | null;
          guest_band?: string;
          id?: string;
          language?: string;
          location?: string;
          message?: string;
          preferred_contact?: string;
          provider_message_id?: string | null;
          reply_answer?: string | null;
          reply_answered_at?: string | null;
          sender_email?: string | null;
          sender_name?: string | null;
          sender_phone?: string | null;
          sent_at?: string | null;
          start_time?: string | null;
          status?: string;
          user_id?: string | null;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'inquiries_vendor_id_fkey';
            columns: ['vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          adult_confirmed_at: string;
          city: string;
          created_at: string;
          full_name: string;
          id: string;
          phone: string;
          updated_at: string;
        };
        Insert: {
          adult_confirmed_at?: string;
          city: string;
          created_at?: string;
          full_name: string;
          id: string;
          phone: string;
          updated_at?: string;
        };
        Update: {
          adult_confirmed_at?: string;
          city?: string;
          created_at?: string;
          full_name?: string;
          id?: string;
          phone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_vendors: {
        Row: {
          created_at: string;
          event_slug: string | null;
          id: string;
          user_id: string;
          vendor_id: string;
        };
        Insert: {
          created_at?: string;
          event_slug?: string | null;
          id?: string;
          user_id?: string;
          vendor_id: string;
        };
        Update: {
          created_at?: string;
          event_slug?: string | null;
          id?: string;
          user_id?: string;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_vendors_event_slug_fkey';
            columns: ['event_slug'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['slug'];
          },
          {
            foreignKeyName: 'saved_vendors_vendor_id_fkey';
            columns: ['vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      vendor_categories: {
        Row: {
          category_slug: string;
          created_at: string;
          position: number;
          updated_at: string;
          vendor_id: string;
        };
        Insert: {
          category_slug: string;
          created_at?: string;
          position: number;
          updated_at?: string;
          vendor_id: string;
        };
        Update: {
          category_slug?: string;
          created_at?: string;
          position?: number;
          updated_at?: string;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vendor_categories_category_slug_fkey';
            columns: ['category_slug'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['slug'];
          },
          {
            foreignKeyName: 'vendor_categories_vendor_id_fkey';
            columns: ['vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      vendor_events: {
        Row: {
          created_at: string;
          event_slug: string;
          updated_at: string;
          vendor_id: string;
        };
        Insert: {
          created_at?: string;
          event_slug: string;
          updated_at?: string;
          vendor_id: string;
        };
        Update: {
          created_at?: string;
          event_slug?: string;
          updated_at?: string;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vendor_events_event_slug_fkey';
            columns: ['event_slug'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['slug'];
          },
          {
            foreignKeyName: 'vendor_events_vendor_id_fkey';
            columns: ['vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      vendor_leads: {
        Row: {
          business_name: string;
          category: string | null;
          city: string;
          claimed_vendor_id: string | null;
          contact_name: string;
          created_at: string;
          id: string;
          instagram_handle: string | null;
          kind: string;
          language: string;
          note: string | null;
          phone: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          business_name: string;
          category?: string | null;
          city: string;
          claimed_vendor_id?: string | null;
          contact_name: string;
          created_at?: string;
          id?: string;
          instagram_handle?: string | null;
          kind?: string;
          language?: string;
          note?: string | null;
          phone: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          business_name?: string;
          category?: string | null;
          city?: string;
          claimed_vendor_id?: string | null;
          contact_name?: string;
          created_at?: string;
          id?: string;
          instagram_handle?: string | null;
          kind?: string;
          language?: string;
          note?: string | null;
          phone?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vendor_leads_claimed_vendor_id_fkey';
            columns: ['claimed_vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      vendor_links: {
        Row: {
          confirmed_by_both: boolean | null;
          confirmed_by_vendor: boolean;
          confirmed_by_venue: boolean;
          created_at: string;
          id: string;
          kind: string;
          updated_at: string;
          vendor_id: string;
          venue_vendor_id: string;
        };
        Insert: {
          confirmed_by_both?: never;
          confirmed_by_vendor?: boolean;
          confirmed_by_venue?: boolean;
          created_at?: string;
          id?: string;
          kind: string;
          updated_at?: string;
          vendor_id: string;
          venue_vendor_id: string;
        };
        Update: {
          confirmed_by_both?: never;
          confirmed_by_vendor?: boolean;
          confirmed_by_venue?: boolean;
          created_at?: string;
          id?: string;
          kind?: string;
          updated_at?: string;
          vendor_id?: string;
          venue_vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vendor_links_vendor_id_fkey';
            columns: ['vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'vendor_links_venue_vendor_id_fkey';
            columns: ['venue_vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      vendor_media: {
        Row: {
          blurhash: string | null;
          created_at: string;
          credit_text: string | null;
          credit_vendor_id: string | null;
          event_slug: string | null;
          height: number;
          id: string;
          is_cover: boolean;
          kind: string;
          sort_order: number;
          storage_path: string;
          updated_at: string;
          vendor_id: string;
          venue_vendor_id: string | null;
          width: number;
        };
        Insert: {
          blurhash?: string | null;
          created_at?: string;
          credit_text?: string | null;
          credit_vendor_id?: string | null;
          event_slug?: string | null;
          height: number;
          id?: string;
          is_cover?: boolean;
          kind?: string;
          sort_order?: number;
          storage_path: string;
          updated_at?: string;
          vendor_id: string;
          venue_vendor_id?: string | null;
          width: number;
        };
        Update: {
          blurhash?: string | null;
          created_at?: string;
          credit_text?: string | null;
          credit_vendor_id?: string | null;
          event_slug?: string | null;
          height?: number;
          id?: string;
          is_cover?: boolean;
          kind?: string;
          sort_order?: number;
          storage_path?: string;
          updated_at?: string;
          vendor_id?: string;
          venue_vendor_id?: string | null;
          width?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'vendor_media_credit_vendor_id_fkey';
            columns: ['credit_vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'vendor_media_event_slug_fkey';
            columns: ['event_slug'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['slug'];
          },
          {
            foreignKeyName: 'vendor_media_vendor_id_fkey';
            columns: ['vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'vendor_media_venue_vendor_id_fkey';
            columns: ['venue_vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      vendor_private: {
        Row: {
          checks_email: boolean | null;
          created_at: string;
          email: string | null;
          exact_location: unknown;
          notes: string | null;
          owner_name: string | null;
          street_address: string | null;
          updated_at: string;
          vendor_id: string;
        };
        Insert: {
          checks_email?: boolean | null;
          created_at?: string;
          email?: string | null;
          exact_location?: unknown;
          notes?: string | null;
          owner_name?: string | null;
          street_address?: string | null;
          updated_at?: string;
          vendor_id: string;
        };
        Update: {
          checks_email?: boolean | null;
          created_at?: string;
          email?: string | null;
          exact_location?: unknown;
          notes?: string | null;
          owner_name?: string | null;
          street_address?: string | null;
          updated_at?: string;
          vendor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vendor_private_vendor_id_fkey';
            columns: ['vendor_id'];
            isOneToOne: true;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      vendors: {
        Row: {
          address_line: string | null;
          address_visibility: string;
          bio: string | null;
          bio_pa: string | null;
          call_phone: string | null;
          city: string;
          created_at: string;
          details: NonNullable<Json>;
          founding_number: number | null;
          id: string;
          instagram_handle: string | null;
          is_sample: boolean;
          languages: string[];
          last_verified_at: string | null;
          location: unknown;
          name: string;
          name_pa: string | null;
          office_hours: string | null;
          preferred_contact: string | null;
          price_display: string;
          price_from: number | null;
          price_note: string | null;
          price_to: number | null;
          price_unit: string | null;
          service_radius_miles: number;
          slug: string;
          source: string;
          status: string;
          tagline: string | null;
          tagline_pa: string | null;
          team_size: number | null;
          text_phone: string | null;
          travel_note: string | null;
          updated_at: string;
          website_url: string | null;
          whatsapp_phone: string | null;
          will_travel: boolean;
          years_in_business: number | null;
        };
        Insert: {
          address_line?: string | null;
          address_visibility?: string;
          bio?: string | null;
          bio_pa?: string | null;
          call_phone?: string | null;
          city: string;
          created_at?: string;
          details?: NonNullable<Json>;
          founding_number?: number | null;
          id?: string;
          instagram_handle?: string | null;
          is_sample?: boolean;
          languages?: string[];
          last_verified_at?: string | null;
          location: unknown;
          name: string;
          name_pa?: string | null;
          office_hours?: string | null;
          preferred_contact?: string | null;
          price_display?: string;
          price_from?: number | null;
          price_note?: string | null;
          price_to?: number | null;
          price_unit?: string | null;
          service_radius_miles?: number;
          slug: string;
          source?: string;
          status?: string;
          tagline?: string | null;
          tagline_pa?: string | null;
          team_size?: number | null;
          text_phone?: string | null;
          travel_note?: string | null;
          updated_at?: string;
          website_url?: string | null;
          whatsapp_phone?: string | null;
          will_travel?: boolean;
          years_in_business?: number | null;
        };
        Update: {
          address_line?: string | null;
          address_visibility?: string;
          bio?: string | null;
          bio_pa?: string | null;
          call_phone?: string | null;
          city?: string;
          created_at?: string;
          details?: NonNullable<Json>;
          founding_number?: number | null;
          id?: string;
          instagram_handle?: string | null;
          is_sample?: boolean;
          languages?: string[];
          last_verified_at?: string | null;
          location?: unknown;
          name?: string;
          name_pa?: string | null;
          office_hours?: string | null;
          preferred_contact?: string | null;
          price_display?: string;
          price_from?: number | null;
          price_note?: string | null;
          price_to?: number | null;
          price_unit?: string | null;
          service_radius_miles?: number;
          slug?: string;
          source?: string;
          status?: string;
          tagline?: string | null;
          tagline_pa?: string | null;
          team_size?: number | null;
          text_phone?: string | null;
          travel_note?: string | null;
          updated_at?: string;
          website_url?: string | null;
          whatsapp_phone?: string | null;
          will_travel?: boolean;
          years_in_business?: number | null;
        };
        Relationships: [];
      };
      zip_codes: {
        Row: {
          latitude: number;
          location: unknown;
          longitude: number;
          zip: string;
        };
        Insert: {
          latitude: number;
          location?: never;
          longitude: number;
          zip: string;
        };
        Update: {
          latitude?: number;
          location?: never;
          longitude?: number;
          zip?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_inquiry: {
        Args: {
          p_details: Json;
          p_event_date: string;
          p_event_slugs: string[];
          p_guest_band: string;
          p_language: string;
          p_location: string;
          p_message: string;
          p_preferred_contact: string;
          p_send_again?: boolean;
          p_sender_email: string;
          p_sender_name: string;
          p_sender_phone: string;
          p_start_time: string;
          p_user_id: string;
          p_vendor_id: string;
        };
        Returns: Json;
      };
      inquiry_emails_left_today: { Args: Record<PropertyKey, never>; Returns: number };
      search_vendors: {
        Args: {
          category_slug?: string;
          event_slug?: string;
          include_travelers?: boolean;
          lat?: number;
          lng?: number;
          max_miles?: number;
          query?: string;
          result_limit?: number;
          result_offset?: number;
        };
        Returns: {
          city: string;
          cover_path: string;
          distance_miles: number;
          founding_number: number;
          id: string;
          latitude: number;
          longitude: number;
          name: string;
          name_pa: string;
          price_display: string;
          price_from: number;
          price_to: number;
          price_unit: string;
          primary_category_name: Json;
          primary_category_slug: string;
          slug: string;
          within_search_radius: boolean;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
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
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
