<template>
    <Header>
        <UInput 
        placeholder="Search for brgy name"
        class="w-full" size="xl" 
        icon="i-lucide-search"
        />
        <USlideover :title="isEditing ? 'Edit Barangay': 'Create New Barangay'" v-model:open="open" :dismissible="false" v-if="isSuperAdmin">
            <UButton @click="creating" label="Create New Barangay" />

            <template #body>
                <div class="flex flex-col gap-y-2">
                    <UInput 
                    placeholder="Barangay name"
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
        v-for="brgy in barangays" 
        :key="brgy.id"
        class="flex flex-col items-center gap-y-2 p-4 rounded bg-slate-800/30 border border-slate-800 relative" 
        >
            <UIcon name="i-lucide-building-2" class="w-14 h-14 text-emerald-600"/>
            <div class="flex gap-x-2 items-center rounded bg-slate-950 p-1.5 w-full justify-center">
                <p class="text-xs">{{ brgy.name }}</p>
            </div>
            <UButton 
            icon="i-lucide-pencil" variant="ghost" 
            color="neutral" class="opacity-50 hover:opacity-100 absolute right-2 top-2" 
            @click="editing(brgy)" v-if="isSuperAdmin"
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
import type { Barangays } from '~/types/auth.model';
import type { BarangayForm } from '~/types/form.model';

const globalStore = useGlobalStore();
const { user } = storeToRefs(globalStore);
const route = useRoute();

const barangays = ref<Barangays[]>([])
const open = ref(false)
const query = ref({
    page: 1,
    limit: 12,
    total: 0
})
const isEditing = ref(false)

const editForm = ref<BarangayForm>({
    id: undefined,
    name: '',
    city_id: undefined
})

const form = ref<BarangayForm>({
    id: undefined,
    name: '',
    city_id: undefined
})

const hasChanges = computed(() => {
    return form.value.name.trim() !== editForm.value.name.trim();
});

const cityId = computed(() => route.params.cityId as string);
const isSuperAdmin = computed(() => user.value?.role === 'superadmin');

const onSubmit = async () => {
    try {
        if (isEditing.value) {
            await useBarangays().updateBarangays({...form.value}, form.value.id || 0);
        } else {
            await useBarangays().createBarangays({...form.value});
        }

        open.value = false;
        form.value.name = '';
        form.value.city_id = cityId.value ? Number(cityId.value) : undefined;
        form.value.id = undefined; 

        await getBarangays();
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

const editing = (brgy: Barangays) => {
    isEditing.value = true;
    open.value = true;

    form.value.name = brgy.name;
    form.value.id = brgy.id;
    
    editForm.value = {
        name: brgy.name,
        id: brgy.id,
        city_id: cityId.value ? Number(cityId.value) : undefined
    }
}

const getBarangays = async () => {
    const { data, total } = await useBarangays().getBarangays({
        query: buildQuery({
            page: query.value.page,
            limit: query.value.limit,
            city_id: user.value?.role === 'admin' ? cityId.value : undefined
        }),
    });
    barangays.value = data;
    query.value.total = total;
}


watch(query, async () => await getBarangays(), { deep: true });

onBeforeMount(async ()=> {
    await getBarangays();
    form.value.city_id = cityId.value ? Number(cityId.value) : undefined
})
</script>