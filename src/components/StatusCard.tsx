import { defineComponent } from 'vue'

export default defineComponent({
  name: 'StatusCard',
  props: {
    status: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: true
    },
    bgColor: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return () => (
      <div class="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
        <div class="flex justify-center mb-3">
          <span 
            class="text-white text-xs font-medium px-4 py-1 rounded-full"
            style={{ backgroundColor: props.bgColor }}
          >
            Status : {props.status}
          </span>
        </div>
        <div class="text-center text-5xl font-bold text-gray-800">{props.count}</div>
      </div>
    )
  }
})
