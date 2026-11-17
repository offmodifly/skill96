// ถ้าผู้รับการประเมินผลยังไม่ได้เปลี่ยนรหัสผ่านครั้งแรก ให้บังคับไปหน้าเปลี่ยนรหัสผ่านก่อน
// (ตั้งค่า must_change_pw ใน localStorage ตอน login ที่ pages/index.vue)
// หมายเหตุ: ฝั่ง backend ก็กันไว้อีกชั้นแล้ว (middleware requirePasswordChanged)
export default defineNuxtRouteMiddleware((to) => {
    if (!import.meta.client) return

    const must = localStorage.getItem('must_change_pw') === '1'
    if (must && to.path.startsWith('/Evaluatee') && to.path !== '/Evaluatee/change_password') {
        return navigateTo('/Evaluatee/change_password')
    }
})
