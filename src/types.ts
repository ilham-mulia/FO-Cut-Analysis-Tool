export interface SIAEdge {
  rowNum: number;
  area: string;
  po_id: string;
  po_name: string;
  segment_po_id: string;
  sub_segment: string;
  sia: string;
  org_lat: number;
  org_lng: number;
  dst_lat: number;
  dst_lng: number;
  length_sia: number;
  merge_status?: string;
  source_segment_count?: number;
  source_segment_ids?: string;
  source_segment_parts?: string;
  virtual_connection_count?: number;
  max_virtual_gap_m?: number;
  length_rule_status?: string;
  geometry_wkt?: string;
  SIA_ORG?: string;
  SIA_DST?: string;
  min_lat: number;
  max_lat: number;
  min_lng: number;
  max_lng: number;
}

export interface ConfigArea {
  area: string;
  first_edge_row: number;
  last_edge_row: number;
}

export interface FOCutInput {
  id: string;
  area_hint: string;
  cut_lat: number | null;
  cut_lng: number | null;
  tolerance_m: number | null; // Defaults to 30
}

export interface FOCutResult {
  Nearest_SIA: string;
  Nearest_Distance_m: number;
  Match_Status: string;
  Matched_Area: string;
  PO_ID: string;
  PO_Name: string;
  Segment_PO_ID: string;
  Sub_Segment: string;
  length_SIA: number;
  SIA_ORG: string; // the sia string can be mapped if needed, standard excel extracts it, but formula just returns empty since SIA_ORG / SIA_DST were part of raw data. Let's keep it if possible.
  SIA_DST: string;
  within_count: number;
  second_sia: string;
  second_distance: string | number;
}

export interface MasterData {
  config: ConfigArea[];
  siaEdges: SIAEdge[];
}
