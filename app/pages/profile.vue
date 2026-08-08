<template>
    <div class="flex flex-col items-center w-full h-screen p-6 gap-y-2">
        <div class="h-64 flex flex-col items-center gap-x-4 w-full text-slate-400 text-sm p-4 gap-y-2 relative bg-slate-900/10 rounded-md">
   
            <div class="flex items-center gap-x-2 w-full p-2">
                <UAvatar size="3xl" icon="i-lucide-user" class="h-18 w-18"/>
                <div class="flex flex-col gap-y-1 flex-1">
                    <p class="text-xl font-semibold">{{ user?.email }}</p>
                    <p :class="!user?.name && 'opacity-50'">{{ user?.name ?? '(No Name)'}}</p>
                </div>
                <div class="flex flex-col items-end gap-y-2">
                    <UBadge color="neutral" class="capitalize" variant="subtle" v-if="user?.role !== 'user'">{{ user?.city?.name }}</UBadge>
                    <UBadge color="warning" class="capitalize">{{ user?.role }}</UBadge>
                </div>
  
            </div>
            <USeparator />
            <div class="grid grid-cols-2 gap-2 w-full p-2 relative">
                <div class="flex items-center gap-x-2 text-slate-500">
                    <UIcon name="i-lucide-map-pin"/>
                    <p>City</p>
                    <p class="text-slate-400 font-semibold">{{ user?.location_city ?? '-----' }}</p>
                </div>
                <div class="flex items-center gap-x-2 text-slate-500">
                    <UIcon name="i-lucide-phone"/>
                    <p>Contact Number</p>
                    <p class="text-slate-400 font-semibold">{{ user?.contact_number ?? '-----' }}</p>
                </div>
                <div class="flex items-center gap-x-2 text-slate-500">
                    <UIcon name="i-lucide-pin"/>
                    <p>Barangay</p>
                    <p class="text-slate-400 font-semibold">{{ user?.location_barangay ?? '-----' }}</p>
                </div>
          
                <div class="flex items-center gap-x-2 text-slate-500">
                    <UIcon name="i-lucide-calendar-fold"/>
                    <p>Birthdate</p>
                    <p class="text-slate-400 font-semibold">{{ user?.birthdate ? formatDate2(user?.birthdate) : '-----' }}</p>
                </div>
                <UButton 
                    @click="open = true" 
                    icon="i-lucide-pencil" variant="ghost" color="neutral" 
                    class="w-max text-slate-700 hover:text-slate-200 absolute right-0 top-0"
                />
            </div>
        </div>

        <div class="flex justify-between w-full h-full">
            <div class="flex-4 h-full p-2 relative">
                <h1 class="font-semibold text-primary">My Garbage Reports</h1>
                <div class="flex flex-col gap-y-2">
                    <div 
                    class="bg-slate-900/25 rounded p-2 flex gap-x-2 items-center text-xs" 
                    v-for="report in reports" 
                    :key="report.id"
                    >
                        <UAvatar size="lg" :icon="getReportIcon(report)" :color="getReportColor(report)" variant="subtle"/>
                        <div class="flex flex-col gap-y-1 w-full">
                            <p>{{ report.location_barangay }}, {{ report.location_city }}</p>
                            <p v-if="report.status === 'COLLECTED'" class="text-slate-500">Confirmed At: {{ formatDate2(report.confirmation_date ?? report.updated_at, DateFormatType.DateWithTime) }}</p>
                        </div>
                        <p class="min-w-fit">{{ formatDate2(report.created_at, DateFormatType.DateWithTime) }}</p>
                    </div>
                </div>
                <UPagination
                v-model:page="query.page" 
                :total="query.total" 
                :items-per-page="query.limit"
                class="absolute bottom-1 right-1"
                />
            </div>
            <div class="flex-2 h-[60vh] p-2 flex flex-col gap-y-2">
                <h1 class="font-semibold text-primary">Collection Schedules</h1>

                <div class="flex-1 flex flex-col gap-y-2 overflow-y-auto">
                  <div 
                    v-for="collection in collections" 
                    :key="collection.id"
                    class="flex flex-col items-center gap-y-2 p-4 rounded bg-slate-800/30 border border-slate-800 relative" 
                    >
                        <UIcon
                        name="i-lucide-recycle"
                        :class="[
                            'w-14 h-14',
                            {
                            'text-gray-500': collection.status === 'PENDING',
                            'text-sky-500': collection.status === 'ONGOING',
                            'text-emerald-500': collection.status === 'COMPLETED'
                            }
                        ]"
                        />
                        <div class="flex gap-x-2 items-center rounded bg-slate-950 p-1.5 w-full justify-center">
                            <p class="text-xs" v-if="collection.status === 'PENDING'">Collection Schedule Set</p>
                            <p class="text-xs" v-if="collection.status === 'ONGOING'">Collection In Progress</p>
                            <p class="text-xs" v-if="collection.status === 'COMPLETED'">Collection Completed</p>
                        </div>

                        <div class="flex gap-x-2 items-center rounded bg-slate-950 p-1.5 w-full justify-center">
                            <UIcon class="text-amber-400/80" name="i-lucide-calendar-days"/>
                            <p class="text-xs">{{ formatDate2(collection.date) }}</p>
                        </div>

                        <div class="flex gap-x-2 items-center rounded bg-slate-950 p-1.5 w-full justify-center">
                            <UIcon class="text-amber-400/80" name="i-lucide-clock-2"/>
                            <p class="text-xs">{{ collection.from}} -  {{ collection.to }}</p>
                        </div>
                        <div class="flex flex-wrap gap-x-2 items-center rounded bg-slate-950 p-1.5 w-full justify-center">
                            <UIcon class="text-amber-400/80" name="i-lucide-list-checks" />
                            <p class="text-xs rounded p-1" v-for="brgy in collection.barangays" :key="brgy">{{ brgy }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <USlideover title="Edit Account" v-model:open="open" :dismissible="false">
        <template #body>
            <div class="flex flex-col gap-y-2">
                <USelectMenu
                    disabled
                    v-model="form.role"
                    :items="roles"
                    value-key="value"
                    label-key="label"
                    class="w-full"
                    icon="i-lucide-user-key"
                >
                    <template #item-label="{ item }">
                        <div class="flex flex-col">
                            <span>{{ item.label }}</span>
                        </div>
                    </template>
                </USelectMenu>
                <UInput 
                placeholder="Name"
                class="w-full"
                v-model:model-value="form.name"
                />
                <UInput 
                placeholder="Email"
                class="w-full"
                v-model:model-value="form.email"
                />
                <UInput 
                placeholder="Contact Number"
                class="w-full"
                v-model:model-value="form.contact_number"
                />

                <UPopover>
                    <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
                    {{ dateValue ? df.format(dateValue.toDate(getLocalTimeZone())) : 'Select a date' }}
                    </UButton>

                    <template #content>
                    <UCalendar v-model="dateValue" class="p-2" @update:model-value="onDateChange" :max-value="maxDate"/>
                    </template>
                </UPopover>
      

                <UInput
                v-if="form.role !== 'user'"
                v-model="form.password"
                placeholder="New Password"
                :type="show ? 'text' : 'password'"
                :ui="{ trailing: 'pe-1' }"
                >
                    <template #trailing>
                    <UButton
                        color="neutral"
                        variant="link"
                        size="sm"
                        :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                        :aria-label="show ? 'Hide password' : 'Show password'"
                        :aria-pressed="show"
                        aria-controls="password"
                        @click="show = !show"
                    />
                    </template>
                </UInput>
            </div>
        </template>

        <template #footer>
            <UButton 
            @click="onSubmit" 
            label="Save"
            class="flex-1 justify-center"
            />
        </template>
    </USlideover>
</template>

<script lang="ts" setup>
import type { Collections, GarbageReports } from '~/types/auth.model';
import type { ProfileForm } from '~/types/form.model';
import { today, getLocalTimeZone, CalendarDate, type DateValue, DateFormatter } from '@internationalized/date';

const globalStore = useGlobalStore();
const { user } = storeToRefs(globalStore);

const reports = ref<GarbageReports[]>([])
const collections = ref<Collections[]>([])
const open = ref(false)
const show = ref(false)
const maxDate = new CalendarDate(today(getLocalTimeZone()).year, today(getLocalTimeZone()).month, today(getLocalTimeZone()).day)
const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const dateValue = shallowRef<DateValue | null>(
  user.value?.birthdate
    ? (() => {
        const date = new Date(user.value.birthdate)
        return new CalendarDate( date.getFullYear(), date.getMonth() + 1, date.getDate())
      })()
    : maxDate
)

const query = ref({
    page: 1,
    limit: 10,
    total: 0
})

const form = ref<ProfileForm>({
    id: user.value?.id,
    name: user.value?.name ?? '',
    role: user.value?.role ?? 'user',
    password: undefined,
    birthdate: user.value?.birthdate ?? null,
    email: user.value?.email ?? '',
    contact_number: user.value?.contact_number ?? undefined,
})

const roles = [
    {label: 'Admin', value: 'admin'}, 
    {label: 'Driver', value: 'driver'},
    {label: 'End User', value: 'user'}
]

const onDateChange = (v: unknown) => {
    if (!v || Array.isArray(v)) return;

    const date = v as DateValue;

    dateValue.value = date;

    const jsDate = date.toDate(getLocalTimeZone());
    form.value.birthdate = jsDate;
}

const getReportIcon = (report: GarbageReports)=> {
    if(report.status === 'ACTIVE') return 'i-lucide-triangle-alert'
    else if(report.status === 'ASSUMPTION_COLLECTED') return 'i-lucide-circle-question-mark'
    else return 'i-lucide-circle-check'
}

const getReportColor = (report: GarbageReports)=> {
    if(report.status === 'ACTIVE') return 'warning'
    else if(report.status === 'ASSUMPTION_COLLECTED') return 'info'
    else return 'success'
}

const onSubmit = async () => {
    try {
        const { password, ...rest } = form.value
        /* If password is not modified, do not add it to payload to avoid modification */
        await useUsers().updateUsers(form.value.password ? form.value : rest, form.value.id || 0);

        if(user.value){
            user.value.birthdate = form.value.birthdate;
            user.value.contact_number = form.value.contact_number ?? null;
            user.value.email = form.value.email;
            user.value.name = form.value.name
        }

        open.value = false;
    } catch (error) {
        throw error;
    }
}


const getReports = async () => {
   const { data, total } = await useGarbageReports().getGarbageReports({
        query: buildQuery({
            user_id: user.value?.id,
        }),
    });

    reports.value = data;
    query.value.total = total;
}

const getSchedules = async () => {
   const { data } = await useCollections().searchCollectionByLocation({
        lat: user.value?.location?.lat,
        lng: user.value?.location?.lng,
        city: user.value?.location_city ?? '',
        barangay: user.value?.location_barangay ?? '',
    });

    collections.value = data;
}

onBeforeMount(async ()=> {
    await getReports();
    await getSchedules();
})
</script>