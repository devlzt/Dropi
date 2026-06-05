export type ChargeStatus = "pending" | "paid" | "overdue" | "canceled";
export type ClientStatus = "active" | "inactive";
export type MessageTone = "educado" | "amigavel" | "firme" | "ultima_tentativa";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
};

export type Organization = {
  id: string;
  owner_id: string;
  name: string;
  whatsapp: string | null;
  pix_key: string | null;
  responsible_name: string | null;
  created_at: string;
};

export type Client = {
  id: string;
  organization_id: string;
  name: string;
  phone: string;
  email: string | null;
  document: string | null;
  notes: string | null;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
};

export type Charge = {
  id: string;
  organization_id: string;
  client_id: string;
  description: string;
  amount: number;
  due_date: string;
  status: ChargeStatus;
  paid_at: string | null;
  pix_copy_paste: string | null;
  pix_qr_code_url: string | null;
  payment_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ChargeWithClient = Charge & {
  clients: Client | null;
};

export type ChargeEventType =
  | "payment_registered"
  | "message_generated"
  | "message_copied"
  | "whatsapp_opened"
  | "whatsapp_sent"
  | "whatsapp_failed"
  | "pix_created"
  | "webhook_payment_confirmed";

export type ChargeEvent = {
  id: string;
  organization_id: string;
  charge_id: string;
  client_id: string;
  type: ChargeEventType;
  message: string | null;
  created_at: string;
};

export type MessageTemplate = {
  id: string;
  organization_id: string;
  name: string;
  tone: MessageTone;
  content: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id">;
        Update: Partial<Profile>;
        Relationships: [];
      };
      organizations: {
        Row: Organization;
        Insert: Partial<Organization> & Pick<Organization, "owner_id" | "name">;
        Update: Partial<Organization>;
        Relationships: [];
      };
      clients: {
        Row: Client;
        Insert: Omit<Partial<Client>, "id" | "created_at" | "updated_at"> & Pick<Client, "organization_id" | "name" | "phone">;
        Update: Partial<Client>;
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      charges: {
        Row: Charge;
        Insert: Omit<Partial<Charge>, "id" | "created_at" | "updated_at"> & Pick<Charge, "organization_id" | "client_id" | "description" | "amount" | "due_date">;
        Update: Partial<Charge>;
        Relationships: [
          {
            foreignKeyName: "charges_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charges_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      charge_events: {
        Row: ChargeEvent;
        Insert: Omit<Partial<ChargeEvent>, "id" | "created_at"> & Pick<ChargeEvent, "organization_id" | "charge_id" | "client_id" | "type">;
        Update: Partial<ChargeEvent>;
        Relationships: [
          {
            foreignKeyName: "charge_events_charge_id_fkey";
            columns: ["charge_id"];
            isOneToOne: false;
            referencedRelation: "charges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charge_events_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "charge_events_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      message_templates: {
        Row: MessageTemplate;
        Insert: Omit<Partial<MessageTemplate>, "id" | "created_at"> & Pick<MessageTemplate, "organization_id" | "name" | "tone" | "content">;
        Update: Partial<MessageTemplate>;
        Relationships: [
          {
            foreignKeyName: "message_templates_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      ensure_user_organization: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
