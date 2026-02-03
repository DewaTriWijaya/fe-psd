import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'

export default defineComponent({
  name: 'Navbar',
  setup() {
    return () => (
      <header class="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-[#208bc2] to-[#177ea3] text-white shadow-md">
        <div class="w-full h-16 flex items-center justify-between px-20">
          <div class="flex items-center gap-3 font-bold text-xl">
            {/* Placeholder Icon */}
            <div class="w-8 h-8">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <span class="text-white">AgroMetrics</span>
          </div>
          
          <nav class="flex gap-4">
            <RouterLink 
              to="/import-production" 
              class="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors duration-200 text-white/90 hover:bg-white/10 hover:text-white"
              activeClass="bg-white/20 text-white"
            >
              <span class="font-bold text-lg">+</span> Import Data Produksi
            </RouterLink>
            <RouterLink 
              to="/import-price" 
              class="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors duration-200 text-white/90 hover:bg-white/10 hover:text-white"
              activeClass="bg-white/20 text-white"
            >
              <span class="font-bold text-lg">+</span> Import Data Harga
            </RouterLink>
            <RouterLink 
              to="/dashboard" 
              class="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors duration-200 text-white/90 hover:bg-white/10 hover:text-white"
              activeClass="bg-white/20 text-white"
            >
              <span class="text-lg">⊞</span> Dashboard
            </RouterLink>
          </nav>
        </div>
      </header>
    )
  }
})
