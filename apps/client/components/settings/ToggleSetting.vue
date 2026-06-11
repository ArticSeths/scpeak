<template>
  <label class="flex items-center justify-between gap-4 py-2 cursor-pointer select-none">
    <div class="flex items-center gap-3 min-w-0">
      <span class="text-xl shrink-0">{{ icon }}</span>
      <div class="min-w-0">
        <p class="text-sm font-medium text-surface-100 truncate">{{ label }}</p>
        <p class="text-xs text-surface-500 truncate">{{ description }}</p>
      </div>
    </div>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      class="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none"
      :class="modelValue ? 'bg-primary-600' : 'bg-surface-600'"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <span
        class="inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ml-0.5"
        :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
      />
    </button>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  description: string;
  modelValue: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>
