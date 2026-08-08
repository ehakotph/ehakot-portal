<template>
    <Header>
        <UInput 
        placeholder="Search for collections (city, barangay, truck)"
        class="w-full" size="xl" 
        icon="i-lucide-search"
        v-model="searchQuery"
        />
        <USlideover :title="isEditing ? 'Edit Collection': 'Create New Collection'" v-model:open="open" :dismissible="false">
            <UButton @click="creating" label="Create New Collection" />
            <template #body>
                <div class="flex flex-col gap-y-2">
                    <UCalendar :model-value="dateValue" @update:model-value="onDateChange" :min-value="minDate" />
                    <UInputTime range v-model="timeValue" @update:model-value="onTimeChange" class="justify-center" />
                    <USelectMenu
                        :disabled="!isSuperAdmin"
                        v-model="form.city_id"
                        :items="cities"
                        value-key="id"
                        label-key="name"
                        class="w-full"
                        icon="i-lucide-building-2"
                        @update:model-value="onCityChange"
                        required
                    >
                        <template #item-label="{ item }">
                            <div class="flex flex-col">
                                <span>{{ item.name }}</span>
                            </div>
                        </template>
                    </USelectMenu>

                    <USelectMenu
                        v-if="form.city_id"
                        v-model="form.barangays"
                        value-key="name"
                        label-key="name"
                        multiple
                        :items="barangays"
                        class="w-full"
                        icon="i-lucide-building-2"
                        required
                    >
                        <template #item-label="{ item }">
                            <div class="flex flex-col">
                                <span>{{ item.name }}</span>
                            </div>
                        </template>
                    </USelectMenu>

                    <USelectMenu
                        v-if="form.city_id"
                        v-model="form.truck_id"
                        value-key="id"
                        label-key="plate_number"
                        :items="trucks"
                        class="w-full"
                        icon="i-lucide-truck"
                    >
                        <template #item-label="{ item }">
                            <div class="flex flex-col">
                                <span>{{ item.plate_number }}</span>
                            </div>
                        </template>
                    </USelectMenu>

                    <USelectMenu
                        v-if="form.city_id"
                        v-model="form.driver_id"
                        value-key="id"
                        label-key="email"
                        :items="drivers"
                        class="w-full"
                        icon="i-lucide-user"
                    >
                        <template #item-label="{ item }">
                            <div class="flex flex-col">
                                <span>{{ item.email }}</span>
                            </div>
                        </template>
                    </USelectMenu>
                </div>
            </template>

            <template #footer>
                <div class="flex flex-col gap-y-2 w-full">
                    <UButton 
                    @click="onSubmit" 
                    :disabled="!form.status || !form.city_id || !form.barangays.length || !form.from || !form.to || (isEditing && !hasChanges)"
                    :label="isEditing ? 'Edit': 'Create'" 
                    class="flex-1 justify-center"
                    />
                </div>
            </template>
        </USlideover>

        <USlideover title="Bulk Collection Template" v-model:open="bulkOpen" :dismissible="false">
            <template #body>
                <div class="flex flex-col gap-y-2">
                    <UCalendar v-model="bulkDateValue" multiple :min-value="minDate" />
                    <UInputTime range v-model="timeValue" @update:model-value="onTimeChange" class="justify-center" />
                    <USelectMenu
                        :disabled="!isSuperAdmin"
                        v-model="bulkForm.city_id"
                        :items="cities"
                        value-key="id"
                        label-key="name"
                        class="w-full"
                        icon="i-lucide-building-2"
                        @update:model-value="onCityChange"
                        required
                    >
                        <template #item-label="{ item }">
                            <div class="flex flex-col">
                                <span>{{ item.name }}</span>
                            </div>
                        </template>
                    </USelectMenu>

                    <USelectMenu
                        v-if="bulkForm.city_id"
                        v-model="bulkForm.barangays"
                        value-key="name"
                        label-key="name"
                        multiple
                        :items="barangays"
                        class="w-full"
                        icon="i-lucide-building-2"
                        required
                    >
                        <template #item-label="{ item }">
                            <div class="flex flex-col">
                                <span>{{ item.name }}</span>
                            </div>
                        </template>
                    </USelectMenu>

                    <USelectMenu
                        v-if="bulkForm.city_id"
                        v-model="bulkForm.truck_id"
                        value-key="id"
                        label-key="plate_number"
                        :items="trucks"
                        class="w-full"
                        icon="i-lucide-truck"
                    >
                        <template #item-label="{ item }">
                            <div class="flex flex-col">
                                <span>{{ item.plate_number }}</span>
                            </div>
                        </template>
                    </USelectMenu>

                    <USelectMenu
                        v-if="bulkForm.city_id"
                        v-model="bulkForm.driver_id"
                        value-key="id"
                        label-key="email"
                        :items="drivers"
                        class="w-full"
                        icon="i-lucide-user"
                    >
                        <template #item-label="{ item }">
                            <div class="flex flex-col">
                                <span>{{ item.email }}</span>
                            </div>
                        </template>
                    </USelectMenu>
                </div>
            </template>

            <template #footer>
                <div class="flex flex-col gap-y-2 w-full">
                    <UButton 
                    @click="submitBulkForm" 
                    :disabled="!bulkForm.status || !bulkForm.city_id || !bulkForm.barangays.length || !bulkForm.from || !bulkForm.to"
                    label="Set Bulk Collection" 
                    class="flex-1 justify-center"
                    />
                </div>
            </template>
        </USlideover>
    </Header>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
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
                <UIcon class="text-amber-400/80" name="i-lucide-building-2"/>
                <p class="text-xs">{{ collection.city?.name }}</p>
            </div>
            <div class="flex flex-wrap gap-x-2 items-center rounded bg-slate-950 p-1.5 w-full justify-center">
                <UIcon class="text-amber-400/80" name="i-lucide-list-checks" />
                <p class="text-xs rounded p-1" v-for="brgy in collection.barangays" :key="brgy">{{ brgy }}</p>
            </div>
            <div class="flex gap-x-2 items-center rounded bg-slate-950 p-1.5 w-full justify-center">
                <UIcon class="text-amber-400/80" name="i-lucide-truck" />
                <p class="text-xs" v-if="collection.truck?.plate_number">{{ collection.truck?.plate_number }}</p>
                <p class="text-xs text-muted" v-else>No truck assigned</p>
            </div>
            <div class="flex gap-x-2 items-center rounded bg-slate-950 p-1.5 w-full justify-center">
                <UIcon class="text-amber-400/80" name="i-lucide-circle-user-round" />
                <p class="text-xs" v-if="collection.driver?.email">{{ collection.driver?.email }}</p>
                <p class="text-xs text-muted" v-else>No driver assigned</p>
            </div>
  
            <UButton 
                icon="i-lucide-book-dashed" variant="subtle"
                class="w-full justify-center text-xs" label="Use Template"
                @click="usingTemplate(collection)"
            />

            <UButton 
            icon="i-lucide-pencil" variant="ghost" v-if="collection.status === 'PENDING'"
            color="neutral" class="opacity-50 hover:opacity-100 absolute right-2 top-2" 
            @click="editing(collection)"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { Barangays, Cities, Collections, Trucks, User } from '~/types/auth.model';
import type { BulkCollectionsForm, CollectionsForm } from '~/types/form.model';
import { today, getLocalTimeZone, CalendarDate, type DateValue, Time } from '@internationalized/date';

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
const minDate = today(getLocalTimeZone());
const globalStore = useGlobalStore();
const { user } = storeToRefs(globalStore);

const open = ref(false)
const bulkOpen = ref(false)
const isEditing = ref(false)
const collections = ref<Collections[]>([])
const cities = ref<Cities[]>([])
const drivers = ref<User[]>([])
const trucks = ref<Trucks[]>([])
const barangays = ref<Barangays[]>([])
const searchQuery = ref("");

const dateValue = shallowRef<DateValue | null>(new CalendarDate(today(getLocalTimeZone()).year, today(getLocalTimeZone()).month, today(getLocalTimeZone()).day));
const bulkDateValue = shallowRef<DateValue[]>([new CalendarDate(today(getLocalTimeZone()).year, today(getLocalTimeZone()).month, today(getLocalTimeZone()).day)]);
const timeValue = shallowRef({ start: new Time(8, 0, 0), end: new Time(17, 0, 0) })

const editForm = ref<CollectionsForm>({
    id: undefined,
    status: 'PENDING',
    city_id: user.value?.role === 'admin' ? (user.value?.city_id ?? undefined) : undefined,
    driver_id: undefined,
    truck_id: undefined,
    date: new Date(),
    barangays: [],
    date_of_week: getWeekDayNumber(new Date()),
    from: formatTime24(new Time(8,0,0)),
    to: formatTime24(new Time(17,0,0))
})

const form = ref<CollectionsForm>({
    id: undefined,
    status: 'PENDING',
    city_id: user.value?.role === 'admin' ? (user.value?.city_id ?? undefined) : undefined,
    driver_id: undefined,
    truck_id: undefined,
    date: new Date(),
    barangays: [],
    date_of_week: getWeekDayNumber(new Date()),
    from: formatTime24(new Time(8,0,0)),
    to: formatTime24(new Time(17,0,0))
})

const bulkForm = ref<BulkCollectionsForm>({
    id: undefined,
    status: 'PENDING',
    city_id: user.value?.role === 'admin' ? (user.value?.city_id ?? undefined) : undefined,
    driver_id: undefined,
    truck_id: undefined,
    barangays: [],
    dates: [new Date()],
    from: formatTime24(new Time(8,0,0)),
    to: formatTime24(new Time(17,0,0))
})

const hasChanges = computed(() => {
    return form.value.status.trim() !== editForm.value.status.trim() || form.value.city_id !== editForm.value.city_id
    || form.value.driver_id !== editForm.value.driver_id || form.value.truck_id !== editForm.value.truck_id || form.value.date !== editForm.value.date ||
    form.value.barangays.length !== editForm.value.barangays.length || !form.value.barangays.every((brgy) => editForm.value.barangays.includes(brgy)) ||
    form.value.from !== editForm.value.from || form.value.to !== editForm.value.to;
});

const isSuperAdmin = computed(() => user.value?.role === 'superadmin');

const onSubmit = async () => {
    try {
        if (isEditing.value) {
            await useCollections().updateCollections(form.value, form.value.id || 0);
        } else {
            await useCollections().createCollections(form.value);
        }

        open.value = false;
        form.value.id = undefined; 
        form.value.status = 'PENDING';
        form.value.city_id = user.value?.role === 'admin' ? (user.value?.city_id ?? undefined) : undefined;
        form.value.driver_id = undefined;
        form.value.truck_id = undefined;
        form.value.date = new Date();
        form.value.date_of_week = getWeekDayNumber(new Date());
        form.value.barangays = [];


        await getCollections();
    } catch (error) {
        throw error;
    }
}

const submitBulkForm = async ()=> {
    try {
        await useCollections().createCollections(bulkForm.value);

        bulkOpen.value = false;
        bulkForm.value.id = undefined; 
        bulkForm.value.status = 'PENDING';
        bulkForm.value.city_id = user.value?.role === 'admin' ? (user.value?.city_id ?? undefined) : undefined;
        bulkForm.value.driver_id = undefined;
        bulkForm.value.truck_id = undefined;
        bulkForm.value.dates = [];
        bulkForm.value.barangays = [];

        await getCollections();
    } catch (error) {
        throw error;
    }
}

const creating = () => {
    isEditing.value = false;
    open.value = true;

    form.value.city_id = user.value?.role === 'admin' ? (user.value?.city_id ?? undefined) : undefined;
    form.value.status = 'PENDING';
    form.value.driver_id = undefined;
    form.value.truck_id = undefined;
    form.value.date = new Date();
    form.value.date_of_week = getWeekDayNumber(new Date());
    form.value.barangays = [];
}

const editing = async (collection: Collections) => {
    isEditing.value = true;
    open.value = true;

    form.value.id = collection.id;
    form.value.status = collection.status;
    form.value.city_id = collection.city_id;
    form.value.driver_id = collection.driver_id;
    form.value.truck_id = collection.truck_id;
    form.value.date = collection.date;
    form.value.date_of_week = collection.date_of_week;
    form.value.barangays = collection.barangays;
    form.value.from = collection.from;
    form.value.to = collection.to;
    
    timeValue.value = { start: parseTime(collection.from), end: parseTime(collection.to)}
    
    editForm.value = {
        id: collection.id,
        status: collection.status,
        city_id: collection.city_id,
        driver_id: collection.driver_id,
        truck_id: collection.truck_id,
        date: collection.date,
        date_of_week: collection.date_of_week,
        barangays: collection.barangays,
        from: collection.from,
        to: collection.to
    }

    
    await Promise.all([
        getBarangays({ city_id: user.value?.city_id }),
        getDrivers({ city_id: user.value?.city_id }),
        getTrucks({ city_id: user.value?.city_id })
    ]);
}

const usingTemplate = async (collection: Collections)=> {
    bulkOpen.value = true;
    bulkForm.value = {
        id: collection.id,
        status: 'PENDING',
        city_id: collection.city_id,
        driver_id: collection.driver_id,
        truck_id: collection.truck_id,
        dates: [collection.date],
        barangays: collection.barangays,
        from: collection.from,
        to: collection.to
    }

    await Promise.all([
        getBarangays({ city_id: user.value?.city_id }),
        getDrivers({ city_id: user.value?.city_id }),
        getTrucks({ city_id: user.value?.city_id })
    ]);
}

const onDateChange = (v: unknown) => {
    if (!v || Array.isArray(v)) return;

    const date = v as DateValue;

    dateValue.value = date;

    const jsDate = date.toDate(getLocalTimeZone());
    form.value.date = jsDate;
    form.value.date_of_week = getWeekDayNumber(jsDate);
}

const onTimeChange = (v: any) => {
    if(open.value){
        if (!v) {
            form.value.from = undefined;
            form.value.to = undefined;
            return;
        }

        form.value.from = formatTime24(v.start);
        form.value.to = formatTime24(v.end);
    } else {
        if (!v) {
            bulkForm.value.from = undefined;
            bulkForm.value.to = undefined;
            return;
        }

        bulkForm.value.from = formatTime24(v.start);
        bulkForm.value.to = formatTime24(v.end);
    }
};

const onCityChange = async() => {
    barangays.value = [];
    form.value.barangays = [];
    form.value.truck_id = undefined;
    form.value.driver_id = undefined;

    bulkForm.value.barangays = [];
    bulkForm.value.truck_id = undefined;
    bulkForm.value.driver_id = undefined;

    await Promise.all([
        getBarangays({city_id: form.value.city_id}),
        getDrivers({city_id: form.value.city_id}),
        getTrucks({city_id: form.value.city_id}),
    ])
}

const getCollections = async () => {
   const { data } = await useCollections().getCollections({
        query: buildQuery({
            searchColumns: 'city.name,barangays,truck.plate_number',
            searchKeyword: searchQuery.value,
            paginate: false,
            city_id: user.value?.role === 'admin' ? user.value?.city_id : undefined,
            includes: 'city:name,truck:plate_number,driver:email'
        }),
    });

    collections.value = data;
}

const getTrucks = async (query: {}) => {
   const { data } = await useTrucks().getTrucks({
        query: buildQuery({
            ...query,
            paginate: false,
            fields: 'plate_number,id',
        }),
    });

    trucks.value = data;
}

const getDrivers = async (query: {}) => {
   const { data } = await useUsers().getUsers({
        query: buildQuery({
            ...query,
            paginate: false,
            fields: 'email,id',
            role: 'driver',
        }),
    });

    drivers.value = data;
}

const getBarangays = async (query: {}) => {
    const { data, total } = await useBarangays().getBarangays({
        query: buildQuery({
            ...query,
            paginate: false,
        }),
    });
    barangays.value = data;
}


watch(bulkDateValue, (dates) => {
    bulkForm.value.dates = dates.map((date) => {
        return date.toDate(getLocalTimeZone());
    });
}, { immediate: true });

watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(async () => await getCollections(), 500);
});

onBeforeMount(async ()=> {
    await getCollections();
    const { data: city } = await useCities().getCities({query: 'paginate=false'})
    cities.value = city;

    if(user.value?.role === 'admin') {
        await Promise.all([
         getBarangays({city_id: user.value?.city_id}),
         getDrivers({city_id: user.value?.city_id}),
         getTrucks({city_id: user.value?.city_id}),
        ])
    }
})
</script>