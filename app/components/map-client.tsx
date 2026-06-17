'use client'
import dynamic from 'next/dynamic'
import type { Pin } from '@/components/map-view'

const MapView = dynamic(() => import('@/components/map-view'), { ssr: false })

export default function MapClient({ pins }: { pins: Pin[] }) {
  return <MapView pins={pins} />
}
