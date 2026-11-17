<!-- หัวข้อหน้า ใช้ซ้ำได้ทุกหน้า
     ตัวอย่าง: <PageHeader title="จัดการหัวข้อ" icon="mdi-format-list-bulleted" />
     เปลี่ยนสีได้: <PageHeader title="..." icon="..." color="#7d0c14" />  (ถ้าไม่ใส่ จะเป็นสี blue-grey) -->
<template>
    <v-card :color="color" rounded="xl" class="pa-6 mb-6" elevation="4">
        <div class="d-flex align-center">
            <v-icon :icon="icon" size="40" class="me-4"></v-icon>
            <div>
                <div class="text-headline-small font-weight-bold">{{ title }}</div>
                <div class="text-body-medium" v-if="subtitle">{{ subtitle }}</div>
            </div>
        </div>
    </v-card>
</template>

<script setup lang="ts">
defineProps({
    title: String,
    icon: String,
    subtitle: String,
    color: { type: String, default: 'blue-grey' },
})
</script>
