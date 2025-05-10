import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader } from 'lucide-react';

const LocationMap = ({ address, height = 300 }) => {
    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const markerRef = useRef(null);

    // Load Google Maps API
    useEffect(() => {
        const loadGoogleMapsScript = () => {
            if (window.google && window.google.maps) {
                setMapLoaded(true);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                console.log('Google Maps API loaded successfully');
                setMapLoaded(true);
                setIsLoading(false);
            };

            script.onerror = (error) => {
                console.error('Failed to load Google Maps API:', error);
                setError('Failed to load map. Please try refreshing the page.');
                setIsLoading(false);
            };

            document.head.appendChild(script);
        };

        loadGoogleMapsScript();
    }, []);

    // Initialize or update map when address changes
    useEffect(() => {
        if (!mapLoaded || !mapRef.current) return;

        // Check if we have valid address data
        const hasCoordinates =
            address?.coordinates &&
            address.coordinates.lat &&
            address.coordinates.lng;

        const hasAddressText =
            address && (address.street || address.city);

        if (!hasCoordinates && !hasAddressText) {
            // No valid address data to display
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            let location;

            if (hasCoordinates) {
                // Use exact coordinates if available
                location = {
                    lat: parseFloat(address.coordinates.lat),
                    lng: parseFloat(address.coordinates.lng)
                };
            } else {
                // Default to Oradea, Romania if no coordinates but we have address text
                location = { lat: 47.046821, lng: 21.918950 };
            }

            // Create or update the map
            if (!mapInstance) {
                // Create new map if none exists
                const map = new window.google.maps.Map(mapRef.current, {
                    center: location,
                    zoom: 15,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                    scrollwheel: false
                });

                setMapInstance(map);

                // Create marker
                markerRef.current = new window.google.maps.Marker({
                    position: location,
                    map,
                    animation: window.google.maps.Animation.DROP,
                    title: address.street || address.city || 'Your location'
                });

                // Optional: Add info window with address details
                if (address.street || address.city) {
                    const infoContent = `
                      <div style="padding: 10px;">
                        <h3 style="margin-top: 0; font-weight: 600; font-size: 14px;">Delivery Address</h3>
                        <p style="margin-bottom: 5px; font-size: 13px;">${address.street || ''}</p>
                        <p style="margin-bottom: 5px; font-size: 13px;">
                          ${address.city || ''} ${address.zipCode || ''}
                        </p>
                        <p style="margin-bottom: 0; font-size: 13px;">${address.country || ''}</p>
                      </div>
                    `;

                    const infoWindow = new window.google.maps.InfoWindow({
                        content: infoContent
                    });

                    markerRef.current.addListener('click', () => {
                        infoWindow.open(map, markerRef.current);
                    });

                    // Auto open the info window when the map loads
                    infoWindow.open(map, markerRef.current);
                }
            } else {
                // Update existing map
                mapInstance.setCenter(location);

                // Update marker position
                if (markerRef.current) {
                    markerRef.current.setPosition(location);
                } else {
                    // Create marker if it doesn't exist
                    markerRef.current = new window.google.maps.Marker({
                        position: location,
                        map: mapInstance,
                        animation: window.google.maps.Animation.DROP,
                        title: address.street || address.city || 'Your location'
                    });
                }
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Error initializing map:', error);
            setError('Error displaying map. Please try again.');
            setIsLoading(false);
        }
    }, [mapLoaded, address, mapInstance]);

    if (error) {
        return (
            <div
                className="w-full bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center p-4 text-red-600"
                style={{ height: `${height}px` }}
            >
                <MapPin size={32} className="mb-2" />
                <p>{error}</p>
            </div>
        );
    }

    if (isLoading && !mapInstance) {
        return (
            <div
                className="w-full border border-gray-200 rounded-lg flex flex-col items-center justify-center"
                style={{ height: `${height}px` }}
            >
                <Loader className="animate-spin mb-2" size={32} />
                <p className="text-gray-500">Loading map...</p>
            </div>
        );
    }

    if (!address || (!address.street && !address.city && (!address.coordinates || !address.coordinates.lat))) {
        return (
            <div
                className="w-full bg-yellow-50 border border-yellow-200 rounded-lg flex flex-col items-center justify-center p-4"
                style={{ height: `${height}px` }}
            >
                <MapPin size={32} className="mb-2 text-yellow-600" />
                <p className="text-yellow-600 text-center">
                    No address selected. Please provide an address to see the map.
                </p>
            </div>
        );
    }

    return (
        <div
            ref={mapRef}
            className="w-full h-full rounded-lg border border-gray-300 overflow-hidden"
            style={{ height: `${height}px` }}
        />
    );
};

export default LocationMap;