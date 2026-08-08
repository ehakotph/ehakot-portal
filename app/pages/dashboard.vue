<template>
  <div class="flex sm:flex-row flex-col gap-2 p-4">
    <div class="sm:w-[80%] w-full flex flex-col gap-y-2">
      <USelectMenu
          v-if="user && user.role === 'superadmin'"
          v-model="selectedCity"
          :items="cities_opt"
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
      <p class="text-lg font-bold text-white">Trash Report Map</p>
      <div class="flex-1 w-full rounded-lg overflow-hidden border border-slate-700">
        <Heatmap />
      </div>

      <div class="mt-4">
        <!-- Collections Bar Chart -->
        <div class="p-4 bg-slate-900 rounded-lg border border-slate-700">
          <p class="text-md font-bold text-white mb-4">Collection Status</p>
          <BarChart
            :data="collectionsChartData"
            :height="250"
            :categories="collectionsCategories"
            :y-axis="['Pending', 'Ongoing', 'Completed']"
            :x-formatter="() => ''"
            :y-formatter="(tick: number) => tick.toString()"
          />
        </div>
      </div>
    </div>

    <div class="px-4 pt-4 flex flex-col gap-y-4 sm:w-[20%] w-full">
      <div class="flex flex-col gap-y-2">
        <p class="text-lg font-bold text-white">Collections</p>
        <SummaryCard 
          title="Total Collections" 
          :value="collections.length" 
          :onClick="()=> useRouter().push('locations')"
          value-color="text-amber-500"
        />
        <SummaryCard 
          title="Total Trucks" 
          :value="trucks.length" 
          :onClick="()=> useRouter().push('/trucks')"
          value-color="text-amber-500"
        />
        
        <SummaryCard 
          title="Total Reports" 
          :value="rawGarbageReports.length" 
          :onClick="()=> useRouter().push('/')"
          value-color="text-amber-500"
        />
      </div>

      <div class="flex flex-col gap-y-2">
        <p class="text-lg font-bold text-white">Locations</p>
        <SummaryCard 
          title="Total Cities" 
          :value="cities.length" 
          :onClick="()=> useRouter().push('/locations')"
          value-color="text-violet-500"
        />
        <SummaryCard 
          title="Total Barangays" 
          :value="barangays.length" 
          :onClick="()=> useRouter().push('/locations')"
          value-color="text-violet-500"
        />
      </div>
  
      <div class="flex flex-col gap-y-2">
        <p class="text-lg font-bold text-white">Users</p>
          <SummaryCard 
            title="Total Admin" 
            :value="admins.length" 
            :onClick="()=> useRouter().push('/employee')"
            value-color="text-sky-500"
          />
          <SummaryCard 
            title="Total Drivers" 
            :value="drivers.length" 
            :onClick="()=> useRouter().push('/employee')"
            value-color="text-sky-500"
          />
          <SummaryCard 
            title="Total Users" 
            :value="users.length" 
            :onClick="()=> useRouter().push('/employee')"
            value-color="text-sky-500"
          />
      </div>
    </div>
  </div>
  
  <div class="px-4 pb-4 grid sm:grid-cols-2 grid-cols-1 gap-4">
    <div class="p-4 bg-slate-900 rounded-lg border border-slate-700">
      <p class="text-md font-bold text-white mb-4">Garbage Reports Status</p>
      <BarChart
        :data="garbageReportsChartData"
        :height="250"
        :categories="garbageReportsCategories"
        :y-axis="['Active', 'Assumption Collected', 'Collected']"
        :x-formatter="() => ''"
        :y-formatter="(tick: number) => tick.toString()"
      />
    </div>

    <div class="p-4 bg-slate-900 rounded-lg border border-slate-700">
      <p class="text-md font-bold text-white mb-4">Resources per City</p>
      <BarChart
        :data="perCityChartData"
        :height="250"
        :categories="perCityCategories"
        :y-axis="['Trucks', 'Drivers']"
        :x-formatter="(tick: number) => perCityChartData[tick]?.name || ''"
        :y-formatter="(tick: number) => tick.toString()"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Barangays, Cities, Collections, Trucks, User, GarbageReports } from '~/types/auth.model';

const globalStore = useGlobalStore();
const { user, reports } = storeToRefs(globalStore);

const selectedCity = ref<number | undefined>(undefined)
const cities_opt = ref<Cities[]>([])
const cities = ref<Cities[]>([])
const barangays = ref<Barangays[]>([])
const collections = ref<Collections[]>([])
const trucks = ref<Trucks[]>([])
const admins = ref<User[]>([])
const users = ref<User[]>([])
const drivers = ref<User[]>([])
const rawGarbageReports = ref<GarbageReports[]>([])

const getCities = async () => {
   const { data } = await useCities().getCities({
        query: buildQuery({
            paginate: false,
            fields: 'name,id',
            id: user.value?.role === 'admin' ? user.value?.city_id : selectedCity.value
        }),
    });

    cities.value = data;
}

const getCitiesOpt = async () => {
   const { data } = await useCities().getCities({
        query: buildQuery({
            paginate: false,
            fields: 'name,id',
            id: user.value?.role === 'admin' ? user.value?.city_id : undefined
        }),
    });

    cities_opt.value = data;
}

const getBarangays = async () => {
   const { data } = await useBarangays().getBarangays({
        query: buildQuery({
            paginate: false,
            fields: 'name,id',
            city_id: user.value?.role === 'admin' ? user.value?.city_id : selectedCity.value
        }),
    });

    barangays.value = data;
}

const getCollections = async () => {
   const { data } = await useCollections().getCollections({
        query: buildQuery({
            paginate: false,
            fields: 'city_id,id,status',
            city_id: user.value?.role === 'admin' ? user.value?.city_id : selectedCity.value
        }),
    });

    collections.value = data;
}

const getTrucks = async () => {
   const { data } = await useTrucks().getTrucks({
        query: buildQuery({
            paginate: false,
            fields: 'plate_number,id,city_id',
            city_id: user.value?.role === 'admin' ? user.value?.city_id : selectedCity.value
        }),
    });

    trucks.value = data;
}

const getAdmins = async () => {
   const { data } = await useUsers().getUsers({
        query: buildQuery({
            paginate: false,
            fields: 'email,id',
            city_id: user.value?.role === 'admin' ? user.value?.city_id : selectedCity.value,
            role: 'admin'
        }),
    });

    admins.value = data;
}

const getUsers = async () => {
   const { data } = await useUsers().getUsers({
        query: buildQuery({
            paginate: false,
            fields: 'email,id',
            city_id: user.value?.role === 'admin' ? user.value?.city_id : selectedCity.value,
        }),
    });

    users.value = data;
}

const getDrivers = async () => {
   const { data } = await useUsers().getUsers({
        query: buildQuery({
            paginate: false,
            fields: 'email,id,city_id',
            city_id: user.value?.role === 'admin' ? user.value?.city_id : selectedCity.value,
            role: 'driver'
        }),
    });

    drivers.value = data;
}

const getReports = async () => {
   const { data } = await useGarbageReports().getReports({
        query: buildQuery({
            paginate: false,
            city_id: user.value?.role === 'admin' ? user.value?.city_id : selectedCity.value,
        }),
    });

    reports.value = data;
}

const getRawGarbageReports = async () => {
    const {data} = await useGarbageReports().getGarbageReports({
        query: buildQuery({
            paginate: false,
            location_city: user.value?.role === 'admin' ? user.value?.city_id : cities_opt.value.find(e => e.id == selectedCity.value)?.name
        }),
    });

    rawGarbageReports.value = data;
}

const collectionsChartData = computed(() => {
  const pending = collections.value.filter(c => c.status === 'PENDING').length;
  const ongoing = collections.value.filter(c => c.status === 'ONGOING').length;
  const completed = collections.value.filter(c => c.status === 'COMPLETED').length;
  return [
    { name: 'Collections', Pending: pending, Ongoing: ongoing, Completed: completed }
  ]
})

const collectionsCategories = computed(() => ({
  Pending: { name: 'Pending', color: '#f59e0b' },
  Ongoing: { name: 'Ongoing', color: '#3b82f6' },
  Completed: { name: 'Completed', color: '#10b981' },
}))

const rolesChartData = computed(() => [
  { name: 'Roles', Admins: admins.value.length, Drivers: drivers.value.length, Users: users.value.length }
])

const rolesCategories = computed(() => ({
  Admins: { name: 'Admins', color: '#8b5cf6' },
  Drivers: { name: 'Drivers', color: '#ef4444' },
  Users: { name: 'Users', color: '#06b6d4' },
}))

const garbageReportsChartData = computed(() => {
  const active = rawGarbageReports.value.filter(r => r.status === 'ACTIVE').length;
  const assumptionCollected = rawGarbageReports.value.filter(r => r.status === 'ASSUMPTION_COLLECTED').length;
  const collected = rawGarbageReports.value.filter(r => r.status === 'COLLECTED').length;
  return [
    { name: 'Reports', Active: active, 'Assumption Collected': assumptionCollected, Collected: collected }
  ]
})

const garbageReportsCategories = computed(() => ({
  Active: { name: 'Active', color: '#ef4444' },
  'Assumption Collected': { name: 'Assumption Collected', color: '#f59e0b' },
  Collected: { name: 'Collected', color: '#10b981' },
}))

const perCityChartData = computed(() => {
  return cities.value.map(city => {
    const truckCount = trucks.value.filter(t => t.city_id === city.id).length;
    const driverCount = drivers.value.filter(d => d.city_id === city.id).length;
    return {
      name: city.name,
      Trucks: truckCount,
      Drivers: driverCount
    };
  });
});

const perCityCategories = computed(() => ({
  Trucks: { name: 'Trucks', color: '#f59e0b' },
  Drivers: { name: 'Drivers', color: '#3b82f6' }
}));

const fetch = async () => {
  await Promise.all([
    getCities(),
    getCitiesOpt(),
    getBarangays(),
    getCollections(),
    getTrucks(),
    getAdmins(),
    getUsers(),
    getDrivers(),
    getReports(),
    getRawGarbageReports()
  ]);
}

watch(()=> selectedCity.value, async ()=> await fetch());

onBeforeMount(async () => await fetch());
</script>