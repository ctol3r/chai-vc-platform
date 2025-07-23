<template>
  <form class="request-form" @submit.prevent="handleSubmit">
    <label>
      Provider
      <input v-model="provider" type="text" />
    </label>
    <label>
      Credential Type
      <input v-model="credentialType" type="text" />
    </label>
    <button type="submit">Request Verification</button>
  </form>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'submit', data: { provider: string; credentialType: string }): void;
}>();

const provider = ref('');
const credentialType = ref('');

const handleSubmit = () => {
  emit('submit', { provider: provider.value, credentialType: credentialType.value });
};
</script>

<style scoped>
.request-form label {
  display: block;
  margin-bottom: 0.5rem;
}
</style>
