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
      culture_events: {
        Row: {
          created_at: string;
          culture_slug: string;
          event_slug: string;
          phase: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          culture_slug: string;
          event_slug: string;
          phase: string;
          sort_order: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          culture_slug?: string;
          event_slug?: string;
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
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
