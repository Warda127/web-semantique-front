import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, RefreshCw, MapPin, Clock, DollarSign, Car, Bike, Zap } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/parking-stations';

const ParkingStationApp = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    const [formData, setFormData] = useState({
        localname: '',
        type: 'CarParkingStation',
        name: '',
        capacity: '',
        availableSpaces: '',
        pricePerHour: '',
        address: '',
        latitude: '',
        longitude: '',
        operatingHours: '24/7'
    });

    // Fetch stations
    const fetchStations = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE}/`;
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            if (filterType) params.append('type', filterType);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);
            const data = await response.json();
            setStations(data.stations || []);
        } catch (err) {
            setError(`Failed to fetch stations: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStations();
    }, [searchQuery, filterType]);

    // Create station
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
                    availableSpaces: formData.availableSpaces ? parseInt(formData.availableSpaces) : undefined,
                    pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : undefined,
                    latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
                    longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
                })
            });

            if (response.ok) {
                await fetchStations();
                setShowCreateForm(false);
                resetForm();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to create station');
            }
        } catch (err) {
            setError(`Create error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Update available spaces
    const handleUpdateSpaces = async (localname, newSpaces) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE}/${localname}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ availableSpaces: parseInt(newSpaces) })
            });

            if (response.ok) {
                await fetchStations();
                setEditingStation(null);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to update station');
            }
        } catch (err) {
            setError(`Update error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Delete station
    const handleDelete = async (localname) => {
        if (!window.confirm('Are you sure you want to delete this parking station?')) return;

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE}/${localname}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchStations();
            } else {
                setError('Failed to delete station');
            }
        } catch (err) {
            setError(`Delete error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            localname: '',
            type: 'CarParkingStation',
            name: '',
            capacity: '',
            availableSpaces: '',
            pricePerHour: '',
            address: '',
            latitude: '',
            longitude: '',
            operatingHours: '24/7'
        });
    };

    const getLocalName = (uri) => {
        return uri.split('#')[1] || uri.split('/').pop();
    };

    const getStationType = (typeUri) => {
        const type = typeUri.split('#')[1] || typeUri.split('/').pop();
        return type;
    };

    const getTypeIcon = (typeUri) => {
        const type = getStationType(typeUri);
        if (type.includes('Car')) return <Car className="w-5 h-5" />;
        if (type.includes('Bike')) return <Bike className="w-5 h-5" />;
        if (type.includes('EV')) return <Zap className="w-5 h-5" />;
        return <Car className="w-5 h-5" />;
    };

    const getOccupancyColor = (available, capacity) => {
        if (!capacity) return 'bg-gray-400';
        const ratio = available / capacity;
        if (ratio > 0.5) return 'bg-green-500';
        if (ratio > 0.2) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">🚗 Smart City Parking Management</h1>
                    <p className="text-gray-600">Manage parking stations across the city</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Controls */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="CarParkingStation">Car Parking</option>
                            <option value="BikeParkingStation">Bike Parking</option>
                            <option value="EVChargingStation">EV Charging</option>
                        </select>

                        {/* Refresh */}
                        <button
                            onClick={fetchStations}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>

                        {/* Create Button */}
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Station
                        </button>
                    </div>
                </div>

                {/* Create Form Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                            <h2 className="text-2xl font-bold mb-4">Create New Parking Station</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Local Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.localname}
                                            onChange={(e) => setFormData({ ...formData, localname: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., CentralPark"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Type *</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="CarParkingStation">Car Parking</option>
                                            <option value="BikeParkingStation">Bike Parking</option>
                                            <option value="EVChargingStation">EV Charging</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Central Park Garage"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Capacity</label>
                                        <input
                                            type="number"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Available Spaces</label>
                                        <input
                                            type="number"
                                            value={formData.availableSpaces}
                                            onChange={(e) => setFormData({ ...formData, availableSpaces: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="150"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Price per Hour</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.pricePerHour}
                                            onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="2.50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Operating Hours</label>
                                        <input
                                            type="text"
                                            value={formData.operatingHours}
                                            onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="24/7"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">Address</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="123 Main Street"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={formData.latitude}
                                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="36.8065"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={formData.longitude}
                                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="10.1815"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setShowCreateForm(false); resetForm(); }}
                                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        {loading ? 'Creating...' : 'Create Station'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Stations Grid */}
                {loading && stations.length === 0 ? (
                    <div className="text-center py-12">
                        <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading stations...</p>
                    </div>
                ) : stations.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No parking stations found</p>
                        <p className="text-gray-400 mt-2">Try adjusting your filters or create a new station</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stations.map((station) => {
                            const localName = getLocalName(station.uri);
                            const isEditing = editingStation === localName;
                            const capacity = parseInt(station.capacity) || 0;
                            const available = parseInt(station.availableSpaces) || 0;
                            const occupied = capacity - available;

                            return (
                                <div key={station.uri} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                {getTypeIcon(station.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-800">
                                                    {station.name || localName}
                                                </h3>
                                                <p className="text-xs text-gray-500">{getStationType(station.type)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setEditingStation(isEditing ? null : localName)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(localName)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Occupancy Bar */}
                                    {capacity > 0 && (
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">Occupancy</span>
                                                <span className="font-semibold">{available}/{capacity} available</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${getOccupancyColor(available, capacity)}`}
                                                    style={{ width: `${(available / capacity) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Edit Form */}
                                    {isEditing && (
                                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                            <label className="block text-sm font-medium mb-2">Update Available Spaces</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    defaultValue={available}
                                                    id={`spaces-${localName}`}
                                                    className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const input = document.getElementById(`spaces-${localName}`);
                                                        handleUpdateSpaces(localName, input.value);
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Details */}
                                    <div className="space-y-2 text-sm">
                                        {station.pricePerHour && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <DollarSign className="w-4 h-4 text-green-600" />
                                                <span>${station.pricePerHour}/hour</span>
                                            </div>
                                        )}
                                        {station.operatingHours && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Clock className="w-4 h-4 text-blue-600" />
                                                <span>{station.operatingHours}</span>
                                            </div>
                                        )}
                                        {station.address && (
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <MapPin className="w-4 h-4 text-red-600" />
                                                <span className="truncate">{station.address}</span>
                                            </div>
                                        )}
                                        {station.latitude && station.longitude && (
                                            <div className="text-xs text-gray-500 mt-2">
                                                GPS: {parseFloat(station.latitude).toFixed(4)}, {parseFloat(station.longitude).toFixed(4)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Statistics Footer */}
                <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600">{stations.length}</div>
                            <div className="text-sm text-gray-600 mt-1">Total Stations</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-3xl font-bold text-green-600">
                                {stations.reduce((sum, s) => sum + (parseInt(s.capacity) || 0), 0)}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Total Capacity</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-3xl font-bold text-yellow-600">
                                {stations.reduce((sum, s) => sum + (parseInt(s.availableSpaces) || 0), 0)}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Available Spaces</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-3xl font-bold text-purple-600">
                                {stations.reduce((sum, s) => {
                                    const cap = parseInt(s.capacity) || 0;
                                    const avail = parseInt(s.availableSpaces) || 0;
                                    return sum + (cap - avail);
                                }, 0)}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Occupied Spaces</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParkingStationApp;