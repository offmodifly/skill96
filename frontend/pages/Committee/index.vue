<template>
    <v-container>
        <PageHeader title="รายชื่อผู้รับการประเมินผล" subtitle="ตรวจสอบคะแนนประเมินตนเองของผู้รับการประเมิน" icon="mdi-account-group" color="#007fff" />

        <v-card rounded="xl" elevation="2">
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th class="text-center">วันที่ออกแบบประเมิน</th>
                        <th class="text-center">คะแนนประเมินตนเอง</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in result" :key="items.id_eva">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ items.fname }} {{ items.lname }}</td>
                        <td class="text-center">{{ formatDate(items.day_eva) }}</td>
                        <td class="text-center">
                            <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-eye" @click="go(items.id_eva)">ตรวจสอบ</v-btn>
                        </td>
                    </tr>
                    <tr v-if="result.length === 0">
                        <td colspan="4" class="text-center text-medium-emphasis py-6">ไม่พบข้อมูล</td>
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
        const res = await axios.get(`${commit}/show_eva`, { headers })
        result.value = res.data
    } catch (error) {
        console.error('Error Fetching', error)
    }
}

// ไปหน้าดูคะแนนของผู้รับการประเมินคนนี้
const go = (id_eva: number) => {
    navigateTo({ path: `/Committee/Score_member${id_eva}` })
}

const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString('th-TH') : '-')

onMounted(fetch)
</script>
