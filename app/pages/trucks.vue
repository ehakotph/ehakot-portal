<template>
    <Header>
        <UInput 
        placeholder="Search for trucks (plate number, city)"
        class="w-full" size="xl" 
        icon="i-lucide-search"
        v-model="searchQuery"
        />
        <USlideover :title="isEditing ? 'Edit Truck': 'Create New Truck'" v-model:open="open" :dismissible="false">
            <UButton @click="open = true; form.plate_number = ''; isSuperAdmin && (form.city_id = (user?.city_id ?? undefined))" label="Create New Truck" />

            <template #body>
                <div class="flex flex-col gap-y-2">
                    <USelectMenu
                        :disabled="!isSuperAdmin"
                        v-model="form.city_id"
                        :items="cities"
                        value-key="id"
                        label-key="name"
                        class="w-full"
                        icon="i-lucide-building-2"
                    >
                        <template #item-label="{ item }">
                            <div class="flex flex-col">
                                <span>{{ item.name }}</span>
                            </div>
                        </template>
                    </USelectMenu>
                    <UInput 
                    placeholder="Truck plate no."
                    class="w-full"
                    v-model:model-value="form.plate_number"
                    />
                </div>
            </template>

            <template #footer>
                <UButton 
                @click="onSubmit" 
                :disabled="!form.plate_number || !form.city_id || (isEditing && !hasChanges)"
                :label="isEditing ? 'Edit': 'Create'" 
                class="flex-1 justify-center"
                />
            </template>
        </USlideover>
    </Header>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
        <div 
        v-for="truck in trucks" 
        :key="truck.id"
        class="flex flex-col items-center gap-y-2 p-4 rounded bg-slate-800/30 border border-slate-800 relative" 
        >
            <UIcon name="i-lucide-truck" class="w-14 h-14 text-emerald-600" />
            <div class="flex gap-x-2 items-center rounded bg-slate-950 p-1.5 w-full justify-center" >
                <UIcon class="text-amber-400/80" name="i-lucide-id-card" />
                <p class="text-xs">{{ truck.plate_number }}</p>
            </div>
            <div class="flex gap-x-2 items-center rounded bg-slate-950 p-1.5 w-full justify-center" >
                <UIcon class="text-amber-400/80" name="i-lucide-map-pin" />
                <p class="text-xs ">{{ truck.city.name }}</p>
            </div>
            <UButton 
            icon="i-lucide-pencil" variant="ghost" 
            color="neutral" class="opacity-50 hover:opacity-100 absolute right-2 top-2" 
            @click="editing(truck)"
            />
        </div>
    </div>
    <UPagination 
    v-model:page="query.page" 
    :total="query.total" 
    :items-per-page="query.limit"
    class="fixed bottom-4 right-4 z-50 "
    />
</template>

<script lang="ts" setup>
import type { Cities, Trucks } from '~/types/auth.model';
import type { TruckForm } from '~/types/form.model';

const globalStore = useGlobalStore();
const { user } = storeToRefs(globalStore);
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

const searchQuery = ref("");
const open = ref(false)
const isEditing = ref(false)
const cities = ref<Cities[]>([])
const trucks = ref<Trucks[]>([])
const query = ref({
    page: 1,
    limit: 12,
    total: 0
})

const editForm = ref<TruckForm>({
    id: undefined,
    plate_number: '',
    city_id: user.value?.role === 'admin' ? (user.value?.city_id ?? undefined) : undefined,
})

const form = ref<TruckForm>({
    id: undefined,
    plate_number: '',
    city_id: user.value?.role === 'admin' ? (user.value?.city_id ?? undefined) : undefined,
})



const hasChanges = computed(() => {
    return form.value.plate_number.trim() !== editForm.value.plate_number.trim();
});

const isSuperAdmin = computed(() => user.value?.role === 'superadmin');

const onSubmit = async () => {
    try {
        if (isEditing.value) {
            await useTrucks().updateTrucks(form.value, form.value.id || 0);
        } else {
            await useTrucks().createTrucks(form.value);
        }

        open.value = false;
        form.value.plate_number = '';
        form.value.id = undefined; 
        await getTrucks();
    } catch (error) {
        throw error;
    }
}

const editing = (truck: Trucks) => {
    isEditing.value = true;
    open.value = true;

    form.value.plate_number = truck.plate_number;
    form.value.city_id = truck.city_id;
    form.value.id = truck.id;
    
    editForm.value = {
        plate_number: truck.plate_number,
        city_id: truck.city_id,
        id: truck.id
    }
}

const getTrucks = async () => {
    const { data, total } = await useTrucks().getTrucks({
        query: buildQuery({
            page: query.value.page,
            limit: query.value.limit,
            includes: 'city:name',
            searchColumns: 'plate_number,city.name',
            searchKeyword: searchQuery.value,
            city_id: user.value?.role === 'admin' ? 'user.value?.city_id' : undefined
        }),
    });

    trucks.value = data;
    query.value.total = total;
};

watch(query, async () => await getTrucks(), { deep: true });

watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(async () => await getTrucks(), 500);
});

onBeforeMount(async ()=> {
    const { data } = await useCities().getCities({query: 'paginate=false'})
    cities.value = data;
    await getTrucks();
})
</script>