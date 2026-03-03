import { listings } from "../data/listings.js";
import { SERVICE_LOCALITIES } from "../config/serviceArea.js";
import { getDbPool, isMySqlEnabled } from "../config/database.js";

const serviceAreaKeys = new Set(SERVICE_LOCALITIES.map((locality) => locality.key));

export function getServiceArea() {
  return SERVICE_LOCALITIES;
}

function filterListingsInMemory(filters = {}) {
  const {
    q = "",
    area = "",
    maxRent,
    audience = "",
    maxDistanceKm
  } = filters;

  const normalizedQuery = q.trim().toLowerCase();
  const normalizedArea = area.trim().toLowerCase();
  const normalizedAudience = audience.trim().toLowerCase();

  return listings.filter((item) => {
    const isServiceable = serviceAreaKeys.has(item.area.toLowerCase());
    if (!isServiceable) {
      return false;
    }

    const queryMatch =
      normalizedQuery.length === 0 ||
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.type.toLowerCase().includes(normalizedQuery) ||
      item.area.toLowerCase().includes(normalizedQuery);

    const areaMatch =
      normalizedArea.length === 0 || item.area.toLowerCase() === normalizedArea;

    const rentMatch =
      Number.isNaN(Number(maxRent)) || maxRent === undefined
        ? true
        : item.rentInr <= Number(maxRent);

    const audienceMatch =
      normalizedAudience.length === 0
        ? true
        : item.suitableFor.some(
            (group) => group.toLowerCase() === normalizedAudience
          );

    const distanceMatch =
      Number.isNaN(Number(maxDistanceKm)) || maxDistanceKm === undefined
        ? true
        : item.distanceToCampusKm <= Number(maxDistanceKm);

    return (
      queryMatch &&
      areaMatch &&
      rentMatch &&
      audienceMatch &&
      distanceMatch
    );
  });
}

function normalizeArrayField(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

async function filterListingsFromMySql(filters = {}) {
  const {
    q = "",
    area = "",
    maxRent,
    audience = "",
    maxDistanceKm
  } = filters;

  const normalizedQuery = q.trim();
  const normalizedArea = area.trim().toLowerCase();
  const normalizedAudience = audience.trim();

  const db = getDbPool();

  const whereClauses = [
    `area_key IN (${Array.from(serviceAreaKeys).map(() => "?").join(",")})`
  ];
  const params = [...Array.from(serviceAreaKeys)];

  if (normalizedQuery.length > 0) {
    whereClauses.push("(title LIKE ? OR type LIKE ? OR area LIKE ?)");
    const likeValue = `%${normalizedQuery}%`;
    params.push(likeValue, likeValue, likeValue);
  }

  if (normalizedArea.length > 0) {
    whereClauses.push("area_key = ?");
    params.push(normalizedArea);
  }

  if (!Number.isNaN(Number(maxRent)) && maxRent !== undefined) {
    whereClauses.push("rent_inr <= ?");
    params.push(Number(maxRent));
  }

  if (normalizedAudience.length > 0) {
    whereClauses.push("JSON_CONTAINS(suitable_for_json, JSON_ARRAY(?))");
    params.push(normalizedAudience);
  }

  if (!Number.isNaN(Number(maxDistanceKm)) && maxDistanceKm !== undefined) {
    whereClauses.push("distance_to_campus_km <= ?");
    params.push(Number(maxDistanceKm));
  }

  const [rows] = await db.query(
    `
      SELECT
        id,
        title,
        area_key,
        area,
        district,
        state,
        rent_inr,
        distance_to_campus_km,
        type,
        suitable_for_json,
        amenities_json,
        contact
      FROM listings
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY rent_inr ASC
    `,
    params
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    areaKey: row.area_key,
    area: row.area,
    district: row.district,
    state: row.state,
    rentInr: row.rent_inr,
    distanceToCampusKm: row.distance_to_campus_km,
    type: row.type,
    suitableFor: normalizeArrayField(row.suitable_for_json),
    amenities: normalizeArrayField(row.amenities_json),
    contact: row.contact
  }));
}

export async function filterListings(filters = {}) {
  if (isMySqlEnabled()) {
    return filterListingsFromMySql(filters);
  }

  return filterListingsInMemory(filters);
}
