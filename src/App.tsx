import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.tsx' // Changed import to .tsx, though resolution might not need extension explicitly if config is right, but being explicit for clarity in transition.

export default defineComponent({
  name: 'App',
  setup() {
    return () => (
      <div class="min-h-screen flex flex-col">
        <Navbar />
        <main class="flex-1 w-full">
          <RouterView />
        </main>
      </div>
    )
  }
})
