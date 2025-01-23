// src/components/Map.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
    center: [number, number];
    markers: Array<{
        position: [number, number];
        title: string;
        description: string;
    }>;
}

export const Map: React.FC<MapProps> = ({ center, markers }) => {
    return (
        <MapContainer
            center={center}
            zoom={13}
            className="h-96 w-full rounded-lg shadow-lg"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker, index) => (
                <Marker key={index} position={marker.position}>
                    <Popup>
                        <h3 className="font-bold">{marker.title}</h3>
                        <p>{marker.description}</p>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};
