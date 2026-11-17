<template>
    <v-container>
        <PageHeader title="ผลการประเมินของผู้รับการประเมิน" subtitle="คะแนนจากการประเมินตนเอง" icon="mdi-clipboard-account" />

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
                        <th class="text-center">คะแนนที่ได้</th>
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
                            <v-chip color="primary" variant="flat" size="small">{{ items.total_eva || 0 }}</v-chip>
                        </td>
                        <td class="text-center">
                            <v-btn color="info" variant="tonal" size="small" prepend-icon="mdi-eye" :to="`/Staff/score_member-${items.id_eva}`">ดูผล</v-btn>
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
