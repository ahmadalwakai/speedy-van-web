import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
  pickupCoords?: [number, number] | null;
  dropoffCoords?: [number, number] | null;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ pickupCoords, dropoffCoords }) => {
  if (!pickupCoords || !dropoffCoords) {
    return (
      <Box 
        height="400px" 
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.100"
        borderRadius="lg"
      >
        <Text color="gray.500">Select pickup and dropoff locations to view the map</Text>
      </Box>
    );
  }

  const centerLongitude = (pickupCoords[0] + dropoffCoords[0]) / 2;
  const centerLatitude = (pickupCoords[1] + dropoffCoords[1]) / 2;

  const routeGeoJSON = {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: [pickupCoords, dropoffCoords],
    },
    properties: {},
  };

  return (
    <Box width="100%" height="100%">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        initialViewState={{
          longitude: centerLongitude,
          latitude: centerLatitude,
          zoom: 10,
        }}
        style={{ width: '100%', height: '100%', borderRadius: 'lg' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        <Marker longitude={pickupCoords[0]} latitude={pickupCoords[1]}>
          <Box 
            bg="green.500" 
            color="white" 
            p={2} 
            borderRadius="full" 
            fontSize="lg"
            transform="translate(-50%, -50%)"
          >
            🚚
          </Box>
        </Marker>

        <Marker longitude={dropoffCoords[0]} latitude={dropoffCoords[1]}>
          <Box 
            bg="red.500" 
            color="white" 
            p={2} 
            borderRadius="full" 
            fontSize="lg"
            transform="translate(-50%, -50%)"
          >
            🏁
          </Box>
        </Marker>

        <Source id="route" type="geojson" data={routeGeoJSON}>
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': '#3182CE',
              'line-width': 4,
              'line-dasharray': [2, 2],
            }}
          />
        </Source>
      </Map>
    </Box>
  );
};

export default MapboxMap;