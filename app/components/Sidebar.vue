<template>
    <div class="flex flex-col h-full w-64">
        <!-- sidebar content goes here -->
        <div  v-if="user" class="flex gap-x-1 items-center p-4 w-full group">
          <img src="/icon.png" alt="eHakot Logo" class="w-10 h-8 shrink-0"/>
          <div class="flex-1 min-w-0 flex flex-col gap-y-0.5">
            <p class="font-bold text-sm truncate group-hover:text-slate-300 text-slate-400">{{ user?.email }}</p>
            <p class="text-xs italic text-emerald-500">{{ user?.role }}</p>
          </div>
        </div>
        <div v-else class="flex gap-x-1 items-center p-4 w-full group" >
            <img src="/icon.png" alt="eHakot Logo" class="w-10 h-8 shrink-0"/>
          <div class="flex-1 min-w-0 flex flex-col gap-y-0.5">
            <p class="font-bold text-lg text-slate-900 dark:text-slate-100">E-Hakot</p>
            <p class="text-xs italic text-slate-500 dark:text-slate-400">Smart Waste Collection Monitoring System</p>
          </div>
        </div>
        <USeparator />
        <div class="w-64 flex flex-col gap-y-2 p-4">
            <NuxtLink
                v-for="mod in modules"
                :key="mod.to"
                :to="mod.to"
                class="flex items-center gap-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <UIcon :name="mod.icon" class="w-5 h-5" />
                <span>{{ mod.label }}</span>
            </NuxtLink>
        </div>
        <div class="p-4 mt-auto">
        <UButton 
        v-if="user"
        @click="isLogoutModalOpen = true"
        label="Logout"
        icon="i-lucide-log-out"
        color="neutral"
        variant="ghost"
        class="justify-center w-full mt-auto"
        />
        <UButton 
        v-if="!user"
        @click="useRouter().push('/sign-in')"
        label="Sign-In"
        icon="i-lucide-log-in"
        color="neutral"
        variant="ghost"
        class="justify-center w-full mt-auto"
        />
        </div>

        <!-- Logout Confirmation Modal -->
        <UModal v-model:open="isLogoutModalOpen">
          <template #content>
            <UCard>
              <template #header>
                <div class="flex items-center gap-2 text-red-500">
                  <UIcon name="i-lucide-log-out" class="w-6 h-6" />
                  <h3 class="text-lg font-semibold">Confirm Logout</h3>
                </div>
              </template>
              <p class="text-sm text-slate-300">
                Are you sure you want to logout? You will need to sign in again to access your account.
              </p>
              <template #footer>
                <div class="flex justify-end gap-3">
                  <UButton color="neutral" variant="soft" @click="isLogoutModalOpen = false">Cancel</UButton>
                  <UButton color="error" @click="confirmLogout">Logout</UButton>
                </div>
              </template>
            </UCard>
          </template>
        </UModal>
    </div>
</template>

<script lang="ts" setup>
const globalStore = useGlobalStore();
const { user } = storeToRefs(globalStore);

const isLogoutModalOpen = ref(false);

function confirmLogout() {
  isLogoutModalOpen.value = false;
  useAuthStore().logout();
}

interface SidebarModule {
  label: string;
  icon: string;
  to: string;
}

const currentUserRole = computed(() => user.value?.role);

const modules = computed<SidebarModule[]>(() => {
  switch (currentUserRole.value) {
    case 'superadmin':
      return [
        { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
        { label: 'AI Assistant', icon: 'i-lucide-bot', to: '/chat' },
        { label: 'Locations', icon: 'i-lucide-map', to: '/locations' },
        { label: 'Trucks', icon: 'i-lucide-truck', to: '/trucks' },
        { label: 'Employees', icon: 'i-lucide-users', to: '/employees' },
        { label: 'Collections', icon: 'i-lucide-recycle', to: '/collections' },
        { label: 'Tracking Map', icon: 'i-lucide-map-pin-search', to: '/' },
        { label: 'Notifications', icon: 'i-lucide-bell', to: '/notifications' },
        { label: 'Profile', icon: 'i-lucide-circle-user', to: '/profile' },
      ];

    case 'admin':
      return [
        { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
        { label: 'AI Assistant', icon: 'i-lucide-bot', to: '/chat' },
        { label: 'Locations', icon: 'i-lucide-map', to: '/locations' },
        { label: 'Trucks', icon: 'i-lucide-truck', to: '/trucks' },
        { label: 'Employees', icon: 'i-lucide-users', to: '/employees' },
        { label: 'Collections', icon: 'i-lucide-recycle', to: '/collections' },
        { label: 'Tracking Map', icon: 'i-lucide-map-pin-search', to: '/' },
        { label: 'Notifications', icon: 'i-lucide-bell', to: '/notifications' },
        { label: 'Profile', icon: 'i-lucide-circle-user', to: '/profile' },
      ];

    case 'driver':
      return [
        { label: 'Drivers Route', icon: 'i-lucide-route', to: '/route' },
        { label: 'Collections', icon: 'i-lucide-recycle', to: '/collections' },
        { label: 'Tracking Map', icon: 'i-lucide-map-pin-search', to: '/' },
        { label: 'Notifications', icon: 'i-lucide-bell', to: '/notifications' },
        { label: 'Profile', icon: 'i-lucide-circle-user', to: '/profile' },
      ];

    case 'user':
      return [
        { label: 'AI Assistant', icon: 'i-lucide-bot', to: '/chat' },
        { label: 'Tracking Map', icon: 'i-lucide-map-pin-search', to: '/' },
        { label: 'Notifications', icon: 'i-lucide-bell', to: '/notifications' },
        { label: 'Profile', icon: 'i-lucide-circle-user', to: '/profile' },
      ];

    case 'guest':
      return [
        { label: 'Tracking Map', icon: 'i-lucide-map-pin-search', to: '/' },
      ];

    default:
      return [];
  }
});
</script>

