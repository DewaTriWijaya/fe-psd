import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'FileUpload',
  props: {
    label: {
      type: String,
      default: 'File Data Produksi'
    },
    accept: {
      type: String,
      default: '.xlsx,.xls,.csv'
    },
    maxSize: {
      type: String,
      default: '10 MB'
    },
    supportedFormats: {
      type: String,
      default: '.xlsx, .xls, .csv'
    }
  },
  emits: ['fileSelected'],
  setup(props, { emit }) {
    const fileInput = ref<HTMLInputElement | null>(null)
    const fileName = ref('')

    const triggerFileUpload = () => {
      fileInput.value?.click()
    }

    const handleFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        const file = target.files[0]
        fileName.value = file?.name || ''
        emit('fileSelected', file)
      }
    }

    return () => (
      <div class="mb-8 pt-5">
        <label class="block text-sm pb-2 font-medium mb-3 text-gray-900">{props.label}</label>
        <div 
          class="border-2 border-dashed border-gray-300 rounded-xl py-12 px-4 text-center cursor-pointer transition-all duration-200 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          onClick={triggerFileUpload}
        >
          <input 
            type="file" 
            ref={fileInput} 
            class="hidden" 
            accept={props.accept}
            onChange={handleFileChange}
          />
          <div class="flex flex-col items-center justify-center">
            <div class="mb-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-gray-400">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 18V12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 15H15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            {!fileName.value ? (
              <p class="text-sm text-gray-500">
                Masukan File Data Produksi, atau <span class="text-blue-600 underline font-medium">klik untuk melihat</span>
              </p>
            ) : (
              <p class="text-sm font-semibold text-emerald-600">
                Selected: {fileName.value}
              </p>
            )}
          </div>
        </div>
        <div class="flex justify-between pt-2 mt-2 text-xs text-gray-400">
          <span>Support file formats: {props.supportedFormats}</span>
          <span>Max size: {props.maxSize}</span>
        </div>
      </div>
    )
  }
})
