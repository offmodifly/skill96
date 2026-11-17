<template>
    <v-container>
        <PageHeader title="สถานะการประเมินของกรรมการประเมิน" subtitle="รายชื่อกรรมการของแบบประเมินชุดนี้" icon="mdi-account-check" />

        <!-- ข้อมูลผู้รับการประเมินผล -->
        <v-card rounded="xl" elevation="2" class="mb-6">
            <v-list-item prepend-icon="mdi-account-circle" :title="`${header.fname ?? ''} ${header.lname ?? ''}`" :subtitle="`รอบที่ ${header.round_sys ?? '-'} / ปี ${header.year_sys ?? '-'}`" class="pa-4"></v-list-item>
        </v-card>

        <v-card rounded="xl" elevation="2">
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>กรรมการประเมิน</th>
                        <th class="text-center">ตำแหน่ง</th>
                        <th class="text-center">สถานะการประเมิน</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in result" :key="index">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ items.fname }} {{ items.lname }}</td>
                        <td class="text-center">{{ items.level_commit }}</td>
                        <td class="text-center">
                            <v-chip :color="items.status_commit === 'y' ? 'success' : 'error'" variant="flat" size="small">
                                {{ items.status_commit === 'y' ? 'ประเมินสำเร็จ' : 'รอการประเมิน' }}
                            </v-chip>
                        </td>
                    </tr>
                    <tr v-if="result.length === 0">
                        <td colspan="4" class="text-center text-medium-emphasis py-6">ไม่พบข้อมูล</td>
                    </tr>
                </tbody>
            </v-table>
        </v-card>

        <div class="text-center mt-4">
            <v-btn color="blue-grey" variant="outlined" prepend-icon="mdi-arrow-left" to="/Staff/status_commit">ย้อนกลับ</v-btn>
        </div>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { staff } from '~/API/base'

const result = ref<any[]>([])
const header = ref<any>({})
const id_eva = useRoute().params.id_eva
const token = import.meta.client ? localStorage.getItem('token') : null
const headers = { Authorization: `Bearer ${token}` }

const fetch = async () => {
    try {
        const res = await axios.get(`${staff}/commit/header/${id_eva}`, { headers })
        header.value = res.data
        const res2 = await axios.get(`${staff}/status/${id_eva}`, { headers })
        result.value = res2.data
    } catch (error) {
        console.error('error get', error)
    }
}

onMounted(fetch)
</script>
