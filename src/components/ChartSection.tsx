import { defineComponent } from 'vue'

interface ChartLegend {
  color: string
  label: string
}

export default defineComponent({
  name: 'ChartSection',
  props: {
    title: {
      type: String,
      default: 'Fluktuasi Harga'
    },
    lastUpdate: {
      type: String,
      default: '1 Agustus 2025'
    }
  },
  setup(props) {
    const legends: ChartLegend[] = [
      { color: '#f97316', label: 'Produsen' },
      { color: '#3b82f6', label: 'Konsumen' }
    ]

    return () => (
      <div class="bg-white rounded-lg p-8 border border-gray-100 shadow-sm">
        <h2 class="text-xl font-semibold text-gray-800 mb-2">{props.title}</h2>
        <p class="text-sm text-gray-500 mb-6">Terakhir update: {props.lastUpdate}</p>
        
        <div class="bg-gray-50 rounded-lg p-8">
          <div class="flex justify-center items-center h-80">
            <div class="text-center">
              <svg width="600" height="300" viewBox="0 0 600 300">
                {/* Chart placeholder - simplified representation */}
                <line x1="50" y1="250" x2="550" y2="250" stroke="#9ca3af" stroke-width="1"/>
                <line x1="50" y1="50" x2="50" y2="250" stroke="#9ca3af" stroke-width="1"/>
                
                {/* Sample line chart paths */}
                <path d="M 50 200 L 100 180 L 150 170 L 200 160 L 250 150 L 300 140 L 350 130 L 400 120 L 450 110 L 500 100 L 550 95" 
                      stroke="#f97316" stroke-width="2" fill="none"/>
                <path d="M 50 230 L 100 225 L 150 220 L 200 215 L 250 210 L 300 205 L 350 200 L 400 195 L 450 190 L 500 185 L 550 180" 
                      stroke="#3b82f6" stroke-width="2" fill="none"/>
                
                <text x="300" y="280" text-anchor="middle" fill="#6b7280" font-size="12">Bulan</text>
                <text x="20" y="150" text-anchor="middle" fill="#6b7280" font-size="12" transform="rotate(-90 20 150)">Rp/Kg</text>
              </svg>
              
              <div class="flex justify-center gap-6 text-sm mt-4">
                {legends.map((legend) => (
                  <div key={legend.label} class="flex items-center gap-2">
                    <div class="w-4 h-1" style={{ backgroundColor: legend.color }}></div>
                    <span class="text-gray-600">{legend.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})
