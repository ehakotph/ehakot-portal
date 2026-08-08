<template>
    <Header>
        <UInput 
        placeholder="Search for city or admin email"
        class="w-full" size="xl"
        icon="i-lucide-search"
        />
        <USlideover :title="isEditing ? 'Edit City': 'Create New City'" v-model:open="open" :dismissible="false" v-if="isSuperAdmin">
            <UButton @click="creating" label="Create New City" />

            <template #body>
                <div class="flex flex-col gap-y-2">
                    <UInput
                    placeholder="City name"
                    class="w-full"
                    label="name"
                    v-model:model-value="form.name"
                    />
                </div>
            </template>

            <template #footer>
                <UButton 
                @click="onSubmit" 
                :disabled="!form.name || (isEditing && !hasChanges)"
                :label="isEditing ? 'Edit': 'Create'" 
                class="flex-1 justify-center"
                />
            </template>
        </USlideover>
    </Header>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
        <div 
        v-for="city in cities" 
        :key="city.id"
        class="flex flex-col items-center gap-y-2 p-4 rounded bg-slate-800/30 border border-slate-800 relative" 
        >
            <UIcon name="i-lucide-building-2" class="w-14 h-14 text-emerald-600"/>
            <div class="flex gap-x-2 items-center rounded bg-slate-950 p-1.5 w-full justify-center">
                <p class="text-xs">{{ city.name }}</p>
            </div>
            <UButton 
            icon="i-lucide-eye" variant="ghost" size="sm"
            color="neutral" label="View Barangays"
            class="w-full justify-center"
            @click="useRouter().push(`/locations/${city.id}`)"
            />
            <UButton 
            icon="i-lucide-pencil" variant="ghost" 
            color="neutral" class="opacity-50 hover:opacity-100 absolute right-2 top-2" 
            @click="editing(city)" v-if="isSuperAdmin"
            />
        </div>
    </div>
    <UPagination
    v-model:page="query.page" 
    :total="query.total" 
    :items-per-page="query.limit"
    class="fixed bottom-4 right-4 z-50"
    />
</template>

<script lang="ts" setup>
import type { Cities, User } from '~/types/auth.model';
import type { CityForm } from '~/types/form.model';

const globalStore = useGlobalStore();
const { user } = storeToRefs(globalStore);
const cities = ref<Cities[]>([])
const open = ref(false)
const isEditing = ref(false)
const query = ref({
    page: 1,
    limit: 12,
    total: 0
})

const editForm = ref<CityForm>({
    id: undefined,
    name: '',
})

const form = ref<CityForm>({
    id: undefined,
    name: '',
})

const hasChanges = computed(() => {
    return form.value.name.trim() !== editForm.value.name.trim();
});

const isSuperAdmin = computed(() => user.value?.role === 'superadmin');

const onSubmit = async () => {
    try {
        if (isEditing.value) {
            await useCities().updateCities({...form.value}, form.value.id || 0);
        } else {
            await useCities().createCities({...form.value});
        }

        open.value = false;
        form.value.name = '';
        form.value.id = undefined; 
        await getCities();
    } catch (error) {
        throw error;
    }
}

const creating = () => {
    isEditing.value = false;
    open.value = true;

    form.value.name = '';
    form.value.id = undefined; 
}

const editing = (city: Cities) => {
    isEditing.value = true;
    open.value = true;

    form.value.name = city.name;
    form.value.id = city.id;
    
    editForm.value = {
        name: city.name,
        id: city.id
    }
}

const getCities = async () => {
    const { data, total } = await useCities().getCities({
        query: buildQuery({
            page: query.value.page,
            limit: query.value.limit,
            fields: 'name,id',
            searchKeyword: user.value?.role === 'admin' ? user.value?.city_id : undefined,
            searchColumns: user.value?.role === 'admin' ? 'id' : undefined,
        }),
    });

    cities.value = data;
    query.value.total = total;
};

watch(query, async () => await getCities(), { deep: true });

onBeforeMount(async ()=> {
    await getCities();
})
</script>