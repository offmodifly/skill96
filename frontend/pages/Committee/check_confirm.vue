<template>
    <v-container>
        <PageHeader title="ยืนยันผลการประเมิน" subtitle="แนบลายเซ็นเพื่อยืนยันผลการประเมิน" icon="mdi-draw-pen" color="#007fff" />

        <v-card rounded="xl" elevation="2">
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th class="text-center">วันที่ออกแบบประเมิน</th>
                        <th class="text-center">รอบการประเมิน</th>
                        <th class="text-center">ยืนยันผล</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in result" :key="items.id_eva">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ items.fname }} {{ items.lname }}</td>
                        <td class="text-center">{{ formatDate(items.day_eva) }}</td>
                        <td class="text-center">รอบที่ {{ items.round_sys }} ปี {{ items.year_sys }}</td>
                        <td class="text-center">
                            <v-btn v-if="items.signature" color="success" variant="tonal" size="small" prepend-icon="mdi-check-circle" @click="go(items.id_eva)">ยืนยันผลแล้ว</v-btn>
                            <v-btn v-else color="primary" variant="tonal" size="small" prepend-icon="mdi-draw-pen" @click="go(items.id_eva)">ยืนยันผล</v-btn>
                        </td>
                    </tr>
                    <tr v-if="result.length === 0">
                        <td colspan="5" class="text-center text-medium-emphasis py-6">ไม่พบข้อมูล</td>
                    </tr>
                </tbody>
            </v-table>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { commit } from '../../API/base'

const result = ref<any[]>([])

const fetch = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
    try {
        const res = await axios.get(`${commit}/check`, { headers })
        result.value = res.data
    } catch (error) {
        console.error('Error Fetching', error)
    }
}

const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString('th-TH') : '-')

// ไปหน้าแนบลายเซ็น
const go = (id_eva: number) => {
    navigateTo({ path: `/Committee/Signature/${id_eva}` })
}

onMounted(fetch)
</script>
