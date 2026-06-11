<template>
  <div class="py-2 space-y-1.5">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <span class="text-xl shrink-0">{{ icon }}</span>
        <div class="min-w-0">
          <p class="text-sm font-medium text-surface-100 truncate">{{ label }}</p>
          <p class="text-xs text-surface-500 truncate">{{ description }}</p>
        </div>
      </div>
      <span class="text-xs font-mono text-surface-300 bg-surface-800 px-2 py-0.5 rounded shrink-0">
        {{ modelValue }}{{ unit }}
      </span>
    </div>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      class="w-full h-1.5 rounded-full appearance-none bg-surface-700 cursor-pointer slider"
      @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  description: string;
  modelValue: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}>();

defineEmits<{
  "update:modelValue": [value: number];
}>();
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6366f1; /* primary-500 */
  cursor: pointer;
  border: none;
}
.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: none;
}
</style>
