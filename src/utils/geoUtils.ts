import { DeliveryZone, LocationCoordinates } from '../types';

/**
 * Calculates distance in kilometers between two coordinates using the Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

export interface ZoneMatchResult {
  zone: DeliveryZone;
  distanceKm: number;
  isWithinZone: boolean;
  radiusKm: number;
  distanceToBoundaryKm: number;
}

/**
 * Finds the delivery zone that encompasses the given coordinates,
 * or the closest zone if outside service area.
 */
export function findMatchingZone(
  lat: number,
  lng: number,
  zones: DeliveryZone[]
): ZoneMatchResult {
  const activeZones = zones.filter((z) => z.isActive);
  const targetZones = activeZones.length > 0 ? activeZones : zones;

  if (targetZones.length === 0) {
    const fallbackZone: DeliveryZone = {
      id: 'zone-default',
      name: 'Bengaluru Metro Hub',
      city: 'Bengaluru',
      center: { lat, lng },
      radiusKm: 10,
      baseDeliveryFee: 35,
      perKmFee: 10,
      minOrderValue: 149,
      isActive: true,
    };
    return {
      zone: fallbackZone,
      distanceKm: 0,
      isWithinZone: true,
      radiusKm: 10,
      distanceToBoundaryKm: 0,
    };
  }

  // Calculate distance to each zone center
  const calculated = targetZones.map((zone) => {
    const distanceKm = calculateDistanceKm(lat, lng, zone.center.lat, zone.center.lng);
    const isWithinZone = distanceKm <= zone.radiusKm;
    const distanceToBoundaryKm = Math.max(0, distanceKm - zone.radiusKm);
    return {
      zone,
      distanceKm,
      isWithinZone,
      radiusKm: zone.radiusKm,
      distanceToBoundaryKm,
    };
  });

  // Prefer zones where point is inside
  const insideZones = calculated.filter((c) => c.isWithinZone);
  if (insideZones.length > 0) {
    insideZones.sort((a, b) => a.distanceKm - b.distanceKm);
    return insideZones[0];
  }

  // Otherwise, find the closest zone
  calculated.sort((a, b) => a.distanceKm - b.distanceKm);
  return calculated[0];
}

export interface GeocodedAddressResult {
  flat: string;
  area: string;
  landmark: string;
  city: string;
  pincode: string;
  fullAddress: string;
  source: 'google' | 'osm' | 'local_gis';
}

/**
 * Known landmark anchors in Bengaluru for instant fallback reverse geocoding
 */
const KNOWN_BENGALURU_HUBS = [
  {
    name: 'Koramangala 4th Block',
    road: '80 Feet Road, 4th Block',
    landmark: 'Near Sony World Signal / Maharaja Signal',
    area: 'Koramangala',
    pincode: '560034',
    lat: 12.9352,
    lng: 77.6245,
  },
  {
    name: 'Indiranagar 100 Feet Road',
    road: '100 Feet Road, HAL 2nd Stage',
    landmark: 'Near Indiranagar Metro Station',
    area: 'Indiranagar',
    pincode: '560038',
    lat: 12.9716,
    lng: 77.6412,
  },
  {
    name: 'HSR Layout Sector 1',
    road: '27th Main Road, Sector 1',
    landmark: 'Near Agara Lake / HSR BDA Complex',
    area: 'HSR Layout',
    pincode: '560102',
    lat: 12.9116,
    lng: 77.6473,
  },
  {
    name: 'Jayanagar 4th Block',
    road: '11th Main Road, 4th Block',
    landmark: 'Near Jayanagar Shopping Complex',
    area: 'Jayanagar',
    pincode: '560011',
    lat: 12.9255,
    lng: 77.5833,
  },
  {
    name: 'Marathahalli - Outer Ring Road',
    road: 'Marathahalli Bridge, ORR',
    landmark: 'Near Prestige Tech Park / Innovative Multiplex',
    area: 'Marathahalli',
    pincode: '560037',
    lat: 12.9388,
    lng: 77.6963,
  },
  {
    name: 'Whitefield Tech Corridor',
    road: 'ITPB Main Road, EPIP Zone',
    landmark: 'Near Ascendas Park Square Mall',
    area: 'Whitefield',
    pincode: '560066',
    lat: 12.9866,
    lng: 77.7382,
  },
  {
    name: 'Central Business District',
    road: 'MG Road / Brigade Road Junction',
    landmark: 'Near Trinity Metro Station',
    area: 'CBD MG Road',
    pincode: '560001',
    lat: 12.9756,
    lng: 77.6066,
  },
];

/**
 * Reverse geocodes coordinates into a structured street address and area.
 * 1. Checks Google Maps Geocoding API if key provided
 * 2. Falls back to OpenStreetMap Nominatim
 * 3. Falls back to smart high-precision local GIS mapping
 */
export async function reverseGeocodeLocation(
  lat: number,
  lng: number,
  googleMapsApiKey?: string
): Promise<GeocodedAddressResult> {
  // 1. Try Google Maps Geocoding API if key is present and valid
  if (googleMapsApiKey && !googleMapsApiKey.includes('DEMO') && googleMapsApiKey.length > 20) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const result = data.results[0];
          const fullAddress = result.formatted_address;
          let flat = '';
          let route = '';
          let sublocality = '';
          let locality = 'Bengaluru';
          let postalCode = '560034';

          result.address_components.forEach((c: { types: string[]; long_name: string }) => {
            if (c.types.includes('street_number')) flat = c.long_name;
            if (c.types.includes('route')) route = c.long_name;
            if (c.types.includes('sublocality_level_1') || c.types.includes('sublocality')) {
              sublocality = c.long_name;
            }
            if (c.types.includes('locality')) locality = c.long_name;
            if (c.types.includes('postal_code')) postalCode = c.long_name;
          });

          return {
            flat: flat ? `Door ${flat}, ${route || 'Main Road'}` : route || 'Street Pin',
            area: sublocality || locality,
            landmark: `Near ${sublocality || locality}`,
            city: locality,
            pincode: postalCode,
            fullAddress,
            source: 'google',
          };
        }
      }
    } catch {
      // Continue to OSM / local fallback
    }
  }

  // 2. Try OpenStreetMap Nominatim Reverse Geocoding with short timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const osmResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'LikartFoodDeliveryApp/1.0',
        },
      }
    );
    clearTimeout(timeoutId);

    if (osmResponse.ok) {
      const data = await osmResponse.json();
      if (data && data.address) {
        const addr = data.address;
        const road = addr.road || addr.pedestrian || addr.suburb || 'Main Road';
        const sub = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || 'Central';
        const city = addr.city || addr.town || addr.state_district || 'Bengaluru';
        const pincode = addr.postcode || '560034';
        const houseNumber = addr.house_number || '';

        const flat = houseNumber ? `Flat / Door ${houseNumber}, ${road}` : `Near ${road}`;
        const area = `${sub}, ${city}`;
        const fullAddress = data.display_name || `${flat}, ${area} - ${pincode}`;

        return {
          flat,
          area,
          landmark: `Near ${road}`,
          city,
          pincode,
          fullAddress,
          source: 'osm',
        };
      }
    }
  } catch {
    // Continue to local GIS anchor fallback
  }

  // 3. Fallback to closest local high-precision GIS point
  let closestHub = KNOWN_BENGALURU_HUBS[0];
  let minDistance = Number.MAX_VALUE;

  KNOWN_BENGALURU_HUBS.forEach((hub) => {
    const dist = calculateDistanceKm(lat, lng, hub.lat, hub.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestHub = hub;
    }
  });

  const roundedLat = lat.toFixed(4);
  const roundedLng = lng.toFixed(4);
  const flat = `GPS Coordinate Point (${roundedLat}, ${roundedLng})`;
  const area = `${closestHub.road}, ${closestHub.area}`;
  const fullAddress = `${closestHub.road}, ${closestHub.area}, Bengaluru - ${closestHub.pincode}`;

  return {
    flat,
    area,
    landmark: `${closestHub.landmark} (~${minDistance} km away)`,
    city: 'Bengaluru',
    pincode: closestHub.pincode,
    fullAddress,
    source: 'local_gis',
  };
}

/**
 * Trigger native high-precision GPS auto-fetching with timeout and fallback
 */
export function getAccurateCurrentPosition(): Promise<{
  lat: number;
  lng: number;
  accuracy: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
          accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 10,
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

export interface SearchLocationResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

/**
 * Searches places/locations using Google Geocoding API with fast Nominatim fallback
 */
export async function searchLocationsOnMap(
  query: string,
  apiKey?: string
): Promise<SearchLocationResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const results: SearchLocationResult[] = [];
  const queryLower = trimmed.toLowerCase();

  // 1. Check local GIS anchors for instant matching
  KNOWN_BENGALURU_HUBS.forEach((hub) => {
    if (
      hub.name.toLowerCase().includes(queryLower) ||
      hub.area.toLowerCase().includes(queryLower) ||
      hub.road.toLowerCase().includes(queryLower)
    ) {
      results.push({
        name: hub.name,
        address: `${hub.road}, ${hub.area}, Bengaluru - ${hub.pincode}`,
        lat: hub.lat,
        lng: hub.lng,
      });
    }
  });

  // 2. Try Google Maps Geocoding API if key available
  if (apiKey && !apiKey.includes('DEMO') && apiKey.length > 20) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(trimmed)}&key=${apiKey}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK' && Array.isArray(data.results)) {
          data.results.slice(0, 5).forEach((r: any) => {
            const lat = Number(r.geometry?.location?.lat?.toFixed(5));
            const lng = Number(r.geometry?.location?.lng?.toFixed(5));
            const name = r.address_components?.[0]?.long_name || r.formatted_address.split(',')[0];
            if (!results.some((existing) => calculateDistanceKm(existing.lat, existing.lng, lat, lng) < 0.2)) {
              results.push({
                name,
                address: r.formatted_address,
                lat,
                lng,
              });
            }
          });
          if (results.length > 0) return results;
        }
      }
    } catch {
      // Continue to OSM fallback
    }
  }

  // 3. OpenStreetMap Nominatim search
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const osmResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=5&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'LikartFoodDeliveryApp/1.0',
        },
      }
    );
    clearTimeout(timeoutId);

    if (osmResponse.ok) {
      const osmData = await osmResponse.json();
      if (Array.isArray(osmData)) {
        osmData.forEach((item: any) => {
          const lat = Number(parseFloat(item.lat).toFixed(5));
          const lng = Number(parseFloat(item.lon).toFixed(5));
          const name = item.name || item.display_name.split(',')[0];
          if (!results.some((existing) => calculateDistanceKm(existing.lat, existing.lng, lat, lng) < 0.2)) {
            results.push({
              name,
              address: item.display_name,
              lat,
              lng,
            });
          }
        });
      }
    }
  } catch {
    // Return what we have
  }

  return results;
}

/**
 * Parses latitude and longitude from raw strings or Google Maps URLs.
 * Handles formats like:
 * - "12.9352, 77.6245" or "12.9352,77.6245"
 * - "12.9352 77.6245"
 * - Google Maps URLs: "https://www.google.com/maps?q=12.9352,77.6245"
 * - Google Maps @ URLs: "https://www.google.com/maps/@12.9352,77.6245,17z"
 * - "lat: 12.9352, lng: 77.6245"
 */
export function parseCoordinatesFromString(input: string): { lat: number; lng: number } | null {
  if (!input) return null;
  const str = input.trim();

  // 1. Google Maps URL matching (?q=lat,lng or /@lat,lng or /place/lat,lng)
  const urlMatch =
    str.match(/[@?&]q=([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)/) ||
    str.match(/@([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)/) ||
    str.match(/place\/([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)/);
  if (urlMatch) {
    const lat = parseFloat(urlMatch[1]);
    const lng = parseFloat(urlMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) };
    }
  }

  // 2. Standard lat, lng or lat lng matching (e.g. 12.9352, 77.6245 or 12.9352 77.6245)
  const pairMatch = str.match(/([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)/);
  if (pairMatch) {
    const lat = parseFloat(pairMatch[1]);
    const lng = parseFloat(pairMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) };
    }
  }

  return null;
}
