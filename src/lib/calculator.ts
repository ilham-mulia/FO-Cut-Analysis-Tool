import { FOCutInput, FOCutResult, SIAEdge } from "../types";

export function calculateFOCut(input: FOCutInput, edges: SIAEdge[]): FOCutResult {
  const { area_hint, cut_lat, cut_lng, tolerance_m } = input;

  const lat_v = cut_lat;
  const lng_v = cut_lng;

  // Defaults and empty check
  if (lat_v === null || lat_v === undefined || lng_v === null || lng_v === undefined) {
    return getEmptyResult();
  }

  const tol_v = tolerance_m ?? 30; // Default tolerance is 30
  const area_v = (area_hint || "").trim();

  const earth_v = 6371000;
  const deg_v = Math.PI / 180;
  const buffer_deg = tol_v / 111320;

  const candidateMask = (edge: SIAEdge) => {
    // (((area_v="")+(area_rng=area_v))>0)*(lat_v>=min_lat_rng-buffer_deg)*(lat_v<=max_lat_rng+buffer_deg)*(lng_v>=min_lng_rng-buffer_deg)*(lng_v<=max_lng_rng+buffer_deg);
    if (area_v !== "" && edge.area !== area_v) {
      return false;
    }

    // Relaxed bounding box checking just in case bounds aren't perfectly formatted min/max
    const minLat = Math.min(edge.org_lat, edge.dst_lat);
    const maxLat = Math.max(edge.org_lat, edge.dst_lat);
    const minLng = Math.min(edge.org_lng, edge.dst_lng);
    const maxLng = Math.max(edge.org_lng, edge.dst_lng);

    if (lat_v < minLat - buffer_deg || lat_v > maxLat + buffer_deg) return false;
    if (lng_v < minLng - buffer_deg || lng_v > maxLng + buffer_deg) return false;

    return true;
  };

  const candidates = edges.filter(candidateMask);

  if (candidates.length === 0) {
    return getNoCandidateResult();
  }

  const lat_rad = lat_v * deg_v;
  const point_x = earth_v * lng_v * deg_v * Math.cos(lat_rad);
  const point_y = earth_v * lat_v * deg_v;

  // Calculate distance for each candidate
  const candidateDistances = candidates.map((edge) => {
    const edge_x_a = earth_v * edge.org_lng * deg_v * Math.cos(lat_rad);
    const edge_y_a = earth_v * edge.org_lat * deg_v;
    const edge_x_z = earth_v * edge.dst_lng * deg_v * Math.cos(lat_rad);
    const edge_y_z = earth_v * edge.dst_lat * deg_v;

    const delta_x = edge_x_z - edge_x_a;
    const delta_y = edge_y_z - edge_y_a;
    const segment_len_sq = delta_x * delta_x + delta_y * delta_y;

    let raw_t = 0;
    if (segment_len_sq > 0) {
      raw_t = ((point_x - edge_x_a) * delta_x + (point_y - edge_y_a) * delta_y) / segment_len_sq;
    }

    const clamped_t = raw_t < 0 ? 0 : raw_t > 1 ? 1 : raw_t;

    const edge_distance = Math.sqrt(
      Math.pow(point_x - (edge_x_a + clamped_t * delta_x), 2) +
      Math.pow(point_y - (edge_y_a + clamped_t * delta_y), 2)
    );

    return { edge, distance: edge_distance };
  });

  // Group by SIA to find the minimum distance per SIA
  const siaMap = new Map<string, { edge: SIAEdge; minDistance: number }>();

  for (const item of candidateDistances) {
    const sia = item.edge.sia;
    if (!siaMap.has(sia)) {
      siaMap.set(sia, { edge: item.edge, minDistance: item.distance });
    } else {
      const existing = siaMap.get(sia)!;
      if (item.distance < existing.minDistance) {
        siaMap.set(sia, { edge: item.edge, minDistance: item.distance });
      }
    }
  }

  // Convert map to array and sort by distance ascending
  const ranked = Array.from(siaMap.values()).map(v => ({
    sia: v.edge.sia,
    distance: v.minDistance,
    edge: v.edge
  })).sort((a, b) => a.distance - b.distance);

  if (ranked.length === 0) {
    return getNoCandidateResult();
  }

  const nearest = ranked[0];
  const nearest_sia = nearest.sia;
  const nearest_distance = nearest.distance;

  // Calculate within_count
  const within_count = ranked.filter(r => r.distance <= tol_v).length;

  const second_sia = ranked.length >= 2 ? ranked[1].sia : "";
  const second_distance = ranked.length >= 2 ? Math.round(ranked[1].distance * 100) / 100 : "";

  let match_status = "MATCHED";
  if (within_count === 0) match_status = "OUT_OF_TOLERANCE";
  else if (within_count > 1) match_status = "REVIEW_MULTIPLE";

  const roundedDistance = Math.round(nearest_distance * 100) / 100;
  
  return {
    Nearest_SIA: nearest_sia,
    Nearest_Distance_m: roundedDistance,
    Match_Status: match_status,
    Matched_Area: nearest.edge.area,
    PO_ID: nearest.edge.po_id,
    PO_Name: nearest.edge.po_name,
    Segment_PO_ID: nearest.edge.segment_po_id,
    Sub_Segment: nearest.edge.sub_segment,
    length_SIA: nearest.edge.length_sia,
    SIA_ORG: (nearest.edge as any).SIA_ORG || "", // Use if available
    SIA_DST: (nearest.edge as any).SIA_DST || "", // Use if available
    within_count,
    second_sia,
    second_distance
  };
}

function getEmptyResult(): FOCutResult {
  return {
    Nearest_SIA: "",
    Nearest_Distance_m: 0,
    Match_Status: "",
    Matched_Area: "",
    PO_ID: "",
    PO_Name: "",
    Segment_PO_ID: "",
    Sub_Segment: "",
    length_SIA: 0,
    SIA_ORG: "",
    SIA_DST: "",
    within_count: 0,
    second_sia: "",
    second_distance: ""
  };
}

function getNoCandidateResult(): FOCutResult {
  return {
    Nearest_SIA: "",
    Nearest_Distance_m: 0,
    Match_Status: "NO_CANDIDATE",
    Matched_Area: "",
    PO_ID: "",
    PO_Name: "",
    Segment_PO_ID: "",
    Sub_Segment: "",
    length_SIA: 0,
    SIA_ORG: "",
    SIA_DST: "",
    within_count: 0,
    second_sia: "",
    second_distance: ""
  };
}
