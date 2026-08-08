<template>
    <Header>
        <UInput 
        placeholder="Search for collections (plate number, city)"
        class="w-full" size="xl" 
        icon="i-lucide-search"
        />
        <USlideover :title="isEditing ? 'Edit Collection': 'Create New Collection'" v-model:open="open" :dismissible="false">
            <UButton @click="creating" label="Create New Collection" />
            <template #body>
              create update of collections

            </template>

            <template #footer>
                <div class="flex flex-col gap-y-2 w-full">
                    <UButton 
                    @click="onSubmit" 
                    :label="isEditing ? 'Edit': 'Create'" 
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
            icon="i-lucide-pencil" variant="ghost" v-if="collection.status === 'PENDING'"
            color="neutral" class="opacity-50 hover:opacity-100 absolute right-2 top-2" 
            @click="editing(collection)"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { Barangays, Cities, Collections, Trucks, User } from '~/types/auth.model';
import type { CollectionsForm } from '~/types/form.model';


const globalStore = useGlobalStore();
const { user } = storeToRefs(globalStore);

const open = ref(false)
const isEditing = ref(false)
const collections = ref<Collections[]>([])
const cities = ref<Cities[]>([])
const drivers = ref<User[]>([])
const trucks = ref<Trucks[]>([])
const barangays = ref<Barangays[]>([])
const isSuperAdmin = computed(() => user.value?.role === 'superadmin');

const onSubmit = async () => {
}

const creating = () => {
}

const editing = async (collection: Collections) => {
}

const getCollections = async () => {
   const { data } = await useCollections().getCollections({
        query: buildQuery({
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