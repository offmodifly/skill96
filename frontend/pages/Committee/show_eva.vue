<template>
    <v-container>
        <PageHeader title="ดำเนินการประเมิน" subtitle="เลือกผู้รับการประเมินที่ต้องการให้คะแนน" icon="mdi-clipboard-edit" color="#007fff" />

        <v-card rounded="xl" elevation="2">
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th class="text-center">วันที่ออกแบบประเมิน</th>
                        <th class="text-center">รอบการประเมิน</th>
                        <th class="text-center">สถานะการประเมิน</th>
                        <th class="text-center">ประเมินผล</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in result" :key="items.id_eva">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ items.fname }} {{ items.lname }}</td>
                        <td class="text-center">{{ formatDate(items.day_eva) }}</td>
                        <td class="text-center">รอบที่ {{ items.round_sys }} ปี {{ items.year_sys }}</td>
                        <td class="text-center">
                            <v-chip :color="getStatus(items).color" variant="flat" size="small">{{ getStatus(items).text }}</v-chip>
                        </td>
                        <td class="text-center">
                            <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-pencil" @click="go(items.id_eva)">ประเมิน</v-btn>
                        </td>
                    </tr>
                    <tr v-if="result.length === 0">
                        <td colspan="6" class="text-center text-medium-emphasis py-6">ไม่พบข้อมูล</td>
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

// แปลงสถานะเป็นข้อความ + สี (ลำดับเงื่อนไขเหมือนเดิม)
const getStatus = (items: any) => {
    if (items.status_eva === 1) return { text: 'ยังไม่ได้ประเมิน', color: 'error' }
    if (items.status_commit === 'y') return { text: 'ประเมินสำเร็จ', color: 'success' }
    if (items.status_eva === 2) return { text: 'รอกรรมการประเมิน', color: 'warning' }
    return { text: 'ประเมินเสร็จสิ้น', color: 'success' }
}

const go = (id_eva: number) => {
    navigateTo({ path: `/Committee/Save_Score${id_eva}` })
}

const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString('th-TH') : '-')

onMounted(fetch)
</script>
