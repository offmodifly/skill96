<template>
    <v-container>
        <PageHeader title="สถานะการประเมินของกรรมการประเมิน" subtitle="ดูว่ากรรมการแต่ละคนประเมินแล้วหรือยัง" icon="mdi-account-check" />

        <v-card rounded="xl" elevation="2">
            <v-card-text>
                <v-text-field v-model="search" label="ค้นหาชื่อผู้รับการประเมินผล" prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details></v-text-field>
            </v-card-text>
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>ผู้รับการประเมินผล</th>
                        <th class="text-center">รอบการประเมิน</th>
                        <th class="text-center">วันที่ออกแบบประเมิน</th>
                        <th class="text-center">สถานะการประเมิน</th>
                        <th class="text-center">รายละเอียด</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in result" :key="items.id_eva">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ items.fname }} {{ items.lname }}</td>
                        <td class="text-center">รอบที่ {{ items.round_sys }} / ปี {{ items.year_sys }}</td>
                        <td class="text-center">{{ formatDate(items.day_eva) }}</td>
                        <td class="text-center">
                            <v-chip :color="status[items.status_eva]?.color" variant="flat" size="small">
                                {{ status[items.status_eva]?.text }}
                            </v-chip>
                        </td>
                        <td class="text-center">
                            <v-btn color="info" variant="tonal" size="small" prepend-icon="mdi-eye" :to="`/Staff/status2-${items.id_eva}`">ดูกรรมการ</v-btn>
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
import { staff } from '~/API/base'

const dataResult = ref<any[]>([])
const search = ref('')
const token = import.meta.client ? localStorage.getItem('token') : null

// สถานะการประเมิน 1, 2, 3
const status: any = {
    1: { text: 'รอการประเมินตนเอง', color: 'error' },
    2: { text: 'รอกรรมการประเมิน', color: 'warning' },
    3: { text: 'ประเมินสำเร็จ', color: 'success' },
}

const fetch = async () => {
    try {
        const res = await axios.get(`${staff}/eva/show`, { headers: { Authorization: `Bearer ${token}` } })
        dataResult.value = res.data
    } catch (error) {
        console.error('error get', error)
    }
}

const formatDate = (dateStr: string) => (dateStr ? new Date(dateStr).toLocaleDateString('th-TH') : '-')

const result = computed(() => {
    const s = search.value.toLowerCase()
    return dataResult.value.filter((item) => `${item.fname} ${item.lname}`.toLowerCase().includes(s))
})

onMounted(fetch)
</script>
