import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Check, Loader } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LocationSelector = ({ onSelectAddress, initialAddress, buttonClassName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [displayAddress, setDisplayAddress] = useState(''); // Address shown in the button
    const [tempDisplayAddress, setTempDisplayAddress] = useState(''); // Temporary address text shown in modal
    const [fullAddress, setFullAddress] = useState({
        street: '',
        city: '',
        zipCode: '',
        country: '',
        coordinates: {
            lat: null,
            lng: null
        }
    });

    const [tempAddress, setTempAddress] = useState({
        street: '',
        city: '',
        zipCode: '',
        country: '',
        coordinates: {
            lat: null,
            lng: null
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef(null);
    const autocompleteRef = useRef(null);
    const inputRef = useRef(null);
    const modalRef = useRef(null);
    const { user } = useAuthStore();

    // Reset tempAddress to match fullAddress when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempAddress({...fullAddress});
            setTempDisplayAddress(displayAddress);

            // Reset the input field to show the saved address
            if (inputRef.current) {
                inputRef.current.value = displayAddress !== 'My Address' ? displayAddress : '';
            }
        }
    }, [isOpen, fullAddress, displayAddress]);

    // Initialize with initialAddress when component mounts
    useEffect(() => {
        if (initialAddress) {
            if (typeof initialAddress === 'string') {
                setDisplayAddress(initialAddress);
                setTempDisplayAddress(initialAddress);
            } else if (typeof initialAddress === 'object') {
                // Handle full address object
                const { street, city, zipCode, country } = initialAddress;
                const formattedAddress = [street, city, zipCode, country].filter(Boolean).join(', ');
                setDisplayAddress(formattedAddress);
                setTempDisplayAddress(formattedAddress);
                setFullAddress(initialAddress);
                setTempAddress(initialAddress);
            }
        } else {
            setDisplayAddress('My Address');
            setTempDisplayAddress('My Address');
        }
    }, [initialAddress]);

    // Load Google Maps API
    useEffect(() => {
        const loadGoogleMapsScript = () => {
            if (window.google && window.google.maps) {
                setMapLoaded(true);
                return;
            }

            const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                setMapLoaded(true);
            };

            script.onerror = () => {
                console.error('Failed to load Google Maps API');
                toast.error('Failed to load maps. Please try again later.');
            };

            document.head.appendChild(script);
        };

        loadGoogleMapsScript();

        // We're removing the click-outside-to-close behavior completely
        // Now the modal will ONLY close when users click Cancel or X button
        // This ensures autocomplete selections won't cause the modal to close

    }, []);

    // Initialize map and autocomplete when modal opens
    useEffect(() => {
        if (isOpen && mapLoaded && mapRef.current) {
            // Default center on Europe if no coordinates
            const defaultCenter = fullAddress.coordinates.lat && fullAddress.coordinates.lng
                ? { lat: fullAddress.coordinates.lat, lng: fullAddress.coordinates.lng }
                : { lat: 47.04648, lng: 21.91895 }; // Default to Oradea, Romania

            // Initialize the map
            const map = new window.google.maps.Map(mapRef.current, {
                center: defaultCenter,
                zoom: 15,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });

            let currentMarker = null;

            // Add a marker if we have coordinates
            if (fullAddress.coordinates.lat && fullAddress.coordinates.lng) {
                currentMarker = new window.google.maps.Marker({
                    position: defaultCenter,
                    map,
                    animation: window.google.maps.Animation.DROP,
                });
            }

            map.addListener('click', (event) => {
                // Get coordinates from click
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();

                // Remove any existing marker
                if (currentMarker) {
                    currentMarker.setMap(null);
                }

                // Add a new marker at the clicked location
                currentMarker = new window.google.maps.Marker({
                    position: { lat, lng },
                    map: map,
                    animation: window.google.maps.Animation.DROP
                });

                // Use the Geocoding API to get address details
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        // Extract address components
                        let addressData = {
                            street: '',
                            city: '',
                            zipCode: '',
                            country: '',
                            coordinates: { lat, lng }
                        };

                        // Parse address components
                        for (const component of results[0].address_components) {
                            const type = component.types[0];

                            if (type === 'street_number') {
                                addressData.street = component.long_name + ' ';
                            } else if (type === 'route') {
                                addressData.street += component.long_name;
                            } else if (type === 'locality' || type === 'administrative_area_level_2') {
                                addressData.city = component.long_name;
                            } else if (type === 'postal_code') {
                                addressData.zipCode = component.long_name;
                            } else if (type === 'country') {
                                addressData.country = component.long_name;
                            }
                        }

                        // Set address in input field if it exists
                        if (inputRef.current) {
                            inputRef.current.value = results[0].formatted_address;
                        }

                        // Update temporary address but not the display address
                        setTempDisplayAddress(results[0].formatted_address);
                        setTempAddress(addressData);
                    } else {
                        console.error('Geocoding failed due to: ' + status);
                        toast.error('Failed to get address details. Please try again.');
                    }
                });
            });

            // Initialize the autocomplete
            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['address'],
                fields: ['address_components', 'formatted_address', 'geometry'],
            });

            // Set bias to current map viewport
            autocomplete.bindTo('bounds', map);

            // Handle place selection
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();

                if (!place.geometry || !place.geometry.location) {
                    return;
                }

                // Update map
                map.setCenter(place.geometry.location);
                map.setZoom(17);

                // Remove existing marker if any
                if (currentMarker) {
                    currentMarker.setMap(null);
                }

                // Add marker
                currentMarker = new window.google.maps.Marker({
                    position: place.geometry.location,
                    map,
                    animation: window.google.maps.Animation.DROP,
                });

                // Extract address components
                let street = '';
                let city = '';
                let zipCode = '';
                let country = '';

                for (const component of place.address_components) {
                    const componentType = component.types[0];

                    switch (componentType) {
                        case 'street_number':
                            street = `${component.long_name} ${street}`;
                            break;
                        case 'route':
                            street = `${street} ${component.long_name}`.trim();
                            break;
                        case 'locality':
                            city = component.long_name;
                            break;
                        case 'postal_code':
                            zipCode = component.long_name;
                            break;
                        case 'country':
                            country = component.long_name;
                            break;
                    }
                }

                // Create address object
                const newAddress = {
                    street: street || '',
                    city: city || '',
                    zipCode: zipCode || '',
                    country: country || '',
                    coordinates: {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    }
                };

                // Update the temporary address only
                setTempAddress(newAddress);
                setTempDisplayAddress(place.formatted_address);
            });

            autocompleteRef.current = autocomplete;
        }
    }, [isOpen, mapLoaded, fullAddress.coordinates]);

    const handleSaveAddress = async () => {
        if (!tempAddress.street && !tempAddress.city) {
            toast.error('Please select a valid address');
            return;
        }

        setIsLoading(true);

        try {
            // Update user's address in backend
            await axios.put(`${API_URL}/users/address`, {
                address: tempAddress
            }, { withCredentials: true });

            // Only now update the fullAddress and displayAddress
            setFullAddress(tempAddress);
            setDisplayAddress(tempDisplayAddress);

            // Callback to parent component
            if (onSelectAddress) {
                onSelectAddress(tempAddress, tempDisplayAddress);
            }

            toast.success('Address saved successfully');
            setIsOpen(false);
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Failed to save address. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const openSelector = () => {
        setIsOpen(true);
    };

    return (
        <>
            <button
                onClick={openSelector}
                className={buttonClassName || "w-3/4 py-2.5 text-center pl-4 pr-4 ml-8 mr-6 flex items-center justify-center bg-white rounded-xl hover:bg-gray-50 transition-colors"}
            >
                <MapPin className="mr-2 text-gray-500" size={20} />
                <span className="truncate">{displayAddress}</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-xl shadow-2xl w-11/12 max-w-2xl max-h-[90vh] flex flex-col"
                    >
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-xl font-semibold">Select Your Address</h2>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                }}
                                className="p-1 rounded-full hover:bg-gray-100"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-4 flex-grow overflow-auto">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Search for your address
                                </label>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Type to search..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue={displayAddress !== 'My Address' ? displayAddress : ''}
                                />
                            </div>

                            <div
                                ref={mapRef}
                                className="w-full h-[300px] rounded-lg border border-gray-300"
                            ></div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Street
                                    </label>
                                    <input
                                        type="text"
                                        value={tempAddress.street}
                                        onChange={(e) => setTempAddress({...tempAddress, street: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Street address"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={tempAddress.city}
                                        onChange={(e) => setTempAddress({...tempAddress, city: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="City"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Zip Code
                                    </label>
                                    <input
                                        type="text"
                                        value={tempAddress.zipCode}
                                        onChange={(e) => setTempAddress({...tempAddress, zipCode: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Zip/Postal code"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        value={tempAddress.country}
                                        onChange={(e) => setTempAddress({...tempAddress, country: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Country"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAddress}
                                disabled={isLoading || !tempAddress.street || !tempAddress.city}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center ${
                                    isLoading || !tempAddress.street || !tempAddress.city
                                        ? 'opacity-60 cursor-not-allowed'
                                        : 'hover:bg-blue-700'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader className="animate-spin mr-2" size={18} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check size={18} className="mr-2" />
                                        Save Address
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LocationSelector;