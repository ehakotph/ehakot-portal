<template>
    <Header>
        <UInput 
        placeholder="Search for email"
        class="w-full" size="xl" 
        icon="i-lucide-search"
        v-model="searchQuery"
        />
        <USlideover :title="isEditing ? 'Edit User': 'Create New User'" v-model:open="open" :dismissible="false">
            <UButton @click="open = true; form.role = 'driver'; isEditing = false;" label="Create New User" />

            <template #body>
                <div class="flex flex-col gap-y-2">
                    <USelectMenu
                        v-model="form.email"
                        :items="availableUsers"
                        value-key="email"
                        label-key="email"
                        class="w-full"
                        icon="i-lucide-building-2"
                        @update:model-value="onEmailChange"
                    >
                        <template #item-label="{ item }">
                            <div class="flex flex-col">
                                <span>{{ item.name }}</span>
                            </div>
                        </template>
                    </USelectMenu>

                    <USelectMenu
                        :disabled="!isSuperAdmin"
                        v-model="form.role"
                        :items="[{label: 'Admin', value: 'admin'}, {label: 'Driver', value: 'driver'}]"
                        value-key="value"
                        label-key="label"
                        class="w-full"
                        icon="i-lucide-building-2"
                    >
                        <template #item-label="{ item }">
                            <div class="flex flex-col">
                                <span>{{ item.label }}</span>
                            </div>
                        </template>
                    </USelectMenu>

                    <UInput
                    v-model="form.password"
                    placeholder="Password"
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
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

const searchQuery = ref("");
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
    try {
        await useUsers().setUsers(form.value, form.value.id || 0);

        open.value = false;
        form.value.email = '';
        form.value.password = '';
        form.value.role = 'driver';
        form.value.id = undefined;

        await getUsers();
    } catch (error) {
        throw error;
    }
}

const editing = (user: User) => {
    isEditing.value = true;
    open.value = true;

    form.value.email = user.email;
    form.value.password = user.password ?? '';
    form.value.role = user.role as 'admin' | 'driver';
    form.value.id = user.id;

    editForm.value = {
        id: user.id,
        email: user.email,
        password: user.password ?? '',
        role: user.role as 'admin' | 'driver'
    }
}

const getUsers = async () => {
    const { data, total } = await useUsers().getUsers({
        query: buildQuery({
            page: query.value.page,
            limit: query.value.limit,
            includes: 'city:name',
            searchColumns: 'email',
            searchKeyword: searchQuery.value,
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

watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(async () => await getUsers(), 500);
});

onBeforeMount(async ()=> {
    await getUsers();
    await getAvailableUsers();
})
</script>