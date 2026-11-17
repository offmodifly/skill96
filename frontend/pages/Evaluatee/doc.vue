<template>
    <v-container>
        <PageHeader title="คู่มือการประเมิน" subtitle="เอกสารและคู่มือจากฝ่ายบุคลากร" icon="mdi-book-open-variant" color="#7d0c14" />

        <v-card rounded="xl" elevation="2">
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>ชื่อเอกสาร</th>
                        <th class="text-center">วันที่ออกเอกสาร</th>
                        <th class="text-center">เอกสาร</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in result" :key="items.id_doc">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>
                            <v-icon icon="mdi-file-pdf-box" color="red" class="me-1"></v-icon>
                            {{ items.name_doc }}
                        </td>
                        <td class="text-center">{{ formatDate(items.day_doc) }}</td>
                        <td class="text-center">
                            <v-btn color="info" variant="tonal" size="small" prepend-icon="mdi-eye" @click="view(items.file)">เปิดดู</v-btn>
                        </td>
                    </tr>
                    <tr v-if="result.length === 0">
                        <td colspan="4" class="text-center text-medium-emphasis py-6">ยังไม่มีเอกสาร</td>
                    </tr>
                </tbody>
            </v-table>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { api } from '~/API/base'

const result = ref<any[]>([])

const fetch = async () => {
    try {
        const res = await axios.get(`${api}/docnoe/`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        result.value = res.data
    } catch (error) {
        console.error('error get', error)
    }
}

const formatDate = (dateStr: string) => (dateStr ? new Date(dateStr).toLocaleDateString('th-TH') : '-')

// เปิดไฟล์ PDF ในแท็บใหม่
const view = (file: string) => {
    window.open(new URL(`/uploads/document/${file}`, api).href, '_blank')
}

onMounted(fetch)
</script>
