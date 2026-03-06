import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import type { Outbreak } from '../../types'
import { computeStateSeverity, severityColor } from './mapUtils'

interface Props {
  outbreaks: Outbreak[]
}

const INDIA_GEOJSON_URL = '/india.geojson'

// Map GeoJSON NAME_1 → our two-letter state codes used in STATE_REGIONS
const NAME_TO_STATE_CODE: Record<string, string> = {
  'Karnataka': 'KA',
  'Tamil Nadu': 'TN',
  'Andhra Pradesh': 'AP',
  'Telangana': 'TS',
  'Maharashtra': 'MH',
  'Delhi': 'DL',
  'Uttar Pradesh': 'UP',
  'Rajasthan': 'RJ',
  'Gujarat': 'GJ',
  'West Bengal': 'WB',
  'Orissa': 'OR',
  'Odisha': 'OR',
  'Kerala': 'KL',
  'Punjab': 'PB',
  'Haryana': 'HR',
  'Bihar': 'BR',
  'Madhya Pradesh': 'MP',
  'Assam': 'AS',
  'Jharkhand': 'JH',
  'Chhattisgarh': 'CG',
  'Uttaranchal': 'UK',
  'Uttarakhand': 'UK',
  'Himachal Pradesh': 'HP',
  'Goa': 'GA',
  'Jammu and Kashmir': 'JK',
  'Arunachal Pradesh': 'AR',
  'Manipur': 'MN',
  'Meghalaya': 'ML',
  'Mizoram': 'MZ',
  'Nagaland': 'NL',
  'Sikkim': 'SK',
  'Tripura': 'TR',
  'Chandigarh': 'CH',
}

export function IndiaMap({ outbreaks }: Props) {
  const stateSeverity = computeStateSeverity(outbreaks)

  return (
    <div className="h-[320px] w-full overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 1000, center: [82, 22] }}
        width={500}
        height={520}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={INDIA_GEOJSON_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => {
              const name: string = geo.properties.NAME_1 ?? ''
              const stateCode = NAME_TO_STATE_CODE[name] ?? ''
              const sev = stateSeverity[stateCode] ?? null
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: severityColor(sev),
                      outline: 'none',
                      stroke: '#1F2937',
                      strokeWidth: 0.5,
                    },
                    hover: {
                      fill: '#38BDF8',
                      outline: 'none',
                      stroke: '#F9FAFB',
                      strokeWidth: 0.8,
                    },
                    pressed: {
                      fill: '#0369A1',
                      outline: 'none',
                    },
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  )
}

