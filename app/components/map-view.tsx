'use client'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'

export type Pin = { id: string; name: string; lat: number; lng: number; kind: 'destination' | 'activity' }

export default function MapView({ pins }: { pins: Pin[] }) {
  const center: [number, number] = pins[0] ? [pins[0].lat, pins[0].lng] : [16.0, 107.5]
  return (
    <MapContainer center={center} zoom={6} style={{ height: '70vh', width: '100%' }}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {pins.map(p => (
        <CircleMarker key={p.id} center={[p.lat, p.lng]} radius={p.kind === 'destination' ? 8 : 5}
          pathOptions={{ color: p.kind === 'destination' ? '#0071e3' : '#34c759' }}>
          <Popup>{p.name}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
