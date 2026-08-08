<template>
  <div class="flex flex-col flex-1">
    <Header>
      <div class="flex items-center justify-between gap-4 w-full">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-slate-100">Notifications</h1>
          <UBadge v-if="unreadCount > 0" color="warning" variant="subtle" size="sm">
            {{ unreadCount }} unread
          </UBadge>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            v-if="unreadCount > 0"
            color="neutral"
            variant="outline"
            icon="i-lucide-check-check"
            size="sm"
            :loading="markingAll"
            title="Mark all as read"
            aria-label="Mark all as read"
            @click="handleMarkAllAsRead"
          >
            <span class="hidden sm:inline">Mark all as read</span>
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-refresh-cw"
            size="sm"
            :loading="loading"
            @click="fetchNotifications"
          />
        </div>
      </div>
    </Header>

    <div class="p-6 max-w-5xl w-full mx-auto flex flex-col gap-y-6">

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col gap-y-3">
      <div v-for="i in 4" :key="i" class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 animate-pulse flex gap-4">
        <div class="w-10 h-10 rounded-lg bg-slate-800 shrink-0"></div>
        <div class="flex-1 space-y-2 py-1">
          <div class="h-4 bg-slate-800 rounded w-1/3"></div>
          <div class="h-3 bg-slate-800/60 rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- All Notifications List -->
    <div v-else-if="notifications.length > 0" class="flex flex-col gap-y-3">
      <div
        v-for="item in notifications"
        :key="item.id"
        class="group p-4 md:p-5 rounded-xl border transition-all duration-200 flex items-start gap-4"
        :class="[
          isRead(item)
            ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
            : 'bg-slate-900 border-slate-700 text-slate-100 shadow-md ring-1 ring-emerald-500/30'
        ]"
      >
        <!-- Category Icon -->
        <div 
          class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          :class="isRead(item) ? 'bg-slate-800/50 text-slate-500' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'"
        >
          <UIcon :name="getNotificationIcon(item)" class="w-5 h-5" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <h3 
              class="text-sm font-semibold leading-tight"
              :class="isRead(item) ? 'text-slate-300' : 'text-slate-100'"
            >
              {{ item.title }}
            </h3>
            <UBadge 
              v-if="item.type" 
              size="xs" 
              color="neutral" 
              variant="subtle" 
              class="capitalize text-[10px]"
            >
              {{ item.type }}
            </UBadge>
          </div>

          <p class="text-xs leading-relaxed break-words" :class="isRead(item) ? 'text-slate-500' : 'text-slate-300'">
            {{ item.description }}
          </p>

          <div class="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
            <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
            <span>{{ formatRelativeTime(item.created_at) }}</span>
            <span>•</span>
            <span>{{ formatDate(item.created_at) }}</span>
          </div>
        </div>

        <div class="shrink-0 self-center">
          <UButton
            v-if="!isRead(item)"
            color="primary"
            variant="soft"
            size="xs"
            icon="i-lucide-check"
            title="Mark as read"
            aria-label="Mark as read"
            @click="handleMarkAsRead(item.id)"
          >
            <span class="hidden sm:inline">Mark as read</span>
          </UButton>
          <UBadge
            v-else
            color="neutral"
            variant="subtle"
            size="xs"
            class="text-slate-500 gap-1 opacity-75"
          >
            <UIcon name="i-lucide-check-check" class="w-3 h-3" />
            <span class="hidden sm:inline">Read</span>
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-else 
      class="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-900/30 rounded-xl border border-slate-800"
    >
      <div class="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
        <UIcon name="i-lucide-bell-off" class="w-7 h-7" />
      </div>
      <p class="text-sm font-semibold text-slate-200">No notifications</p>
      <p class="text-xs text-slate-500 max-w-xs mt-1">
        You're all caught up! You have no notifications right now.
      </p>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import type { Notifications } from '~/types/auth.model';

const globalStore = useGlobalStore();
const { user } = storeToRefs(globalStore);
const { getNotifications, markAsRead } = useNotifications();

const notifications = ref<Notifications[]>([]);
const loading = ref(true);
const markingAll = ref(false);

const isRead = (n: Notifications) => Boolean(n.read_at || n.readAt);

const unreadCount = computed(() => {
  return notifications.value.filter(n => !isRead(n)).length;
});

const fetchNotifications = async () => {
  loading.value = true;
  try {
    const res = await getNotifications(user.value?.id);
    if (Array.isArray(res)) {
      notifications.value = res;
    } else if (res && Array.isArray((res as any).data)) {
      notifications.value = (res as any).data;
    } else {
      notifications.value = [];
    }
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    notifications.value = [];
  } finally {
    loading.value = false;
  }
};

const handleMarkAsRead = async (id: number) => {
  const item = notifications.value.find(n => n.id === id);
  if (item && !isRead(item)) {
    const now = new Date().toISOString();
    item.read_at = now;
    item.readAt = now;
    try {
      await markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }
};

const handleMarkAllAsRead = async () => {
  markingAll.value = true;
  const unreadItems = notifications.value.filter(n => !isRead(n));
  try {
    await Promise.all(unreadItems.map(item => handleMarkAsRead(item.id)));
  } finally {
    markingAll.value = false;
  }
};

const getNotificationIcon = (item: Notifications) => {
  const text = `${item.title || ''} ${item.type || ''}`.toLowerCase();
  if (text.includes('collection') || text.includes('schedule') || text.includes('truck')) {
    return 'i-lucide-truck';
  }
  if (text.includes('report') || text.includes('warning') || text.includes('alert') || text.includes('issue')) {
    return 'i-lucide-alert-triangle';
  }
  if (text.includes('complete') || text.includes('success') || text.includes('resolved')) {
    return 'i-lucide-check-circle';
  }
  return 'i-lucide-bell';
};

const formatRelativeTime = (dateInput: Date | string) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const formatDate = (dateInput: Date | string) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchNotifications();
});
</script>