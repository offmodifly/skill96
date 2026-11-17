<template>
    <v-container>
        <PageHeader title="เพิ่มกรรมการประเมิน" subtitle="เลือกกรรมการ 3 คน (ประธาน กรรมการ เลขา)" icon="mdi-account-multiple-plus" />

        <!-- ข้อมูลผู้รับการประเมินผล -->
        <v-card rounded="xl" elevation="2" class="mb-6">
            <v-list-item prepend-icon="mdi-account-circle" :title="`${header.fname ?? ''} ${header.lname ?? ''}`" :subtitle="`รอบที่ ${header.round_sys ?? '-'} / ปี ${header.year_sys ?? '-'}`" class="pa-4"></v-list-item>
        </v-card>

        <!-- ฟอร์มเลือกกรรมการ -->
        <v-card rounded="xl" elevation="2" class="pa-4 mb-6">
            <v-card-title>
                <v-icon icon="mdi-account-group" color="blue-grey" class="me-2"></v-icon>
                เลือกกรรมการประเมิน
            </v-card-title>
            <v-card-text>
                <v-form @submit.prevent="saveMember">
                    <v-row v-for="(c, index) in List" :key="index">
                        <v-col cols="12" md="6">
                            <v-select :label="`กรรมการประเมินคนที่ ${index + 1}`" v-model="c.id_member" :items="MEMBER(index)" item-title="fullname_commit" item-value="id_member" variant="outlined"></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select :label="`ตำแหน่งกรรมการคนที่ ${index + 1}`" v-model="c.role" :items="ROLE(index)" variant="outlined"></v-select>
                        </v-col>
                    </v-row>
                    <div class="text-center">
                        <v-btn color="primary" type="submit" prepend-icon="mdi-content-save" class="ma-2">บันทึก</v-btn>
                        <v-btn color="blue-grey" variant="outlined" prepend-icon="mdi-arrow-left" class="ma-2" to="/Staff/eva">ย้อนกลับ</v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>

        <!-- รายชื่อกรรมการที่บันทึกแล้ว -->
        <v-card rounded="xl" elevation="2">
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>กรรมการประเมิน</th>
                        <th class="text-center">ตำแหน่ง</th>
                        <th class="text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in saved" :key="items.id_commit">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ nameOf(items.id_member) }}</td>
                        <td class="text-center"><v-chip color="blue-grey" size="small">{{ items.role }}</v-chip></td>
                        <td class="text-center">
                            <v-btn icon="mdi-delete" color="error" variant="tonal" size="small" @click="del(items.id_commit)"></v-btn>
                        </td>
                    </tr>
                    <tr v-if="saved.length === 0">
                        <td colspan="4" class="text-center text-medium-emphasis py-6">ยังไม่ได้เลือกกรรมการ</td>
                    </tr>
                </tbody>
            </v-table>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { staff } from '~/API/base'

const role = ['ประธาน', 'กรรมการ', 'เลขา']
const people = ref<any[]>([])
const header = ref<any>({})
const emptyRow = () => ({ id_commit: null, id_member: '', role: '' })
const List = ref<any[]>([emptyRow(), emptyRow(), emptyRow()])

// แสดงเฉพาะแถวที่บันทึกแล้ว (มี id_commit)
const saved = computed(() => List.value.filter((c) => c.id_commit))

const id_eva = useRoute().params.id_eva
const token = import.meta.client ? localStorage.getItem('token') : null
const headers = { Authorization: `Bearer ${token}` }

const saveMember = async () => {
    try {
        await axios.post(`${staff}/commit/save/${id_eva}`, List.value, { headers })
        alert('ดำเนินการสำเร็จ')
        await fetch()
    } catch (error) {
        console.error('Error save', error)
    }
}

const fetch = async () => {
    try {
        const res = await axios.get(`${staff}/commit/header/${id_eva}`, { headers })
        header.value = res.data
        const res2 = await axios.get(`${staff}/commit/member/${id_eva}`, { headers })
        people.value = res2.data.pick

        // นำกรรมการที่เคยบันทึกมาใส่ฟอร์ม แล้วเติมแถวว่างให้ครบ 3 แถว
        List.value = res2.data.picked.map((c: any) => ({ id_commit: c.id_commit, id_member: c.id_member, role: c.role }))
        while (List.value.length < 3) List.value.push(emptyRow())
    } catch (error) {
        console.error('error get', error)
    }
}

const del = async (id_commit: number) => {
    if (!confirm('ต้องการลบข้อมูลชุดนี้ใช่หรือไม่')) return
    try {
        await axios.delete(`${staff}/commit/delete/${id_commit}`, { headers })
        await fetch()
    } catch (error) {
        console.error('error delete', error)
    }
}

const nameOf = (id: number) => people.value.find((p) => p.id_member === id)?.fullname_commit

// ตัดคนที่ถูกเลือกในแถวอื่นออก จะได้ไม่เลือกซ้ำ
const MEMBER = (idx: number) => {
    const picked = List.value.map((c, i) => (i !== idx ? c.id_member : null))
    return people.value.filter((p) => !picked.includes(p.id_member))
}

// ตัดตำแหน่งที่ถูกเลือกในแถวอื่นออก
const ROLE = (idx: number) => {
    const picked = List.value.map((c, i) => (i !== idx ? c.role : null))
    return role.filter((r) => !picked.includes(r))
}

onMounted(fetch)
</script>
