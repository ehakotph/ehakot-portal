<template>
    <div class="flex flex-col h-full w-64">
        <!-- sidebar content goes here -->
        <div class="flex gap-x-1 items-center p-4 w-full group" v-if="user">
          <img src="/icon.png" alt="eHakot Logo" class="w-10 h-8 shrink-0"/>
          <div class="flex-1 min-w-0 flex flex-col gap-y-0.5">
            <p class="font-bold text-sm truncate group-hover:text-slate-300 text-slate-400">{{ user?.email }}</p>
            <p class="text-xs italic text-emerald-500">{{ user?.role }}</p>
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
        @click="useAuthStore().logout()"
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
    </div>
</template>

<script lang="ts" setup>
const globalStore = useGlobalStore();
const { user } = storeToRefs(globalStore);

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

