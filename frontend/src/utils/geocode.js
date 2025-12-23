import { OpenStreetMapProvider } from 'leaflet-geosearch';

const provider = new OpenStreetMapProvider();

export const addressToCoordinates = async (address) => {
  try {
    // Handle common address formats and improve geocoding success
    let searchQuery = address;

    // If it's a generic location like "Your Location", use a default
    if (!address || address.trim() === '' || address === "Your Location") {
      return [17.3850, 78.4867]; // Default Hyderabad coordinates
    }

    // If it's a simple location name, try to make it more specific
    if (!address.includes(',') && !address.includes('Hyderabad')) {
      searchQuery = `${address}, Hyderabad, Telangana, India`;
    }

    console.log('Geocoding query:', searchQuery);

    const results = await provider.search({ query: searchQuery });

    if (results.length > 0) {
      const coords = [results[0].y, results[0].x]; // [lat, lng]
      console.log('Geocoding result:', coords);
      return coords;
    }

    // If no results, try a broader search
    const broadResults = await provider.search({ query: `${address}, India` });
    if (broadResults.length > 0) {
      const coords = [broadResults[0].y, broadResults[0].x];
      console.log('Broad geocoding result:', coords);
      return coords;
    }

    console.warn('No geocoding results found for:', address);
    return [17.3850, 78.4867]; // Default Hyderabad coordinates

  } catch (error) {
    console.error("Geocoding error for", address, ":", error);
    return [17.3850, 78.4867]; // Default Hyderabad coordinates
  }
};
