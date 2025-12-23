import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaRoute, FaInfoCircle, FaHome, FaSpinner } from 'react-icons/fa';
import './MapView.css'; // New CSS file for map styles
import { addressToCoordinates, calculateGreatCircleDistance } from '../utils/geocode_with_distance';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const donorIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
  iconSize: [35, 35],
});

const charityIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447035.png',
  iconSize: [35, 35],
});

const MapUpdater = ({ center }) => {
  const map = useMap();

  React.useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
      map.invalidateSize();
    }
  }, [center, map]);

  return null;
};

const MapView = () => {
  const location = useLocation();
  const { donorLocation, charityLocation } = location.state || {};

  const [donorCoords, setDonorCoords] = useState(null);
  const [charityCoords, setCharityCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [showRoute, setShowRoute] = useState(true);
  const [center, setCenter] = useState([17.3850, 78.4867]); // Default center Hyderabad
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    const fetchCoordinates = async () => {
      setLoading(true);
      setError(null);
      try {
        const donorResult = donorLocation ? await addressToCoordinates(donorLocation) : null;
        const charityResult = charityLocation ? await addressToCoordinates(charityLocation) : null;

        if (!donorResult && !charityResult) {
          setError('Failed to geocode both locations. Please check the addresses.');
          setDonorCoords(null);
          setCharityCoords(null);
        } else if (!donorResult) {
          setError('Failed to geocode donor location. Please check the address.');
          setDonorCoords(null);
          setCharityCoords(charityResult);
        } else if (!charityResult) {
          setError('Failed to geocode charity location. Please check the address.');
          setDonorCoords(donorResult);
          setCharityCoords(null);
        } else {
          setDonorCoords(donorResult);
          setCharityCoords(charityResult);
        }

        if (donorResult && charityResult) {
          const dist = calculateGreatCircleDistance(donorResult, charityResult);
          setDistance(dist);
          setCenter([(donorResult[0] + charityResult[0]) / 2, (donorResult[1] + charityResult[1]) / 2]);
        } else if (donorResult) {
          setCenter(donorResult);
        } else if (charityResult) {
          setCenter(charityResult);
        }
      } catch (err) {
        setError('Error occurred during geocoding. Please try again.');
        setDonorCoords(null);
        setCharityCoords(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, [donorLocation, charityLocation]);

  const toggleRoute = () => {
    setShowRoute(!showRoute);
  };

  const centerMap = () => {
    if (donorCoords && charityCoords) {
      setCenter([(donorCoords[0] + charityCoords[0]) / 2, (donorCoords[1] + charityCoords[1]) / 2]);
    } else if (donorCoords) {
      setCenter(donorCoords);
    } else if (charityCoords) {
      setCenter(charityCoords);
    }
  };

  const viewDonor = () => {
    if (donorCoords) {
      setCenter(donorCoords);
    }
  };

  const viewCharity = () => {
    if (charityCoords) {
      setCenter(charityCoords);
    }
  };

  if (loading) {
    return (
      <div className="map-container loading">
        <FaSpinner className="spinner" /> Loading map...
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-container error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div className="map-header">
        <h2>Food Donation Location Map</h2>
        <p>Viewing the route between donor and charity locations</p>
      </div>

      <div className="map-controls" style={{ gap: '10px', flexWrap: 'wrap', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '8px', borderRadius: '8px', position: 'relative', zIndex: 1001 }}>
        <button onClick={toggleRoute} className="map-button" style={{ minWidth: '120px' }}>
          <FaRoute /> {showRoute ? 'Hide Route' : 'Show Route'}
        </button>
        <button onClick={centerMap} className="map-button" style={{ minWidth: '120px' }}>
          <FaInfoCircle /> Center Map
        </button>
        <button onClick={viewDonor} className="map-button" style={{ minWidth: '140px' }}>
          <FaHome /> View Donor
        </button>
        <button onClick={viewCharity} className="map-button" style={{ minWidth: '140px' }}>
          🏠 View Charity
        </button>
        {distance && (
          <div className="distance-badge" style={{ whiteSpace: 'nowrap' }}>
            Distance: {distance} km
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '500px', width: '100%' }}
        className="map-view"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapUpdater center={center} />

        {/* Donor Marker */}
        {donorCoords && (
          <Marker position={donorCoords} icon={donorIcon}>
            <Popup>
              <strong>Donor Location</strong><br />
              {donorLocation || "Food available for pickup"}
            </Popup>
            <Tooltip permanent direction="top">🍕 Donor</Tooltip>
          </Marker>
        )}

        {/* Charity Marker */}
        {charityCoords && (
          <Marker position={charityCoords} icon={charityIcon}>
            <Popup>
              <strong>Charity Location</strong><br />
              {charityLocation || "Food distribution point"}
            </Popup>
            <Tooltip permanent direction="top">🏠 Charity</Tooltip>
          </Marker>
        )}

        {/* Route Line */}
        {showRoute && donorCoords && charityCoords && (
          <Polyline
            positions={[donorCoords, charityCoords]}
            color="#3b82f6"
            weight={3}
            dashArray="5, 5"
          >
            <Tooltip sticky>
              Delivery Route (straight line): {distance} km
            </Tooltip>
          </Polyline>
        )}
      </MapContainer>

      <div className="location-info">
        <div className="location-card">
          <h4><FaHome /> Donor Location</h4>
          <p>{donorLocation || "Not specified"}</p>
        </div>
        <div className="location-card">
          <h4>🏠 Charity Location</h4>
          <p>{charityLocation || "Not specified"}</p>
        </div>
      </div>
    </div>
  );
};

export default MapView;
