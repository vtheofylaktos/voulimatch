export type Vote = "ΝΑΙ" | "ΟΧΙ" | "ΠΑΡΩΝ" | "ΑΠΟΥΣΙΑ";

export interface Party {
  id: string; // unique slug, e.g. "nd"
  name: string; // full official name
  shortName: string; // short label, e.g. "ND"
}

export interface Issue {
  id: string; // unique slug, e.g. "paideia"
  title: string;
  description: string;
  source_url: string;
}

export interface EventItem {
  id: string; // unique id for the event
  issue_id: string; // references Issue.id
  title: string;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  source_url: string;
}

export interface Stance {
  party_id: string; // references Party.id
  event_id: string; // references EventItem.id
  vote: Vote;
  source_url: string; // source specific to the stance (can point to a party statement)
}

export interface DataBundle {
  parties: Party[];
  issues: Issue[];
  events: EventItem[];
  stances: Stance[];
}
