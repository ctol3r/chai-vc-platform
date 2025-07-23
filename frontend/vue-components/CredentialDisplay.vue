<template>
  <div class="credential-display">
    <h3>{{ credentialName }}</h3>
    <p><strong>Holder:</strong> {{ holder }}</p>
    <p><strong>Status:</strong> {{ status }}</p>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';

const props = defineProps<{
  credentialName: string;
  holder: string;
  status: string;
}>();
</script>

<style scoped>
.credential-display {
  border: 1px solid #ccc;
  padding: 1rem;
}
</style>
