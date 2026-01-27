import { defineComponent, type PropType } from 'vue'

interface SelectOption {
  value: string
  label: string
}

export default defineComponent({
  name: 'FormSelect',
  props: {
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    modelValue: {
      type: String,
      required: true
    },
    options: {
      type: Array as PropType<SelectOption[]>,
      required: true
    },
    placeholder: {
      type: String,
      default: '--Pilih--'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleChange = (event: Event) => {
      const target = event.target as HTMLSelectElement
      emit('update:modelValue', target.value)
    }

    return () => (
      <div class="mb-8 pt-5">
        <label for={props.id} class="block text-sm pb-2 font-medium mb-3 text-gray-900">
          {props.label}
        </label>
        <div class="relative">
          <select 
            id={props.id}
            value={props.modelValue}
            onChange={handleChange}
            class="w-full p-3 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-700 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
              backgroundPosition: 'right 0.5rem center', 
              backgroundRepeat: 'no-repeat', 
              backgroundSize: '1.5em 1.5em' 
            }}
          >
            <option value="" disabled selected>{props.placeholder}</option>
            {props.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  }
})
