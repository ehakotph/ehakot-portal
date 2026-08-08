<template>
    <Header>
        <UInput 
        placeholder="Search for name, role, email"
        class="w-full" size="xl" 
        icon="i-lucide-search"
        />
        <USlideover :title="isEditing ? 'Edit User': 'Create New User'" v-model:open="open" :dismissible="false">
            <UButton @click="open = true; form.role = 'driver'; isEditing = false;" label="Create New User" />

            <template #body>
              Create/Update employees

            </template>
            <template #footer>
                <UButton 
                @click="onSubmit" 
                :disabled="!form.email || !form.role || (isEditing && !hasChanges)"
                :label="isEditing ? 'Edit': 'Create'" 
                class="flex-1 justify-center"
                />
            </template>
        </USlideover>
    </Header>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
        <div 
        v-for="user in users" 
        :key="user.id"
        class="flex flex-col items-center gap-y-2 p-4 rounded bg-slate-800/30 border border-slate-800 relative" 
        >
            <UIcon 
            name="i-lucide-circle-user" class="w-14 h-14"
            :class="{
                'text-gray-500': user.role === 'driver',
                'text-sky-500': user.role === 'admin',
            }"
            />
            <div class="flex gap-x-2 items-center rounded bg-slate-950 p-1.5 w-full justify-center">
                <UIcon class="text-amber-400/80" name="i-lucide-mail"/>
                <p class="text-xs">{{ user.email }}</p>
            </div>
            <div class="flex gap-x-2 items-center rounded bg-slate-950 p-1.5 w-full justify-center">
                <p class="text-xs">{{ user.role }}</p>
            </div>
            <UButton 
            icon="i-lucide-pencil" variant="ghost" 
            color="neutral" class="opacity-50 hover:opacity-100 absolute right-2 top-2" 
            @click="editing(user)"
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
import type { User } from '~/types/auth.model';

const globalStore = useGlobalStore();
const { user } = storeToRefs(globalStore);

const show = ref(false)
const open = ref(false)
const isEditing = ref(false)
const users = ref<User[]>([])
const availableUsers = ref<User[]>([])

const query = ref({
    page: 1,
    limit: 12,
    total: 0
})
const editForm = ref<{id: number | undefined, email: string, password: string, role: 'admin' | 'driver'}>({
    id: undefined,
    email: '',
    password: '',
    role: 'driver'
})

const form = ref<{id: number | undefined, email: string, password: string, role: 'admin' | 'driver'}>({
    id: undefined,
    email: '',
    password: '',
    role: 'driver'
})

const hasChanges = computed(() => {
    return form.value.email.trim() !== editForm.value.email.trim() ||
    form.value.password.trim() !== editForm.value.password.trim() ||
    form.value.role !== editForm.value.role;
});

const isSuperAdmin = computed(() => user.value?.role === 'superadmin');

const onSubmit = async () => {
}

const editing = (user: User) => {
}

const getUsers = async () => {
    const { data, total } = await useUsers().getUsers({
        query: buildQuery({
            page: query.value.page,
            limit: query.value.limit,
            includes: 'city:name',
            searchKeyword: user.value?.role === 'admin' ? user.value?.city_id : undefined,
            searchColumns: user.value?.role === 'admin'? 'city_id': undefined,
            role: user.value?.role === 'admin' ? 'driver' : ['admin', 'driver'],
        }),
    });

    users.value = data;
    query.value.total = total;
};

const getAvailableUsers = async () => {
    const { data } = await useUsers().getUsers({
        query: buildQuery({
            paginate: false,
            role: 'user',
        }),
    });

    availableUsers.value = data;
};

function onEmailChange(email: string) {
  const found = availableUsers.value.find(u => u.email === email)
  if (found) {
    editForm.value.id = found.id;
    form.value.id = found.id;
  }
}

watch(query, async () => await getUsers(), { deep: true });

onBeforeMount(async ()=> {
    await getUsers();
    await getAvailableUsers();
})
</script>