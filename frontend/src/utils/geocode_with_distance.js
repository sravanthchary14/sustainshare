import { OpenStreetMapProvider } from 'leaflet-geosearch';

const provider = new OpenStreetMapProvider();

export const addressToCoordinates = async (address) => {
  try {
    let searchQuery = address;

    if (!address || address.trim() === '' || address === "Your Location") {
      return [17.3850, 78.4867]; // Default Hyderabad coordinates
    }

    // Handle specific Indian location names more accurately
    const locationMappings = {
      'secundrabad': 'Secunderabad, Hyderabad, Telangana, India',
      'secunderabad': 'Secunderabad, Hyderabad, Telangana, India',
      'uppal': 'Uppal, Hyderabad, Telangana, India',
      'nagole': 'Nagole, Hyderabad, Telangana, India',
      'kukatpally': 'Kukatpally, Hyderabad, Telangana, India',
      'banjara hills': 'Banjara Hills, Hyderabad, Telangana, India',
      'jubilee hills': 'Jubilee Hills, Hyderabad, Telangana, India',
      'hitech city': 'Hi-Tech City, Hyderabad, Telangana, India',
      'gachibowli': 'Gachibowli, Hyderabad, Telangana, India'
    };

    // Check if the address matches any known locations
    const lowerAddress = address.toLowerCase().trim();
    if (locationMappings[lowerAddress]) {
      searchQuery = locationMappings[lowerAddress];
    } else if (!address.includes(',') && !address.includes('Hyderabad') && !address.includes('India')) {
      searchQuery = `${address}, Hyderabad, Telangana, India`;
    }

    console.log('Geocoding query:', searchQuery);

    const results = await provider.search({ query: searchQuery });

    if (results.length > 0) {
      // Filter out bus stops and other irrelevant results for major locations
      let bestResult = results[0];

      // For major locations, prefer results that don't contain "bus" or "stop"
      if (lowerAddress in locationMappings) {
        const filteredResults = results.filter(result =>
          !result.label.toLowerCase().includes('bus') &&
          !result.label.toLowerCase().includes('stop') &&
          !result.label.toLowerCase().includes('station')
        );
        if (filteredResults.length > 0) {
          bestResult = filteredResults[0];
        }
      }

      console.log('Selected result:', bestResult.label);
      return [bestResult.y, bestResult.x]; // [lat, lng]
    }

    // Try a more specific search for Indian locations
    const specificResults = await provider.search({ query: `${address}, Telangana, India` });
    if (specificResults.length > 0) {
      console.log('Specific result:', specificResults[0].label);
      return [specificResults[0].y, specificResults[0].x];
    }

    const broadResults = await provider.search({ query: `${address}, India` });
    if (broadResults.length > 0) {
      console.log('Broad result:', broadResults[0].label);
      return [broadResults[0].y, broadResults[0].x];
    }

    console.warn('No geocoding results found for:', address);
    return [17.3850, 78.4867]; // Default Hyderabad coordinates

  } catch (error) {
    console.error("Geocoding error for", address, ":", error);
    return [17.3850, 78.4867]; // Default Hyderabad coordinates
  }
};

// Haversine formula for great-circle distance between two points
export const calculateGreatCircleDistance = (coord1, coord2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const lat1 = coord1[0];
  const lon1 = coord1[1];
  const lat2 = coord2[0];
  const lon2 = coord2[1];

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance.toFixed(2); // km with 2 decimals
};
