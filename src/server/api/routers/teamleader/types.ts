import type { PhaseId } from "~/lib/types";

export interface Tokens {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export interface Deal {
  id: string;
  title: string;
  summary: string | null;
  reference: string;
  status: string;
  lead: {
    customer: {
      type: string;
      id: string;
    };
    contact_person: {
      type: string;
      id: string;
    } | null;
  };
  weighted_value: {
    amount: number;
    currency: string;
  };
  purchase_order_number: string | null;
  estimated_value: {
    amount: number;
    currency: string;
  };
  estimated_closing_date: string | null;
  estimated_probability: number | null;
  current_phase: {
    type: string;
    id: PhaseId;
  };
  responsible_user: {
    type: string;
    id: string;
  };
  closed_at: string | null;
  source: {
    type: string;
    id: string;
  } | null;
  created_at: string;
  updated_at: string;
  lost_reason: {
    reason: {
      type: string;
      id: string;
    };
    remark: string | null;
  } | null;
  pipeline: {
    type: string;
    id: string;
  };
  department: {
    type: string;
    id: string;
  };
  web_url: string;
}

export interface DealInfo {
  data: {
    id: string;
    title: string;
    summary: string | null;
    reference: string;
    status: string;
    lead: {
      customer: {
        type: string;
        id: string;
      };
      contact_person: {
        type: string;
        id: string;
      } | null;
    };
    weighted_value: {
      amount: number;
      currency: string;
    };
    purchase_order_number: string | null;
    estimated_value: {
      amount: number;
      currency: string;
    };
    estimated_closing_date: string | null;
    estimated_probability: number | null;
    current_phase: {
      type: string;
      id: string;
    };
    responsible_user: {
      type: string;
      id: string;
    };
    closed_at: string | null;
    source: {
      type: string;
      id: string;
    } | null;
    created_at: string;
    updated_at: string;
    lost_reason: {
      reason: {
        type: string;
        id: string;
      };
      remark: string | null;
    } | null;
    pipeline: {
      type: string;
      id: string;
    };
    department: {
      type: string;
      id: string;
    };
    web_url: string;
    custom_fields: {
      definition: {
        type: string;
        id: string;
      };
      value: string | null;
    }[];
    phase_history: {
      phase: {
        type: string;
        id: string;
      };
      started_at: string;
      started_by: {
        type: string;
        id: string;
      };
    }[];
  };
  included: {
    customFieldDefinition: {
      id: string;
      context: string;
      type: string;
      label: string;
      group: string | null;
      required: boolean;
      configuration: {
        options: {
          id: string;
          value: string;
        }[];
        extra_option_allowed: boolean;
        default_value: string | null;
      } | null;
    }[];
  };
}

export interface User {
  id: string;
  account: {
    type: string;
    id: string;
  };
  first_name: string;
  last_name: string;
  email: string;
  language: string;
  telephones: string[];
  function: string | null;
  status: string;
  avatar_url: string | null;
  teams:
    | {
        type: string;
        id: string;
      }[]
    | null;
}

export interface Company {
  id: string;
  name: string;
  status: string;
  business_type: {
    type: string;
    id: string;
  } | null;
  vat_number: string | null;
  national_identification_number: string | null;
  emails:
    | {
        type: string;
        email: string;
      }[]
    | null;
  telephones:
    | {
        type: string;
        number: string;
      }[]
    | null;
  website: string | null;
  iban: string | null;
  bic: string | null;
  activity_code: string | null;
  language: string;
  payment_term: string | null;
  preferred_currency: string | null;
  invoicing_preferences: {
    electronic_invoicing_address: string | null;
  } | null;
  added_at: string;
  updated_at: string;
  web_url: string;
  primary_address: {
    line_1: string | null;
    postal_code: string | null;
    city: string | null;
    country: string;
    area_level_two: string | null;
  } | null;
  responsible_user: {
    type: string;
    id: string;
  } | null;
  tags: string[];
}

export interface Phase {
  id: string;
  name: string;
  actions: [];
  status: string;
  requires_attention_after: {
    amount: number;
    unit: string;
  };
  probability: number;
}

export interface dataObject {
  data: Deal[];
  included: {
    company: Company[];
    user: User[];
    dealPhase: Phase[];
  };
}

export interface SimplifiedDeal {
  id: string;
  title: string;
  created_at: string;
  estimated_closing_date: string;
  estimated_probability: number | null;
  updated_at: string;
  deal_phase: {
    id: PhaseId;
    name: string;
  };
  phase_history: {
    phase: {
      type: string;
      id: PhaseId;
    };
    started_at: string;
    started_by: {
      type: string;
      id: string;
    };
  }[];
  company: {
    id: string;
    name: string;
    logo_url: string | null;
    primary_address: {
      line_1: string | null;
      postal_code: string | null;
      city: string | null;
      country: string;
      area_level_two: string | null;
    } | null;
    email: string | null;
  };
  PM: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  custom_fields: {
    definition: {
      type: string;
      id: string;
    };
    value: string | null;
  }[];
}

export type SimplifiedDealArray = SimplifiedDeal[];

export interface DealPhaseResponse {
  data: {
    id: string;
    name: string;
    actions: [];
    status: string;
    requires_attention_after: {
      amount: number;
      unit: string;
    };
    probablity: number;
  }[];
}

export interface EditDealFieldsResult {
  deal: DealInfo; // replace DealType with the actual type of `deal`
  shouldCreate: boolean;
}
